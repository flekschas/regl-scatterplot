import createDom2dCamera from 'dom-2d-camera';
import KDBush from 'kdbush';
import createPubSub from 'pub-sub-es';
import withThrottle from 'lodash-es/throttle';
import withRaf from 'with-raf';
import { mat4, vec4 } from 'gl-matrix';
import createLine from 'regl-line';

import BG_FS from './bg.fs';
import BG_VS from './bg.vs';
import POINT_FS from './point.fs';
import POINT_VS from './point.vs';

import {
  COLOR_ACTIVE_IDX,
  COLOR_BG_IDX,
  COLOR_HOVER_IDX,
  COLOR_NORMAL_IDX,
  COLOR_NUM_STATES,
  DEFAULT_BACKGROUND_IMAGE,
  DEFAULT_COLOR_BG,
  DEFAULT_COLOR_BY,
  DEFAULT_COLOR_NORMAL,
  DEFAULT_COLOR_ACTIVE,
  DEFAULT_COLOR_HOVER,
  DEFAULT_DATA_ASPECT_RATIO,
  DEFAULT_DISTANCE,
  DEFAULT_HEIGHT,
  DEFAULT_LASSO_COLOR,
  DEFAULT_SHOW_RECTICLE,
  DEFAULT_RECTICLE_COLOR,
  DEFAULT_POINT_OUTLINE_WIDTH,
  DEFAULT_POINT_SIZE,
  DEFAULT_POINT_SIZE_SELECTED,
  DEFAULT_ROTATION,
  DEFAULT_TARGET,
  DEFAULT_VIEW,
  DEFAULT_WIDTH,
  FLOAT_BYTES,
  LASSO_MIN_DELAY,
  LASSO_MIN_DIST,
} from './constants';

import {
  checkReglExtensions,
  createRegl,
  createTextureFromUrl,
  dist,
  getBBox,
  isMultipleColors,
  isPointInPolygon,
  isString,
  toRgba,
  max,
  min,
} from './utils';

import { version } from '../package.json';

const deprecations = {
  background: 'backgroundColor',
  target: 'cameraTarget',
  distance: 'cameraDistance',
  rotation: 'cameraRotation',
  view: 'cameraView',
};

const checkDeprecations = (properties) => {
  Object.keys(properties)
    .filter((prop) => deprecations[prop])
    .forEach((name) => {
      console.warn(
        `regl-scatterplot: the "${name}" property is deprecated. Please use "${deprecations[name]}" instead.`
      );
    });
};

const createScatterplot = (initialProperties = {}) => {
  const pubSub = createPubSub();
  const scratch = new Float32Array(16);
  const mousePosition = [0, 0];

  checkDeprecations(initialProperties);

  const {
    regl: initialRegl,
    background: initialBackground,
    backgroundColor: initialBackgroundColor,
    backgroundImage: initialBackgroundImage = DEFAULT_BACKGROUND_IMAGE,
    cameraTarget: initialCameraTarget,
    cameraDistance: initialCameraDistance,
    cameraRotation: initialCameraRotation,
    cameraView: initialCameraView,
    canvas: initialCanvas = document.createElement('canvas'),
    colorBy: initialColorBy = DEFAULT_COLOR_BY,
    lassoColor: initialLassoColor = DEFAULT_LASSO_COLOR,
    lassoMinDelay: initialLassoMinDelay = LASSO_MIN_DELAY,
    lassoMinDist: initialLassoMinDist = LASSO_MIN_DIST,
    showRecticle: initialShowRecticle = DEFAULT_SHOW_RECTICLE,
    recticleColor: initialRecticleColor = DEFAULT_RECTICLE_COLOR,
    pointColor: initialPointColor = DEFAULT_COLOR_NORMAL,
    pointColorActive: initialPointColorActive = DEFAULT_COLOR_ACTIVE,
    pointColorHover: initialPointColorHover = DEFAULT_COLOR_HOVER,
    pointSize: initialPointSize = DEFAULT_POINT_SIZE,
    pointSizeSelected: initialPointSizeSelected = DEFAULT_POINT_SIZE_SELECTED,
    pointOutlineWidth: initialPointOutlineWidth = DEFAULT_POINT_OUTLINE_WIDTH,
    width: initialWidth = DEFAULT_WIDTH,
    height: initialHeight = DEFAULT_HEIGHT,
    target: initialTarget,
    distance: initialDistance,
    rotation: initialRotation,
    view: initialView,
  } = initialProperties;

  checkReglExtensions(initialRegl);

  let backgroundColor = toRgba(
    initialBackgroundColor || initialBackground || DEFAULT_COLOR_BG,
    true
  );
  let backgroundImage = null;
  let canvas = initialCanvas;
  let width = initialWidth;
  let height = initialHeight;
  let pointSize = initialPointSize;
  let pointSizeSelected = initialPointSizeSelected;
  let pointOutlineWidth = initialPointOutlineWidth;
  let regl = initialRegl || createRegl(initialCanvas);
  let camera;
  let lasso;
  let mouseDown = false;
  let mouseDownShift = false;
  let mouseDownPosition = [0, 0];
  let numPoints = 0;
  let selection = [];
  let lassoColor = toRgba(initialLassoColor, true);
  let lassoMinDelay = +initialLassoMinDelay;
  let lassoMinDist = +initialLassoMinDist;
  let lassoPos = [];
  let lassoPoints = [];
  let lassoScatterPos = [];
  let lassoPrevMousePos;
  let searchIndex;
  let viewAspectRatio;
  let dataAspectRatio = DEFAULT_DATA_ASPECT_RATIO;
  let projection;
  let model;
  let showRecticle = initialShowRecticle;
  let recticleHLine;
  let recticleVLine;
  let recticleColor = toRgba(initialRecticleColor, true);

  let pointColors = isMultipleColors(initialPointColor)
    ? initialPointColor
    : [initialPointColor];
  let pointColorsActive = isMultipleColors(initialPointColorActive)
    ? initialPointColorActive
    : [initialPointColorActive];
  let pointColorsHover = isMultipleColors(initialPointColorHover)
    ? initialPointColorHover
    : [initialPointColorHover];

  pointColors = pointColors.map((color) => toRgba(color, true));
  pointColorsActive = pointColorsActive.map((color) => toRgba(color, true));
  pointColorsHover = pointColorsHover.map((color) => toRgba(color, true));

  let stateTex; // Stores the point texture holding x, y, category, and value
  let stateTexRes = 0; // Width and height of the texture
  let normalPointsIndexBuffer; // Buffer holding the indices pointing to the correct texel
  let selectedPointsIndexBuffer; // Used for pointing to the selected texels
  let hoveredPointIndexBuffer; // Used for pointing to the hovered texels

  let colorTex; // Stores the color texture
  let colorTexRes = 0; // Width and height of the texture

  let colorBy = initialColorBy;
  let isViewChanged = false;
  let isInit = false;

  let opacity = 1;

  let hoveredPoint;
  let isMouseInCanvas = false;

  // Get a copy of the current mouse position
  const getMousePos = () => mousePosition.slice();

  const getNdcX = (x) => -1 + (x / width) * 2;

  const getNdcY = (y) => 1 + (y / height) * -2;

  // Get relative WebGL position
  const getMouseGlPos = () => [
    getNdcX(mousePosition[0]),
    getNdcY(mousePosition[1]),
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

    const scaling = camera.scaling;
    const scaledPointSize =
      2 *
      pointSize *
      (min(1.0, scaling) + Math.log2(max(1.0, scaling))) *
      window.devicePixelRatio;

    const xNormalizedScaledPointSize = scaledPointSize / width;
    const yNormalizedScaledPointSize = scaledPointSize / height;

    // Get all points within a close range
    const pointsInBBox = searchIndex.range(
      x - xNormalizedScaledPointSize,
      y - yNormalizedScaledPointSize,
      x + xNormalizedScaledPointSize,
      y + yNormalizedScaledPointSize
    );

    // Find the closest point
    let minDist = scaledPointSize;
    let clostestPoint;
    pointsInBBox.forEach((idx) => {
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
      const point = getMouseGlPos(currMousePos);
      lassoPos = [point[0], point[1]];
      lassoPoints = [point];
      lassoScatterPos = [...getScatterGlPos(currMousePos)];
      lassoPrevMousePos = currMousePos;
    } else {
      const d = dist(...currMousePos, ...lassoPrevMousePos);

      if (d > lassoMinDist) {
        const point = getMouseGlPos(currMousePos);
        lassoPos.push(point[0], point[1]);
        lassoPoints.push(point);
        lassoScatterPos.push(...getScatterGlPos(currMousePos));
        lassoPrevMousePos = currMousePos;
        if (lassoPos.length > 2) {
          lasso.setPoints(lassoPos);
        }
      }
    }
  };
  let lassoExtendDb = withThrottle(lassoExtend, lassoMinDelay);

  const findPointsInLasso = (lassoPolygon) => {
    // get the bounding box of the lasso selection...
    const bBox = getBBox(lassoPolygon);
    // ...to efficiently preselect potentially selected points
    const pointsInBBox = searchIndex.range(...bBox);
    // next we test each point in the bounding box if it is in the polygon too
    const pointsInPolygon = [];
    pointsInBBox.forEach((pointIdx) => {
      if (isPointInPolygon(searchIndex.points[pointIdx], lassoPolygon))
        pointsInPolygon.push(pointIdx);
    });

    return pointsInPolygon;
  };

  const deselect = () => {
    if (selection.length) {
      pubSub.publish('deselect');
      selection = [];
      drawRaf(); // eslint-disable-line no-use-before-define
    }
  };

  const select = (points) => {
    selection = points;

    selectedPointsIndexBuffer({
      usage: 'dynamic',
      type: 'float',
      data: new Float32Array(selection),
    });

    pubSub.publish('select', {
      points: selection,
    });

    drawRaf(); // eslint-disable-line no-use-before-define
  };

  const getRelativeMousePosition = (event) => {
    const rect = canvas.getBoundingClientRect();

    mousePosition[0] = event.clientX - rect.left;
    mousePosition[1] = event.clientY - rect.top;

    return [...mousePosition];
  };

  const lassoEnd = () => {
    // const t0 = performance.now();
    const pointsInLasso = findPointsInLasso(lassoScatterPos);
    // console.log(`found ${pointsInLasso.length} in ${performance.now() - t0} msec`);
    select(pointsInLasso);
    lassoPos = [];
    lassoPoints = [];
    lassoScatterPos = [];
    lassoPrevMousePos = undefined;
    lasso.clear();
  };

  const mouseDownHandler = (event) => {
    if (!isInit) return;

    mouseDown = true;

    mouseDownPosition = getRelativeMousePosition(event);
    mouseDownShift = event.shiftKey;

    if (mouseDownShift) {
      // Fix camera for the lasso selection
      camera.config({ isFixed: true });
      // Make sure we start a new lasso selection
      lassoPrevMousePos = undefined;
    }
  };

  const mouseUpHandler = () => {
    if (!isInit) return;

    mouseDown = false;

    if (mouseDownShift) {
      mouseDownShift = false;
      camera.config({ isFixed: false });
      lassoEnd();
    }
  };

  const mouseClickHandler = (event) => {
    if (!isInit) return;

    const currentMousePosition = getRelativeMousePosition(event);
    const clickDist = dist(...currentMousePosition, ...mouseDownPosition);

    if (clickDist >= LASSO_MIN_DIST) return;

    const clostestPoint = raycast();
    if (clostestPoint >= 0) select([clostestPoint]);
  };

  const mouseDblClickHandler = () => {
    deselect();
  };

  const mouseMoveHandler = (event) => {
    if (!isInit || (!isMouseInCanvas && !mouseDown)) return;

    getRelativeMousePosition(event);

    // Only ray cast if the mouse cursor is inside
    if (isMouseInCanvas && !mouseDownShift) {
      const clostestPoint = raycast();
      hover(clostestPoint); // eslint-disable-line no-use-before-define
    }

    if (mouseDownShift) lassoExtendDb();

    // Always redraw when mousedown as the user might have panned or lassoed
    if (mouseDown) drawRaf(); // eslint-disable-line no-use-before-define
  };

  const blurHandler = () => {
    if (!isInit) return;

    hoveredPoint = undefined;
    isMouseInCanvas = false;
    mouseUpHandler();
    drawRaf(); // eslint-disable-line no-use-before-define
  };

  const getColors = () => {
    const n = pointColors.length;
    const n2 = pointColorsActive.length;
    const n3 = pointColorsHover.length;
    const colors = [];
    if (n === n2 && n2 === n3) {
      for (let i = 0; i < n; i++) {
        colors.push(
          pointColors[i],
          pointColorsActive[i],
          pointColorsHover[i],
          backgroundColor
        );
      }
    } else {
      for (let i = 0; i < n; i++) {
        const rgbaOpaque = [
          pointColors[i][0],
          pointColors[i][1],
          pointColors[i][2],
          1,
        ];
        const colorActive =
          colorBy === DEFAULT_COLOR_BY ? pointColorsActive[0] : rgbaOpaque;
        const colorHover =
          colorBy === DEFAULT_COLOR_BY ? pointColorsHover[0] : rgbaOpaque;
        colors.push(pointColors[i], colorActive, colorHover, backgroundColor);
      }
    }
    return colors;
  };

  const createColorTexture = () => {
    const colors = getColors();
    const numColors = colors.length;
    colorTexRes = Math.max(2, Math.ceil(Math.sqrt(numColors)));
    const rgba = new Float32Array(colorTexRes ** 2 * 4);
    colors.forEach((color, i) => {
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
      type: 'float',
    });
  };

  const updateViewAspectRatio = () => {
    viewAspectRatio = width / height;
    projection = mat4.fromScaling([], [1 / viewAspectRatio, 1, 1]);
    model = mat4.fromScaling([], [dataAspectRatio, 1, 1]);
  };

  const setDataAspectRatio = (newDataAspectRatio) => {
    if (+newDataAspectRatio <= 0) return;
    dataAspectRatio = newDataAspectRatio;
  };

  const setColors = (getter, setter) => (newColors) => {
    if (!newColors || !newColors.length) return;

    const colors = getter();
    const prevColors = [...colors];

    let tmpColors = isMultipleColors(newColors) ? newColors : [newColors];
    tmpColors = tmpColors.map((color) => toRgba(color, true));

    try {
      setter(tmpColors);
      colorTex = createColorTexture();
    } catch (e) {
      console.error('Invalid colors. Switching back to default colors.');
      // eslint-disable-next-line no-param-reassign
      setter(prevColors);
      colorTex = createColorTexture();
    }
  };

  const setPointColors = setColors(
    () => pointColors,
    (colors) => {
      pointColors = colors;
    }
  );
  const setPointColorsActive = setColors(
    () => pointColorsActive,
    (colors) => {
      pointColorsActive = colors;
    }
  );
  const setPointColorsHover = setColors(
    () => pointColorsHover,
    (colors) => {
      pointColorsHover = colors;
    }
  );

  const setHeight = (newHeight) => {
    if (!+newHeight || +newHeight <= 0) return;
    height = +newHeight;
    canvas.height = height * window.devicePixelRatio;
  };

  const setPointSize = (newPointSize) => {
    if (!+newPointSize || +newPointSize <= 0) return;
    pointSize = +newPointSize;
  };

  const setPointSizeSelected = (newPointSizeSelected) => {
    if (!+newPointSizeSelected || +newPointSizeSelected < 0) return;
    pointSizeSelected = +newPointSizeSelected;
  };

  const setPointOutlineWidth = (newPointOutlineWidth) => {
    if (!+newPointOutlineWidth || +newPointOutlineWidth < 0) return;
    pointOutlineWidth = +newPointOutlineWidth;
  };

  const setWidth = (newWidth) => {
    if (!+newWidth || +newWidth <= 0) return;
    width = +newWidth;
    canvas.width = width * window.devicePixelRatio;
  };

  const setColorBy = (type) => {
    switch (type) {
      case 'category':
        colorBy = 'category';
        break;

      case 'value':
        colorBy = 'value';
        break;

      default:
        colorBy = DEFAULT_COLOR_BY;
    }
  };

  const setOpacity = (newOpacity) => {
    if (!+newOpacity || +newOpacity <= 0) return;

    opacity = +newOpacity;
    colorTex = createColorTexture();
  };

  const getBackgroundImage = () => backgroundImage;
  const getColorTex = () => colorTex;
  const getColorTexRes = () => colorTexRes;
  const getNormalPointsIndexBuffer = () => normalPointsIndexBuffer;
  const getSelectedPointsIndexBuffer = () => selectedPointsIndexBuffer;
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
  const getMaxColorTexIdx = () => pointColors.length - 1;

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
          dstAlpha: 'one minus src alpha',
        },
      },

      depth: { enable: false },

      attributes: {
        stateIndex: {
          buffer: getStateIndexBuffer,
          size: 1,
        },
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
        maxColorTexIdx: getMaxColorTexIdx,
        numColorStates: COLOR_NUM_STATES,
      },

      count: getNumPoints,

      primitive: 'points',
    });

  const drawPointBodies = drawPoints(
    getNormalPointSizeExtra,
    getNormalNumPoints,
    getNormalPointsIndexBuffer
  );

  const drawHoveredPoint = drawPoints(
    getNormalPointSizeExtra,
    () => 1,
    () => hoveredPointIndexBuffer,
    COLOR_HOVER_IDX
  );

  const drawSelectedPoint = () => {
    const numOutlinedPoints = selection.length;

    // Draw outer outline
    drawPoints(
      () =>
        (pointSizeSelected + pointOutlineWidth * 2) * window.devicePixelRatio,
      () => numOutlinedPoints,
      getSelectedPointsIndexBuffer,
      COLOR_ACTIVE_IDX
    )();

    // Draw inner outline
    drawPoints(
      () => (pointSizeSelected + pointOutlineWidth) * window.devicePixelRatio,
      () => numOutlinedPoints,
      getSelectedPointsIndexBuffer,
      COLOR_BG_IDX
    )();

    // Draw body
    drawPoints(
      () => pointSizeSelected,
      () => numOutlinedPoints,
      getSelectedPointsIndexBuffer,
      COLOR_ACTIVE_IDX
    )();
  };

  const drawBackgroundImage = regl({
    frag: BG_FS,
    vert: BG_VS,

    attributes: {
      position: [0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0],
    },

    uniforms: {
      projection: getProjection,
      model: getModel,
      view: getView,
      texture: getBackgroundImage,
    },

    count: 6,
  });

  const drawPolygon2d = regl({
    vert: `
      precision mediump float;
      attribute vec2 position;
      void main () {
        gl_Position = vec4(position, 0, 1);
      }`,

    frag: `
      precision mediump float;
      uniform vec4 color;
      void main () {
        gl_FragColor = vec4(color.rgb, 0.2);
      }`,

    depth: { enable: false },

    blend: {
      enable: true,
      func: {
        srcRGB: 'src alpha',
        srcAlpha: 'one',
        dstRGB: 'one minus src alpha',
        dstAlpha: 'one minus src alpha',
      },
    },

    attributes: {
      position: () => lassoPoints,
    },

    uniforms: {
      color: () => lassoColor,
    },

    elements: () =>
      Array(lassoPoints.length - 2)
        .fill()
        .map((_, i) => [0, i + 1, i + 2]),
  });

  const drawRecticle = () => {
    if (!(hoveredPoint >= 0)) return;

    const [x, y] = searchIndex.points[hoveredPoint].slice(0, 2);

    // Homogeneous coordinates of the point
    const v = [x, y, 0, 1];

    // We have to calculate the model-view-projection matrix outside of the
    // shader as we actually don't want the mode, view, or projection of the
    // line view space to change such that the recticle is visualized across the
    // entire view container and not within the view of the scatterplot
    mat4.multiply(
      scratch,
      projection,
      mat4.multiply(scratch, camera.view, model)
    );

    vec4.transformMat4(v, v, scratch);

    recticleHLine.setPoints([-1, v[1], 1, v[1]]);
    recticleVLine.setPoints([v[0], 1, v[0], -1]);

    recticleHLine.draw();
    recticleVLine.draw();

    // Draw outer outline
    drawPoints(
      () =>
        (pointSizeSelected + pointOutlineWidth * 2) * window.devicePixelRatio,
      () => 1,
      hoveredPointIndexBuffer,
      COLOR_ACTIVE_IDX
    )();

    // Draw inner outline
    drawPoints(
      () => (pointSizeSelected + pointOutlineWidth) * window.devicePixelRatio,
      () => 1,
      hoveredPointIndexBuffer,
      COLOR_BG_IDX
    )();
  };

  const createPointIndex = (numNewPoints) => {
    const index = new Float32Array(numNewPoints);

    for (let i = 0; i < numNewPoints; ++i) {
      index[i] = i;
    }

    return index;
  };

  const createStateTexture = (newPoints) => {
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
      type: 'float',
    });
  };

  const setPoints = (newPoints) => {
    isInit = false;

    numPoints = newPoints.length;

    stateTex = createStateTexture(newPoints);
    normalPointsIndexBuffer({
      usage: 'static',
      type: 'float',
      data: createPointIndex(numPoints),
    });

    searchIndex = new KDBush(
      newPoints,
      (p) => p[0],
      (p) => p[1],
      16
    );

    isInit = true;
  };

  const draw = (showRecticleOnce = false) => {
    if (!isInit) return;

    regl.clear({
      // background color (transparent)
      color: [0, 0, 0, 0],
      depth: 1,
    });

    // Update camera
    isViewChanged = camera.tick();

    if (backgroundImage) {
      drawBackgroundImage();
    }

    // The draw order of the following calls is important!
    drawPointBodies();
    if (!mouseDown && (showRecticle || showRecticleOnce)) drawRecticle();
    if (hoveredPoint >= 0) drawHoveredPoint();
    if (selection.length) drawSelectedPoint();

    if (lassoPoints.length > 2) drawPolygon2d();

    lasso.draw();

    // Publish camera change
    if (isViewChanged) pubSub.publish('view', camera.view);
  };

  const drawRaf = withRaf(draw);

  const publicDraw = (newPoints, showRecticleOnce = false) => {
    if (newPoints) setPoints(newPoints);
    drawRaf(showRecticleOnce);
  };

  const withDraw = (f) => (...args) => {
    const out = f(...args);
    drawRaf();
    return out;
  };

  const setBackgroundColor = (newBackgroundColor) => {
    if (!newBackgroundColor) return;

    backgroundColor = toRgba(newBackgroundColor, true);
  };

  const setBackgroundImage = (newBackgroundImage) => {
    if (!newBackgroundImage) {
      backgroundImage = null;
    } else if (isString(newBackgroundImage)) {
      createTextureFromUrl(regl, newBackgroundImage).then((texture) => {
        backgroundImage = texture;
        drawRaf();
        pubSub.publish('background-image-ready');
      });
    } else {
      backgroundImage = newBackgroundImage;
    }
  };

  const setCameraDistance = (distance) => {
    if (distance > 0) camera.lookAt(camera.target, distance, camera.rotation);
  };

  const setCameraRotation = (rotation) => {
    if (rotation !== null)
      camera.lookAt(camera.target, camera.distance, rotation);
  };

  const setCameraTarget = (target) => {
    if (target) camera.lookAt(target, camera.distance, camera.rotation);
  };

  const setCameraView = (view) => {
    if (view) camera.setView(view);
  };

  const setLassoColor = (newLassoColor) => {
    if (!newLassoColor) return;

    lassoColor = toRgba(newLassoColor, true);

    lasso.setStyle({ color: lassoColor });
  };

  const setLassoMinDelay = (newLassoMinDelay) => {
    if (!+newLassoMinDelay) return;

    lassoMinDelay = +newLassoMinDelay;
    lassoExtendDb = withThrottle(lassoExtend, lassoMinDelay);
  };

  const setLassoMinDist = (newLassoMinDist) => {
    if (!+newLassoMinDist) return;

    lassoMinDist = +newLassoMinDist;
  };

  const setShowRecticle = (newShowRecticle) => {
    if (newShowRecticle === null) return;

    showRecticle = newShowRecticle;
  };

  const setRecticleColor = (newRecticleColor) => {
    if (!newRecticleColor) return;

    recticleColor = toRgba(newRecticleColor, true);

    recticleHLine.setStyle({ color: recticleColor });
    recticleVLine.setStyle({ color: recticleColor });
  };

  /**
   * Update Regl's viewport, drawingBufferWidth, and drawingBufferHeight
   *
   * @description Call this method after the viewport has changed, e.g., width
   * or height have been altered
   */
  const refresh = () => {
    regl.poll();
    camera.refresh();
  };

  const get = (property) => {
    checkDeprecations({ property: true });

    if (property === 'aspectRatio') return dataAspectRatio;
    if (property === 'background') return backgroundColor;
    if (property === 'backgroundColor') return backgroundColor;
    if (property === 'backgroundImage') return backgroundImage;
    if (property === 'cameraTarget') return camera.target;
    if (property === 'cameraDistance') return camera.distance;
    if (property === 'cameraRotation') return camera.rotation;
    if (property === 'cameraView') return camera.view;
    if (property === 'canvas') return canvas;
    if (property === 'colorBy') return colorBy;
    if (property === 'height') return height;
    if (property === 'lassoColor') return lassoColor;
    if (property === 'opacity') return opacity;
    if (property === 'pointColor')
      return pointColors.length === 1 ? pointColors[0] : pointColors;
    if (property === 'pointColorActive')
      return pointColorsActive.length === 1
        ? pointColorsActive[0]
        : pointColorsActive;
    if (property === 'pointColorHover')
      return pointColorsHover.length === 1
        ? pointColorsHover[0]
        : pointColorsHover;
    if (property === 'pointOutlineWidth') return pointOutlineWidth;
    if (property === 'pointSize') return pointSize;
    if (property === 'pointSizeSelected') return pointSizeSelected;
    if (property === 'recticleColor') return recticleColor;
    if (property === 'regl') return regl;
    if (property === 'showRecticle') return showRecticle;
    if (property === 'version') return version;
    if (property === 'width') return width;

    return undefined;
  };

  const set = (properties = {}) => {
    checkDeprecations(properties);

    if (
      properties.backgroundColor !== undefined ||
      properties.background !== undefined
    ) {
      setBackgroundColor(properties.backgroundColor || properties.background);
    }

    if (properties.backgroundImage !== undefined) {
      setBackgroundImage(properties.backgroundImage);
    }

    if (properties.cameraTarget !== undefined) {
      setCameraTarget(properties.cameraTarget);
    }

    if (properties.cameraDistance !== undefined) {
      setCameraDistance(properties.cameraDistance);
    }

    if (properties.cameraRotation !== undefined) {
      setCameraRotation(properties.cameraRotation);
    }

    if (properties.cameraView !== undefined) {
      setCameraView(properties.cameraView);
    }

    if (properties.colorBy !== undefined) {
      setColorBy(properties.colorBy);
    }

    if (properties.pointColor !== undefined) {
      setPointColors(properties.pointColor);
    }

    if (properties.pointColorActive !== undefined) {
      setPointColorsActive(properties.pointColorActive);
    }

    if (properties.pointColorHover !== undefined) {
      setPointColorsHover(properties.pointColorHover);
    }

    if (properties.opacity !== undefined) {
      setOpacity(properties.opacity);
    }

    if (properties.lassoColor !== undefined) {
      setLassoColor(properties.lassoColor);
    }

    if (properties.lassoMinDelay !== undefined) {
      setLassoMinDelay(properties.lassoMinDelay);
    }

    if (properties.lassoMinDist !== undefined) {
      setLassoMinDist(properties.lassoMinDist);
    }

    if (properties.showRecticle !== undefined) {
      setShowRecticle(properties.showRecticle);
    }

    if (properties.recticleColor !== undefined) {
      setRecticleColor(properties.recticleColor);
    }

    if (properties.pointOutlineWidth !== undefined) {
      setPointOutlineWidth(properties.pointOutlineWidth);
    }

    if (properties.pointSize !== undefined) {
      setPointSize(properties.pointSize);
    }

    if (properties.pointSizeSelected !== undefined) {
      setPointSizeSelected(properties.pointSizeSelected);
    }

    if (properties.height !== undefined) {
      setHeight(properties.height);
    }

    if (properties.width !== undefined) {
      setWidth(properties.width);
    }

    if (properties.aspectRatio !== undefined) {
      setDataAspectRatio(properties.aspectRatio);
    }

    updateViewAspectRatio();
    camera.refresh();
    refresh();
    drawRaf();
  };

  const hover = (point, showRecticleOnce = false) => {
    let needsRedraw = false;

    if (point >= 0) {
      needsRedraw = true;
      const newHoveredPoint = point !== hoveredPoint;
      hoveredPoint = point;
      hoveredPointIndexBuffer.subdata([point]);
      if (newHoveredPoint) pubSub.publish('pointover', hoveredPoint);
    } else {
      needsRedraw = hoveredPoint;
      hoveredPoint = undefined;
      if (+needsRedraw >= 0) pubSub.publish('pointout', needsRedraw);
    }

    if (needsRedraw) drawRaf(null, showRecticleOnce);
  };

  const initCamera = () => {
    if (!camera) camera = createDom2dCamera(canvas);

    if (initialCameraView || initialView) {
      camera.set(mat4.clone(initialCameraView || initialView));
    } else if (
      initialCameraTarget ||
      initialTarget ||
      initialCameraDistance ||
      initialDistance ||
      initialCameraRotation ||
      initialRotation
    ) {
      camera.lookAt(
        [...(initialCameraTarget || initialTarget || DEFAULT_TARGET)],
        initialCameraDistance || initialDistance || DEFAULT_DISTANCE,
        initialCameraRotation || initialRotation || DEFAULT_ROTATION
      );
    } else {
      camera.set(mat4.clone(DEFAULT_VIEW));
    }
  };

  const reset = () => {
    initCamera();
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

  const mouseEnterCanvasHandler = () => {
    isMouseInCanvas = true;
  };

  const mouseLeaveCanvasHandler = () => {
    hover();
    isMouseInCanvas = false;
    drawRaf();
  };

  const wheelHandler = () => {
    drawRaf();
  };

  const clear = () => {
    setPoints([]);
  };

  const init = () => {
    updateViewAspectRatio();
    initCamera();

    lasso = createLine(regl, { color: lassoColor, width: 3, is2d: true });
    recticleHLine = createLine(regl, {
      color: recticleColor,
      width: 1,
      is2d: true,
    });
    recticleVLine = createLine(regl, {
      color: recticleColor,
      width: 1,
      is2d: true,
    });

    // Event listeners
    canvas.addEventListener('wheel', wheelHandler);

    // Buffers
    normalPointsIndexBuffer = regl.buffer();
    selectedPointsIndexBuffer = regl.buffer();
    hoveredPointIndexBuffer = regl.buffer({
      usage: 'dynamic',
      type: 'float',
      length: FLOAT_BYTES, // This buffer is fixed to exactly 1 point
    });

    colorTex = createColorTexture();

    // Set dimensions
    set({ backgroundImage: initialBackgroundImage, width, height });

    // Setup event handler
    window.addEventListener('keyup', keyUpHandler, false);
    window.addEventListener('blur', blurHandler, false);
    window.addEventListener('mouseup', mouseUpHandler, false);
    window.addEventListener('mousemove', mouseMoveHandler, false);
    canvas.addEventListener('mousedown', mouseDownHandler, false);
    canvas.addEventListener('mouseenter', mouseEnterCanvasHandler, false);
    canvas.addEventListener('mouseleave', mouseLeaveCanvasHandler, false);
    canvas.addEventListener('click', mouseClickHandler, false);
    canvas.addEventListener('dblclick', mouseDblClickHandler, false);
  };

  const destroy = () => {
    window.removeEventListener('keyup', keyUpHandler, false);
    window.removeEventListener('blur', blurHandler, false);
    window.removeEventListener('mouseup', mouseUpHandler, false);
    window.removeEventListener('mousemove', mouseMoveHandler, false);
    canvas.removeEventListener('mousedown', mouseDownHandler, false);
    canvas.removeEventListener('mouseenter', mouseEnterCanvasHandler, false);
    canvas.removeEventListener('mouseleave', mouseLeaveCanvasHandler, false);
    canvas.removeEventListener('click', mouseClickHandler, false);
    canvas.removeEventListener('dblclick', mouseDblClickHandler, false);
    canvas = undefined;
    camera = undefined;
    regl = undefined;
    lasso.destroy();
    pubSub.clear();
  };

  init(canvas);

  return {
    clear: withDraw(clear),
    createTextureFromUrl: (url) => createTextureFromUrl(regl, url),
    deselect,
    destroy,
    draw: publicDraw,
    get,
    hover,
    refresh,
    reset: withDraw(reset),
    select,
    set,
    subscribe: pubSub.subscribe,
    unsubscribe: pubSub.unsubscribe,
  };
};

export default createScatterplot;

export { createRegl, createTextureFromUrl };
