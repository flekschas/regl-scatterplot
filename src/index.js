import canvasCamera2d from 'canvas-camera-2d';
import KDBush from 'kdbush';
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

import {
  dist,
  getBBox,
  isRgb,
  isPointInPolygon,
  isRgba,
  toRgba,
  isSet,
  isString,
  loadImage
} from './utils';

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
  const mousePosition = [0, 0];

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
  let mousePressed;
  let mouseDown;
  let mouseDownShift = false;
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

  // Get a copy of the current mouse position
  const getMousePos = () => mousePosition.slice();

  const getNdcX = x => -1 + (x / width) * 2;

  const getNdcY = y => 1 + (y / height) * -2;

  // Get relative WebGL position
  const getMouseGlPos = () => [
    getNdcX(mousePosition[0]),
    getNdcY(mousePosition[1])
  ];

  const getScatterGlPos = () => {
    const [xGl, yGl] = getMouseGlPos();

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

  const findPointsInLasso = lassoPolygon => {
    // get the bounding box of the lasso selection...
    const bBox = getBBox(lassoPolygon);
    // ...to efficiently preselect potentially selected points
    const pointsInBBox = searchIndex.range(...bBox);
    // next we test each point in the bounding box if it is in the polygon too
    const pointsInPolygon = new Set();
    pointsInBBox.forEach(pointIdx => {
      if (isPointInPolygon(searchIndex.points[pointIdx], lassoPolygon))
        pointsInPolygon.add(pointIdx);
    });

    return pointsInPolygon;
  };

  const deselect = () => {
    if (selection.size) {
      pubSub.publish('deselect');
      selection = new Set();
      drawRaf(); // eslint-disable-line no-use-before-define
    }
  };

  const select = points => {
    selection = isSet(points) ? points : new Set(points);

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
    const pointsInLasso = findPointsInLasso(lassoScatterPos);
    // console.log(`found ${pointsInLasso.length} in ${performance.now() - t0} msec`);
    select(pointsInLasso);
    lassoPos = [];
    lassoScatterPos = [];
    lassoPrevMousePos = undefined;
    lasso.clear();
  };

  const mouseDownHandler = event => {
    mouseDown = true;
    mouseDownShift = event.shiftKey;

    // fix camera
    if (mouseDownShift) camera.config({ isFixed: true });
  };

  const mouseUpHandler = () => {
    mouseDown = false;

    if (mouseDownShift) {
      mouseDownShift = false;
      camera.config({ isFixed: false });
      lassoEnd();
    }
  };

  const mouseClickHandler = event => {
    const clostestPoint = raycast(
      getNdcX(event.clientX),
      getNdcY(event.clientY)
    );
    if (clostestPoint >= 0) select(new Set([clostestPoint]));
  };

  const mouseDblClickHandler = () => {
    deselect();
  };

  const mouseMoveHandler = event => {
    mousePosition[0] = event.clientX;
    mousePosition[1] = event.clientY;
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
    if (!+newPointSizeSelected || +newPointSizeSelected < 0) return;
    pointSizeSelected = +newPointSizeSelected;
  };

  const setPointOutlineWidth = newPointOutlineWidth => {
    if (!+newPointOutlineWidth || +newPointOutlineWidth < 0) return;
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
    const numOutlinedPoints = selection.size;

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
    if (selection.size) drawSelectedPoint();

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

  const initCamera = () => {
    camera = canvasCamera2d(canvas);

    if (initialView) camera.set(mat4.clone(initialView));
    else camera.lookAt([...initialTarget], initialDistance, initialRotation);
  };

  const init = () => {
    updateRatio();
    initCamera();

    lasso = createLine(regl, { width: 3, is2d: true });
    scroll = createScroll(canvas);

    // Event listeners
    scroll.on('scroll', () => {
      drawRaf(); // eslint-disable-line no-use-before-define
    });

    // Buffers
    stateIndexBuffer = regl.buffer();
    highlightIndexBuffer = regl.buffer();

    colorTex = createColorTexture();

    // Set dimensions
    attr({ width, height });

    // Setup event handler
    window.addEventListener('keyup', keyUpHandler, false);
    window.addEventListener('blur', mouseUpHandler, false);
    window.addEventListener('mousedown', mouseDownHandler, false);
    window.addEventListener('click', mouseClickHandler, false);
    window.addEventListener('dblclick', mouseDblClickHandler, false);
    window.addEventListener('mouseup', mouseUpHandler, false);
    window.addEventListener('mousemove', mouseMoveHandler, false);
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
