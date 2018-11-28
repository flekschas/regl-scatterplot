import canvasCamera2d from 'canvas-camera-2d';
import KDBush from 'kdbush';
import createMousePos from 'mouse-position';
import createMousePressed from 'mouse-pressed';
import createPubSub from 'pub-sub-es';
import createRegl from 'regl';
import withThrottle from 'lodash-es/throttle';
import withRaf from 'with-raf';
import { mat4, vec4 } from 'gl-matrix';
import createLine from 'regl-line';
import createScroll from 'scroll-speed';

import BG_FS from './bg.fs';
import BG_VS from './bg.vs';
import POINT_FS from './point.fs';
import POINT_VS from './point.vs';

import {
  CLICK_DELAY,
  LASSO_MIN_DELAY,
  LASSO_MIN_DIST,
  COLOR_NORMAL_IDX,
  COLOR_ACTIVE_IDX,
  COLOR_BG,
  COLOR_BG_IDX,
  COLOR_NUM_STATES,
  COLORS,
  FLOAT_BYTES,
  POINT_SIZE,
  POINT_SIZE_SELECTED,
  POINT_OUTLINE_WIDTH,
  WIDTH,
  HEIGHT,
  TARGET,
  DISTANCE,
  ROTATION,
  VIEW
} from './defaults';

import { dist, isRgb, isRgba, toRgba, isString, loadImage } from './utils';

const EXTENSIONS = ['OES_standard_derivatives', 'OES_texture_float'];

const createOwnRegl = canvas => {
  const gl = canvas.getContext('webgl');
  const extensions = [];

  // Needed to run the tests properly as the headless-gl doesn't support all
  // extensions, which is fine for the functional tests.
  EXTENSIONS.forEach(EXTENSION => {
    if (gl.getExtension(EXTENSION)) {
      extensions.push(EXTENSION);
    } else {
      console.warn(
        `WebGL: ${EXTENSION} extension not supported. Scatterplot might not render properly`
      );
    }
  });

  return createRegl({ gl, extensions });
};

const checkReglExtensions = regl => {
  if (!regl) return regl;
  EXTENSIONS.forEach(EXTENSION => {
    if (!regl.hasExtension(EXTENSION)) {
      console.warn(
        `WebGL: ${EXTENSION} extension not supported. Scatterplot might not render properly`
      );
    }
  });
  return regl;
};

const createScatterplot = ({
  regl: initialRegl,
  background: initialBackground = COLOR_BG,
  canvas: initialCanvas = document.createElement('canvas'),
  colors: initialColors = COLORS,
  pointSize: initialPointSize = POINT_SIZE,
  pointSizeSelected: initialPointSizeSelected = POINT_SIZE_SELECTED,
  pointOutlineWidth: initialPointOutlineWidth = POINT_OUTLINE_WIDTH,
  width: initialWidth = WIDTH,
  height: initialHeight = HEIGHT,
  target: initialTarget = TARGET,
  distance: initialDistance = DISTANCE,
  rotation: initialRotation = ROTATION,
  view: initialView = VIEW
} = {}) => {
  const pubSub = createPubSub();
  const scratch = new Float32Array(16);

  let background = toRgba(initialBackground, true);
  let canvas = initialCanvas;
  let colors = initialColors;
  let width = initialWidth;
  let height = initialHeight;
  let pointSize = initialPointSize;
  let pointSizeSelected = initialPointSizeSelected;
  let pointOutlineWidth = initialPointOutlineWidth;
  let regl = checkReglExtensions(initialRegl) || createOwnRegl(initialCanvas);
  let camera;
  let lasso;
  let scroll;
  let mousePosition;
  let mousePressed;
  let mouseDown;
  let mouseDownShift = false;
  let mouseDownTime;
  let mouseDownX;
  let mouseDownY;
  let numPoints = 0;
  let selection = [];
  let lassoPos = [];
  let lassoScatterPos = [];
  let lassoPrevMousePos;
  let searchIndex;
  let aspectRatio;
  let projection;
  let model;

  let stateTex; // Stores the point texture holding x, y, category, and value
  let stateTexRes = 0; // Width and height of the texture
  let stateIndexBuffer; // Buffer holding the indices pointing to the correct texel
  let highlightIndexBuffer; // Used for pointing to the highlighted texels

  let colorTex; // Stores the color texture
  let colorTexRes = 0; // Width and height of the texture

  let colorBy;
  let isViewChanged = false;
  let isInit = false;

  let opacity = 1;
  let backgroundImage;

  const getMousePos = () => {
    mousePosition.flush();
    return [mousePosition[0], mousePosition[1]];
  };

  const getMouseGlPos = ([x, y] = getMousePos()) => {
    // Get relative WebGL position
    const xGl = -1 + (x / width) * 2;
    const yGl = 1 + (y / height) * -2;

    return [xGl, yGl];
  };

  const getScatterGlPos = ([x, y] = getMousePos()) => {
    const [xGl, yGl] = getMouseGlPos([x, y]);

    // Homogeneous vector
    const v = [xGl, yGl, 1, 1];

    // projection^-1 * view^-1 * model^-1 is the same as
    // model * view^-1 * projection
    const mvp = mat4.invert(
      scratch,
      mat4.multiply(
        scratch,
        projection,
        mat4.multiply(scratch, camera.view, model)
      )
    );

    // Translate vector
    vec4.transformMat4(v, v, mvp);

    return v.slice(0, 2);
  };

  const raycast = () => {
    const [x, y] = getScatterGlPos();
    const pointGlSize = (pointSize / width) * window.devicePixelRatio;

    // Get all points within a close range
    const pointsInBBox = searchIndex.range(
      x - pointGlSize,
      y - pointGlSize,
      x + pointGlSize,
      y + pointGlSize
    );

    // Find the closest point
    let minDist = Infinity;
    let clostestPoint;
    pointsInBBox.forEach(idx => {
      const [ptX, ptY] = searchIndex.points[idx];
      const d = dist(ptX, ptY, x, y);
      if (d < minDist) {
        minDist = d;
        clostestPoint = idx;
      }
    });

    if (minDist < (pointSize / width) * 2) return clostestPoint;
    return -1;
  };

  const lassoExtend = () => {
    const currMousePos = getMousePos();

    if (!lassoPrevMousePos) {
      lassoPos.push(...getMouseGlPos(currMousePos));
      lassoScatterPos.push(...getScatterGlPos(currMousePos));
      lassoPrevMousePos = currMousePos;
    } else {
      const d = dist(...currMousePos, ...lassoPrevMousePos);

      if (d > LASSO_MIN_DIST) {
        lassoPos.push(...getMouseGlPos(currMousePos));
        lassoScatterPos.push(...getScatterGlPos(currMousePos));
        lassoPrevMousePos = currMousePos;
        if (lassoPos.length > 2) {
          lasso.setPoints(lassoPos);
          drawRaf(); // eslint-disable-line no-use-before-define
        }
      }
    }
  };
  const lassoDb = withThrottle(lassoExtend, LASSO_MIN_DELAY, true);

  const getBBox = pos => {
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;

    for (let i = 0; i < pos.length; i += 2) {
      xMin = pos[i] < xMin ? pos[i] : xMin;
      xMax = pos[i] > xMax ? pos[i] : xMax;
      yMin = pos[i + 1] < yMin ? pos[i + 1] : yMin;
      yMax = pos[i + 1] > yMax ? pos[i + 1] : yMax;
    }

    return [xMin, yMin, xMax, yMax];
  };

  /**
   * From: https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
   * @param   {Array}  point  Tuple of the form `[x,y]` to be tested.
   * @param   {Array}  polygon  1D list of vertices defining the polygon.
   * @return  {boolean}  If `true` point lies within the polygon.
   */
  const pointInPoly = ([px, py] = [], polygon) => {
    let x1;
    let y1;
    let x2;
    let y2;
    let isWithin = false;
    for (let i = 0, j = polygon.length - 2; i < polygon.length; i += 2) {
      x1 = polygon[i];
      y1 = polygon[i + 1];
      x2 = polygon[j];
      y2 = polygon[j + 1];
      if (y1 > py !== y2 > py && px < ((x2 - x1) * (py - y1)) / (y2 - y1) + x1)
        isWithin = !isWithin;
      j = i;
    }
    return isWithin;
  };

  const findPointsInLasso = lassoPolygon => {
    // get the bounding box of the lasso selection...
    const bBox = getBBox(lassoPolygon);
    // ...to efficiently preselect potentially selected points
    const pointsInBBox = searchIndex.range(...bBox);
    // next we test each point in the bounding box if it is in the polygon too
    const ptsInPoly = [];
    pointsInBBox.forEach(pointIdx => {
      if (pointInPoly(searchIndex.points[pointIdx], lassoPolygon))
        ptsInPoly.push(pointIdx);
    });

    return ptsInPoly;
  };

  const deselect = () => {
    if (selection.length) {
      pubSub.publish('deselect');
      selection = [];
      drawRaf(); // eslint-disable-line no-use-before-define
    }
  };

  const select = points => {
    selection = points;

    highlightIndexBuffer({
      usage: 'dynamic',
      type: 'float',
      length: FLOAT_BYTES,
      data: new Float32Array(selection)
    });

    pubSub.publish('select', {
      points: selection
    });

    drawRaf(); // eslint-disable-line no-use-before-define
  };

  const lassoEnd = () => {
    // const t0 = performance.now();
    const ptsInLasso = findPointsInLasso(lassoScatterPos);
    // console.log(`found ${ptsInLasso.length} in ${performance.now() - t0} msec`);
    select(ptsInLasso);
    lassoPos = [];
    lassoScatterPos = [];
    lassoPrevMousePos = undefined;
    lasso.clear();
  };

  const mouseDownHandler = event => {
    mouseDown = true;
    mouseDownShift = event.shiftKey;
    mouseDownTime = performance.now();

    // fix camera
    if (mouseDownShift) camera.config({ isFixed: true });

    // Get the mouse cursor position
    mousePosition.flush();

    // Get relative webgl coordinates
    const { 0: x, 1: y } = mousePosition;
    mouseDownX = -1 + (x / width) * 2;
    mouseDownY = 1 + (y / height) * -2;
  };

  const mouseUpHandler = () => {
    mouseDown = false;

    if (mouseDownShift) {
      mouseDownShift = false;
      camera.config({ isFixed: false });
      lassoEnd();
    } else if (performance.now() - mouseDownTime <= CLICK_DELAY) {
      const clostestPoint = raycast(mouseDownX, mouseDownY);
      if (clostestPoint >= 0) select([clostestPoint]);
      else deselect();
    }
  };

  const mouseMoveHandler = () => {
    if (mouseDown) drawRaf(); // eslint-disable-line no-use-before-define
    if (mouseDownShift) lassoDb();
  };

  const createColorTexture = (newColors = colors) => {
    const numColors = newColors.length;
    colorTexRes = Math.max(2, Math.ceil(Math.sqrt(numColors)));
    const rgba = new Float32Array(colorTexRes ** 2 * 4);
    newColors.forEach((color, i) => {
      rgba[i * 4] = color[0]; // r
      rgba[i * 4 + 1] = color[1]; // g
      rgba[i * 4 + 2] = color[2]; // b
      // For all normal state colors check if the global opacity is not 1 and
      // if so use that instead.
      rgba[i * 4 + 3] =
        i % COLOR_NUM_STATES > 0 || opacity === 1 ? color[3] : opacity; // a
    });

    return regl.texture({
      data: rgba,
      shape: [colorTexRes, colorTexRes, 4],
      type: 'float'
    });
  };

  const destroy = () => {
    canvas = undefined;
    camera = undefined;
    regl = undefined;
    lasso.destroy();
    scroll.dispose();
    mousePosition.dispose();
    mousePressed.dispose();
    pubSub.clear();
  };

  const updateRatio = () => {
    aspectRatio = width / height;
    projection = mat4.fromScaling([], [1 / aspectRatio, 1, 1]);
    model = mat4.fromScaling([], [aspectRatio, 1, 1]);
  };

  const setColors = newColors => {
    if (!newColors || !newColors.length) return;

    const tmp = [];
    try {
      newColors.forEach(color => {
        if (Array.isArray(color) && !isRgb(color) && !isRgba(color)) {
          // Assuming color is an array of HEX colors
          for (let j = 0; j < 3; j++) {
            tmp.push(toRgba(color[j], true));
          }
        } else {
          const rgba = toRgba(color, true);
          const rgbaOpaque = [...rgba.slice(0, 3), 1];
          tmp.push(rgba, rgbaOpaque, rgbaOpaque); // normal, active, and hover
        }
        tmp.push(background);
      });
    } catch (e) {
      console.error(
        e,
        'Invalid format. Please specify an array of colors or a nested array of accents per colors.'
      );
    }
    colors = tmp;

    try {
      colorTex = createColorTexture();
    } catch (e) {
      colors = COLORS;
      colorTex = createColorTexture();
      console.error('Invalid colors. Switching back to default colors.');
    }
  };
  const setHeight = newHeight => {
    if (!+newHeight || +newHeight <= 0) return;
    height = +newHeight;
    canvas.height = height * window.devicePixelRatio;
  };

  const setPointSize = newPointSize => {
    if (!+newPointSize || +newPointSize <= 0) return;
    pointSize = +newPointSize;
  };

  const setPointSizeSelected = newPointSizeSelected => {
    if (!+newPointSizeSelected || +newPointSizeSelected <= 0) return;
    pointSizeSelected = +newPointSizeSelected;
  };

  const setPointOutlineWidth = newPointOutlineWidth => {
    if (!+newPointOutlineWidth || +newPointOutlineWidth <= 0) return;
    pointOutlineWidth = +newPointOutlineWidth;
  };

  const setWidth = newWidth => {
    if (!+newWidth || +newWidth <= 0) return;
    width = +newWidth;
    canvas.width = width * window.devicePixelRatio;
  };

  const setColorBy = (type, newColors) => {
    if (newColors) setColors(newColors);

    switch (type) {
      case 'category':
        colorBy = 'category';
        break;

      case 'value':
        colorBy = 'value';
        break;

      default:
        colorBy = undefined;
    }
  };

  const setOpacity = newOpacity => {
    if (!+newOpacity || +newOpacity <= 0) return;

    opacity = +newOpacity;
    colorTex = createColorTexture();
  };

  const getBackgroundImage = () => backgroundImage;
  const getColorTex = () => colorTex;
  const getColorTexRes = () => colorTexRes;
  const getNormalStateIndexBuffer = () => stateIndexBuffer;
  const getHighlightIndexBuffer = () => highlightIndexBuffer;
  const getPointSize = () => pointSize * window.devicePixelRatio;
  const getNormalPointSizeExtra = () => 0;
  const getStateTex = () => stateTex;
  const getStateTexRes = () => stateTexRes;
  const getProjection = () => projection;
  const getView = () => camera.view;
  const getModel = () => model;
  const getScaling = () => camera.scaling;
  const getNormalNumPoints = () => numPoints;
  const getIsColoredByCategory = () => (colorBy === 'category') * 1;
  const getIsColoredByValue = () => (colorBy === 'value') * 1;
  const getMaxColor = () => colors.length / COLOR_NUM_STATES - 1;
  const getNumColorStates = () => COLOR_NUM_STATES;

  const drawPoints = (
    getPointSizeExtra,
    getNumPoints,
    getStateIndexBuffer,
    globalState = COLOR_NORMAL_IDX
  ) =>
    regl({
      frag: POINT_FS,
      vert: POINT_VS,

      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 'one',
          dstRGB: 'one minus src alpha',
          dstAlpha: 'one minus src alpha'
        }
      },

      depth: { enable: false },

      attributes: {
        stateIndex: {
          buffer: getStateIndexBuffer,
          size: 1
        }
      },

      uniforms: {
        projection: getProjection,
        model: getModel,
        view: getView,
        scaling: getScaling,
        pointSize: getPointSize,
        pointSizeExtra: getPointSizeExtra,
        globalState,
        colorTex: getColorTex,
        colorTexRes: getColorTexRes,
        stateTex: getStateTex,
        stateTexRes: getStateTexRes,
        isColoredByCategory: getIsColoredByCategory,
        isColoredByValue: getIsColoredByValue,
        maxColor: getMaxColor,
        numColorStates: getNumColorStates
      },

      count: getNumPoints,

      primitive: 'points'
    });

  const drawPointBodies = drawPoints(
    getNormalPointSizeExtra,
    getNormalNumPoints,
    getNormalStateIndexBuffer
  );

  const drawSelectedPoint = () => {
    const numOutlinedPoints = selection.length;

    // Draw outer outline
    drawPoints(
      () =>
        (pointSizeSelected + pointOutlineWidth * 2) * window.devicePixelRatio,
      () => numOutlinedPoints,
      getHighlightIndexBuffer,
      COLOR_ACTIVE_IDX
    )();

    // Draw inner outline
    drawPoints(
      () => (pointSizeSelected + pointOutlineWidth) * window.devicePixelRatio,
      () => numOutlinedPoints,
      getHighlightIndexBuffer,
      COLOR_BG_IDX
    )();

    // Draw body
    drawPoints(
      () => pointSizeSelected,
      () => numOutlinedPoints,
      getHighlightIndexBuffer,
      COLOR_ACTIVE_IDX
    )();
  };

  const drawBackgroundImage = regl({
    frag: BG_FS,
    vert: BG_VS,
    attributes: {
      position: [0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0]
    },
    uniforms: {
      projection: getProjection,
      model: getModel,
      view: getView,
      texture: getBackgroundImage
    },
    count: 6
  });

  const createStateIndex = numNewPoints => {
    const index = new Float32Array(numNewPoints);

    for (let i = 0; i < numNewPoints; ++i) {
      index[i] = i;
    }

    return index;
  };

  const createStateTexture = newPoints => {
    const numNewPoints = newPoints.length;
    stateTexRes = Math.max(2, Math.ceil(Math.sqrt(numNewPoints)));
    const data = new Float32Array(stateTexRes ** 2 * 4);

    for (let i = 0; i < numNewPoints; ++i) {
      data[i * 4] = newPoints[i][0]; // x
      data[i * 4 + 1] = newPoints[i][1]; // y
      data[i * 4 + 2] = newPoints[i][2] || 0; // category
      data[i * 4 + 3] = newPoints[i][3] || 0; // value
    }

    return regl.texture({
      data,
      shape: [stateTexRes, stateTexRes, 4],
      type: 'float'
    });
  };

  const setPoints = newPoints => {
    numPoints = newPoints.length;

    stateTex = createStateTexture(newPoints);
    stateIndexBuffer({
      usage: 'static',
      type: 'float',
      length: FLOAT_BYTES,
      data: createStateIndex(numPoints)
    });

    searchIndex = new KDBush(newPoints);

    isInit = true;
  };

  const draw = newPoints => {
    if (newPoints) setPoints(newPoints);
    if (!isInit) return;

    regl.clear({
      // background color (transparent)
      color: [0, 0, 0, 0],
      depth: 1
    });

    // Update camera
    isViewChanged = camera.tick();

    if (backgroundImage) drawBackgroundImage();

    // Draw the points
    drawPointBodies();
    if (selection.length) drawSelectedPoint();

    lasso.draw();

    // Publish camera change
    if (isViewChanged) pubSub.publish('view', camera.view);
  };

  const drawRaf = withRaf(draw);

  const withDraw = f => (...args) => {
    const out = f(...args);
    drawRaf();
    return out;
  };

  const setBackground = newBackground => {
    if (!newBackground) return;

    background = toRgba(newBackground);
  };

  const setBackgroundImage = newBackgroundImage => {
    if (!newBackgroundImage) {
      backgroundImage = newBackgroundImage;
    } else if (isString(newBackgroundImage) || newBackgroundImage.src) {
      const imgSrc = isString(newBackgroundImage)
        ? newBackgroundImage
        : newBackgroundImage.src;

      loadImage(imgSrc, newBackgroundImage.crossOrigin)
        .then(image => {
          backgroundImage = regl.texture(image);
          drawRaf();
        })
        .catch(error => {
          console.error(`Could not load background image.`, error);
        });
    } else if (typeof newBackgroundImage === 'function') {
      backgroundImage = newBackgroundImage;
    }
  };

  /**
   * Update Regl's viewport, drawingBufferWidth, and drawingBufferHeight
   *
   * @description Call this method after the viewport has changed, e.g., width
   * or height have been altered
   */
  const refresh = () => {
    regl.poll();
  };

  const style = arg => {
    if (typeof arg === 'string') {
      if (arg === 'background') return background;
      if (arg === 'backgroundImage') return backgroundImage;
      if (arg === 'colorBy') return colorBy;
      if (arg === 'colors') return colors;
      if (arg === 'opacity') return opacity;
      if (arg === 'pointOutlineWidth') return pointOutlineWidth;
      if (arg === 'pointSize') return pointSize;
      if (arg === 'pointSizeSelected') return pointSizeSelected;
    }

    if (typeof arg === 'object') {
      const {
        background: newBackground = null,
        backgroundImage: newBackgroundImage = null,
        colorBy: newColorBy = null,
        colors: newColors = null,
        opacity: newOpacity = null,
        pointOutlineWidth: newPointOutlineWidth = null,
        pointSize: newPointSize = null,
        pointSizeSelected: newPointSizeSelected = null
      } = arg;
      setBackground(newBackground);
      setBackgroundImage(newBackgroundImage);
      setColorBy(newColorBy);
      setColors(newColors);
      setOpacity(newOpacity);
      setPointOutlineWidth(newPointOutlineWidth);
      setPointSize(newPointSize);
      setPointSizeSelected(newPointSizeSelected);
      drawRaf();
    }

    return undefined;
  };

  const attr = (arg = {}) => {
    if (typeof arg === 'string') {
      if (arg === 'width') return width;
      if (arg === 'height') return height;
    }

    if (typeof arg === 'object') {
      const { height: newHeight = null, width: newWidth = null } = arg;
      setHeight(newHeight);
      setWidth(newWidth);
      updateRatio();
      camera.refresh();
      refresh();
      drawRaf();
    }

    return undefined;
  };

  const reset = () => {
    if (initialView) camera.set(mat4.clone(initialView));
    else camera.lookAt([...initialTarget], initialDistance, initialRotation);
    pubSub.publish('view', camera.view);
  };

  const keyUpHandler = ({ key }) => {
    switch (key) {
      case 'Escape':
        deselect();
        break;
      default:
      // Nothing
    }
  };

  updateRatio();

  window.addEventListener('keyup', keyUpHandler, false);
  window.addEventListener('blur', mouseUpHandler, false);

  const initCamera = () => {
    camera = canvasCamera2d(canvas);

    if (initialView) camera.set(mat4.clone(initialView));
    else camera.lookAt([...initialTarget], initialDistance, initialRotation);
  };

  const init = () => {
    initCamera();

    lasso = createLine(regl, { width: 3, is2d: true });
    scroll = createScroll(canvas);
    mousePosition = createMousePos(canvas);
    mousePressed = createMousePressed(canvas);

    // Event listeners
    scroll.on('scroll', () => {
      drawRaf(); // eslint-disable-line no-use-before-define
    });
    mousePosition.on('move', mouseMoveHandler);
    mousePressed.on('down', mouseDownHandler);
    mousePressed.on('up', mouseUpHandler);

    // Buffers
    stateIndexBuffer = regl.buffer();
    highlightIndexBuffer = regl.buffer();

    colorTex = createColorTexture();

    // Set dimensions
    attr({ width, height });
  };

  init(canvas);

  return {
    get canvas() {
      return canvas;
    },
    get version() {
      return VERSION;
    },
    attr,
    deselect,
    destroy,
    draw: drawRaf,
    refresh,
    reset: withDraw(reset),
    select,
    style,
    subscribe: pubSub.subscribe,
    unsubscribe: pubSub.unsubscribe
  };
};

export default createScatterplot;

export { createOwnRegl as createRegl };
