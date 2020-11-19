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
import POINT_UPDATE_FS from './point-update.fs';
import POINT_UPDATE_VS from './point-update.vs';

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
  DEFAULT_DESELECT_ON_DBL_CLICK,
  DEFAULT_DESELECT_ON_ESCAPE,
  DEFAULT_DISTANCE,
  DEFAULT_EASING,
  DEFAULT_HEIGHT,
  DEFAULT_LASSO_COLOR,
  DEFAULT_LASSO_MIN_DELAY,
  DEFAULT_LASSO_MIN_DIST,
  DEFAULT_LASSO_CLEAR_EVENT,
  DEFAULT_SHOW_RECTICLE,
  DEFAULT_RECTICLE_COLOR,
  DEFAULT_POINT_OUTLINE_WIDTH,
  DEFAULT_POINT_SIZE,
  DEFAULT_POINT_SIZE_SELECTED,
  DEFAULT_SIZE_BY,
  DEFAULT_ROTATION,
  DEFAULT_TARGET,
  DEFAULT_VIEW,
  DEFAULT_WIDTH,
  EASING_FNS,
  FLOAT_BYTES,
  LASSO_CLEAR_EVENTS,
  LASSO_CLEAR_ON_DESELECT,
  LASSO_CLEAR_ON_END,
} from './constants';

import {
  checkReglExtensions,
  createRegl,
  createTextureFromUrl,
  dist,
  getBBox,
  isConditionalArray,
  isPositiveNumber,
  isMultipleColors,
  isPointInPolygon,
  isString,
  limit,
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
  const pubSub = createPubSub({
    async: !initialProperties.syncEvents,
    caseInsensitive: true,
  });
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
    deselectOnDblClick: initialDeselectOnDblClick = DEFAULT_DESELECT_ON_DBL_CLICK,
    deselectOnEscape: initialDeselectOnEscape = DEFAULT_DESELECT_ON_ESCAPE,
    lassoColor: initialLassoColor = DEFAULT_LASSO_COLOR,
    lassoMinDelay: initialLassoMinDelay = DEFAULT_LASSO_MIN_DELAY,
    lassoMinDist: initialLassoMinDist = DEFAULT_LASSO_MIN_DIST,
    lassoClearEvent: initialLassoClearEvent = DEFAULT_LASSO_CLEAR_EVENT,
    showRecticle: initialShowRecticle = DEFAULT_SHOW_RECTICLE,
    recticleColor: initialRecticleColor = DEFAULT_RECTICLE_COLOR,
    pointColor: initialPointColor = DEFAULT_COLOR_NORMAL,
    pointColorActive: initialPointColorActive = DEFAULT_COLOR_ACTIVE,
    pointColorHover: initialPointColorHover = DEFAULT_COLOR_HOVER,
    pointSize: initialPointSize = DEFAULT_POINT_SIZE,
    pointSizeSelected: initialPointSizeSelected = DEFAULT_POINT_SIZE_SELECTED,
    pointOutlineWidth: initialPointOutlineWidth = DEFAULT_POINT_OUTLINE_WIDTH,
    sizeBy: initialSizeBy = DEFAULT_SIZE_BY,
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
  let pointSize = isConditionalArray(initialPointSize, isPositiveNumber, {
    minLength: 1,
  })
    ? [...initialPointSize]
    : [initialPointSize];
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
  let lassoClearEvent = initialLassoClearEvent;
  let lassoPos = [];
  let lassoPoints = [];
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
  let deselectOnDblClick = initialDeselectOnDblClick;
  let deselectOnEscape = initialDeselectOnEscape;

  let pointColors = isMultipleColors(initialPointColor)
    ? [...initialPointColor]
    : [initialPointColor];
  let pointColorsActive = isMultipleColors(initialPointColorActive)
    ? [...initialPointColorActive]
    : [initialPointColorActive];
  let pointColorsHover = isMultipleColors(initialPointColorHover)
    ? [...initialPointColorHover]
    : [initialPointColorHover];

  pointColors = pointColors.map((color) => toRgba(color, true));
  pointColorsActive = pointColorsActive.map((color) => toRgba(color, true));
  pointColorsHover = pointColorsHover.map((color) => toRgba(color, true));

  let stateTex; // Stores the point texture holding x, y, category, and value
  let prevStateTex; // Stores the previous point texture. Used for transitions
  let tmpStateTex; // Stores a temporary point texture. Used for transitions
  let tmpStateBuffer; // Temporary frame buffer
  let stateTexRes = 0; // Width and height of the texture
  let normalPointsIndexBuffer; // Buffer holding the indices pointing to the correct texel
  let selectedPointsIndexBuffer; // Used for pointing to the selected texels
  let hoveredPointIndexBuffer; // Used for pointing to the hovered texels

  let isTransitioning = false;
  let transitionStartTime = null;
  let transitionRafId = null;
  let preTransitionShowRecticle = showRecticle;

  let colorTex; // Stores the point color texture
  let colorTexRes = 0; // Width and height of the texture
  let pointSizeTex; // Stores the point sizes
  let pointSizeTexRes = 0; // Width and height of the texture

  let colorBy = initialColorBy;
  let sizeBy = initialSizeBy;
  let isViewChanged = false;
  let isInit = false;

  let opacity = 1;

  let hoveredPoint;
  let isMouseInCanvas = false;

  let xScale = initialProperties.xScale || null;
  let yScale = initialProperties.yScale || null;
  let xDomainStart = 0;
  let xDomainSize = 0;
  let yDomainStart = 0;
  let yDomainSize = 0;
  if (xScale) {
    xDomainStart = xScale.domain()[0];
    xDomainSize = xScale.domain()[1] - xScale.domain()[0];
    xScale.range([0, width]);
  }
  if (yScale) {
    yDomainStart = yScale.domain()[0];
    yDomainSize = yScale.domain()[1] - yScale.domain()[0];
    yScale.range([height, 0]);
  }

  // Get a copy of the current mouse position
  const getMousePos = () => mousePosition.slice();

  const getNdcX = (x) => -1 + (x / width) * 2;

  const getNdcY = (y) => 1 + (y / height) * -2;

  // Get relative WebGL position
  const getMouseGlPos = () => [
    getNdcX(mousePosition[0]),
    getNdcY(mousePosition[1]),
  ];

  const getScatterGlPos = (xGl, yGl) => {
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
    const [xGl, yGl] = getMouseGlPos();
    const [x, y] = getScatterGlPos(xGl, yGl);

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
    const [xGl, yGl] = getMouseGlPos();

    if (!lassoPrevMousePos) {
      const point = getScatterGlPos(xGl, yGl);
      lassoPos = [...point];
      lassoPoints = [point];
      lassoPrevMousePos = currMousePos;
    } else {
      const d = dist(...currMousePos, ...lassoPrevMousePos);

      if (d > lassoMinDist) {
        const point = getScatterGlPos(xGl, yGl);
        lassoPos.push(...point);
        lassoPoints.push(point);
        lassoPrevMousePos = currMousePos;
        if (lassoPos.length > 2) {
          lasso.setPoints(lassoPos);
        }
      }
    }

    pubSub.publish('lassoExtend', { coordinates: lassoPoints });
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

  const lassoClear = () => {
    lassoPos = [];
    lassoPoints = [];
    if (lasso) lasso.clear();
  };

  const deselect = ({ preventEvent = false } = {}) => {
    if (lassoClearEvent === LASSO_CLEAR_ON_DESELECT) lassoClear();
    if (selection.length) {
      if (!preventEvent) pubSub.publish('deselect');
      selection = [];
      drawRaf(); // eslint-disable-line no-use-before-define
    }
  };

  const select = (points, { preventEvent = false } = {}) => {
    selection = points;

    selectedPointsIndexBuffer({
      usage: 'dynamic',
      type: 'float',
      data: new Float32Array(selection),
    });

    if (!preventEvent) pubSub.publish('select', { points: selection });

    drawRaf(); // eslint-disable-line no-use-before-define
  };

  const getRelativeMousePosition = (event) => {
    const rect = canvas.getBoundingClientRect();

    mousePosition[0] = event.clientX - rect.left;
    mousePosition[1] = event.clientY - rect.top;

    return [...mousePosition];
  };

  const lassoStart = () => {
    // Fix camera for the lasso selection
    camera.config({ isFixed: true });
    // Make sure we start a new lasso selection
    lassoPrevMousePos = undefined;
    lassoClear();
    pubSub.publish('lassoStart');
  };

  const lassoEnd = () => {
    camera.config({ isFixed: false });
    // const t0 = performance.now();
    const pointsInLasso = findPointsInLasso(lassoPos);
    // console.log(`found ${pointsInLasso.length} in ${performance.now() - t0} msec`);
    select(pointsInLasso);
    lassoPrevMousePos = undefined;
    pubSub.publish('lassoEnd', {
      coordinates: lassoPoints,
    });
    if (lassoClearEvent === LASSO_CLEAR_ON_END) lassoClear();
  };

  const mouseDownHandler = (event) => {
    if (!isInit) return;

    mouseDown = true;

    mouseDownPosition = getRelativeMousePosition(event);
    mouseDownShift = event.shiftKey;

    if (mouseDownShift) lassoStart();
  };

  const mouseUpHandler = () => {
    if (!isInit) return;

    mouseDown = false;

    if (mouseDownShift) {
      mouseDownShift = false;
      lassoEnd();
    }
  };

  const mouseClickHandler = (event) => {
    if (!isInit) return;

    const currentMousePosition = getRelativeMousePosition(event);
    const clickDist = dist(...currentMousePosition, ...mouseDownPosition);

    if (clickDist >= lassoMinDist) return;

    const clostestPoint = raycast();
    if (clostestPoint >= 0) select([clostestPoint]);
  };

  const mouseDblClickHandler = () => {
    if (deselectOnDblClick) deselect();
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

  const createPointSizeTexture = () => {
    const numPointSizes = pointSize.length;
    pointSizeTexRes = Math.max(2, Math.ceil(Math.sqrt(numPointSizes)));
    const rgba = new Float32Array(pointSizeTexRes ** 2 * 4);
    pointSize.forEach((size, i) => {
      rgba[i * 4] = size;
    });

    return regl.texture({
      data: rgba,
      shape: [pointSizeTexRes, pointSizeTexRes, 4],
      type: 'float',
    });
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

    if (colorTex) colorTex.destroy();

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

  const computeDomainView = () => {
    const xyStartPt = getScatterGlPos(-1, -1);
    const xyEndPt = getScatterGlPos(1, 1);

    const xStart = (xyStartPt[0] + 1) / 2;
    const xEnd = (xyEndPt[0] + 1) / 2;
    const yStart = (xyStartPt[1] + 1) / 2;
    const yEnd = (xyEndPt[1] + 1) / 2;

    const xDomainView = [
      xDomainStart + xStart * xDomainSize,
      xDomainStart + xEnd * xDomainSize,
    ];
    const yDomainView = [
      yDomainStart + yStart * yDomainSize,
      yDomainStart + yEnd * yDomainSize,
    ];

    return [xDomainView, yDomainView];
  };

  const updateScales = () => {
    if (!xScale && !yScale) return;

    const [xDomainView, yDomainView] = computeDomainView();

    if (xScale) xScale.domain(xDomainView);
    if (yScale) yScale.domain(yDomainView);
  };

  const setHeight = (newHeight) => {
    if (!+newHeight || +newHeight <= 0) return;
    height = +newHeight;
    canvas.height = height * window.devicePixelRatio;
    if (yScale) {
      yScale.range([height, 0]);
      updateScales();
    }
  };

  const setPointSize = (newPointSize) => {
    if (isConditionalArray(newPointSize, isPositiveNumber, { minLength: 1 }))
      pointSize = [...newPointSize];

    if (isPositiveNumber(+newPointSize)) pointSize = [+newPointSize];

    pointSizeTex = createPointSizeTexture();
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
    if (xScale) {
      xScale.range([0, width]);
      updateScales();
    }
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

    if (colorTex) colorTex.destroy();
    colorTex = createColorTexture();
  };

  const setSizeBy = (type) => {
    switch (type) {
      case 'category':
        sizeBy = 'category';
        break;

      case 'value':
        sizeBy = 'value';
        break;

      default:
        sizeBy = DEFAULT_SIZE_BY;
    }
  };

  const getBackgroundImage = () => backgroundImage;
  const getColorTex = () => colorTex;
  const getColorTexRes = () => colorTexRes;
  const getDevicePixelRatio = () => window.devicePixelRatio;
  const getNormalPointsIndexBuffer = () => normalPointsIndexBuffer;
  const getSelectedPointsIndexBuffer = () => selectedPointsIndexBuffer;
  const getPointSizeTex = () => pointSizeTex;
  const getPointSizeTexRes = () => pointSizeTexRes;
  const getNormalPointSizeExtra = () => 0;
  const getStateTex = () => tmpStateTex || stateTex;
  const getStateTexRes = () => stateTexRes;
  const getProjection = () => projection;
  const getView = () => camera.view;
  const getModel = () => model;
  const getScaling = () => camera.scaling;
  const getNormalNumPoints = () => numPoints;
  const getIsColoredByCategory = () => (colorBy === 'category') * 1;
  const getIsColoredByValue = () => (colorBy === 'value') * 1;
  const getIsSizedByCategory = () => (sizeBy === 'category') * 1;
  const getIsSizedByValue = () => (sizeBy === 'value') * 1;
  const getMaxColorTexIdx = () => pointColors.length - 1;
  const getMaxPointSizeTexIdx = () => pointSize.length;

  const updatePoints = regl({
    framebuffer: () => tmpStateBuffer,

    vert: POINT_UPDATE_VS,
    frag: POINT_UPDATE_FS,

    attributes: {
      position: [-4, 0, 4, 4, 4, -4],
    },

    uniforms: {
      startStateTex: () => prevStateTex,
      endStateTex: () => stateTex,
      t: (ctx, props) => props.t,
    },

    count: 3,
  });

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
        devicePixelRatio: getDevicePixelRatio,
        scaling: getScaling,
        pointSizeTex: getPointSizeTex,
        pointSizeTexRes: getPointSizeTexRes,
        pointSizeExtra: getPointSizeExtra,
        globalState,
        colorTex: getColorTex,
        colorTexRes: getColorTexRes,
        stateTex: getStateTex,
        stateTexRes: getStateTexRes,
        isColoredByCategory: getIsColoredByCategory,
        isColoredByValue: getIsColoredByValue,
        isSizedByCategory: getIsSizedByCategory,
        isSizedByValue: getIsSizedByValue,
        maxColorTexIdx: getMaxColorTexIdx,
        numColorStates: COLOR_NUM_STATES,
        maxPointSizeTexIdx: getMaxPointSizeTexIdx,
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
      uniform mat4 projection;
      uniform mat4 model;
      uniform mat4 view;
      attribute vec2 position;
      void main () {
        gl_Position = projection * view * model * vec4(position, 0, 1);
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
      projection: getProjection,
      model: getModel,
      view: getView,
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

  const cachePoints = (newPoints) => {
    if (!stateTex) return false;

    if (isTransitioning) {
      const tmp = prevStateTex;
      prevStateTex = tmpStateTex;
      tmp.destroy();
    } else {
      prevStateTex = stateTex;
    }

    tmpStateTex = createStateTexture(newPoints);
    tmpStateBuffer = regl.framebuffer({
      color: tmpStateTex,
      depth: false,
      stencil: false,
    });
    stateTex = undefined;

    return true;
  };

  const clearCachedPoints = () => {
    if (prevStateTex) {
      prevStateTex.destroy();
      prevStateTex = undefined;
    }

    if (tmpStateTex) {
      tmpStateTex.destroy();
      tmpStateTex = undefined;
    }
  };

  const setPoints = (newPoints) => {
    isInit = false;

    numPoints = newPoints.length;

    if (stateTex) stateTex.destroy();
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

  const draw = (showRecticleOnce) => {
    if (!isInit || !regl) return;

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

    lasso.draw({
      projection: getProjection(),
      model: getModel(),
      view: getView(),
    });

    // Publish camera change
    if (isViewChanged) {
      updateScales();

      pubSub.publish('view', {
        view: camera.view,
        camera,
        xScale,
        yScale,
      });
    }
  };

  const drawHandler = () => pubSub.publish('draw');

  const drawRaf = withRaf(draw, drawHandler);

  const tween = (duration, easing, drawArgs) => {
    if (!transitionStartTime) transitionStartTime = performance.now();

    const dt = performance.now() - transitionStartTime;

    updatePoints({ t: Math.min(1, Math.max(0, easing(dt / duration))) });

    draw.apply(drawArgs);
    pubSub.publish('draw');

    return dt < duration;
  };

  const endTransition = () => {
    isTransitioning = false;
    transitionStartTime = null;
    showRecticle = preTransitionShowRecticle;

    clearCachedPoints();

    pubSub.publish('transitionEnd');
  };

  const transition = (duration, easing, drawArgs) => {
    transitionRafId = window.requestAnimationFrame(() => {
      if (tween(duration, easing, drawArgs))
        transition(duration, easing, drawArgs);
      else endTransition();
    });
  };

  const startTransition = (
    { duration = 500, easing = DEFAULT_EASING },
    drawArgs = []
  ) => {
    const easingFn = isString(easing)
      ? EASING_FNS[easing] || DEFAULT_EASING
      : easing;

    if (isTransitioning) {
      pubSub.publish('transitionEnd');
      window.cancelAnimationFrame(transitionRafId);
    }

    isTransitioning = true;
    transitionStartTime = null;
    preTransitionShowRecticle = showRecticle;
    showRecticle = false;

    transition(duration, easingFn, drawArgs);
    pubSub.publish('transitionStart');
  };

  const publicDraw = (newPoints, options = {}) =>
    new Promise((resolve) => {
      let pointsCached = false;
      if (newPoints) {
        if (options.transition) {
          if (newPoints.length === numPoints) {
            pointsCached = cachePoints(newPoints);
          } else {
            console.warn(
              'Cannot transition! The number of points between the previous and current draw call must be identical.'
            );
          }
        }
        setPoints(newPoints);
      }

      if (transition && pointsCached) {
        pubSub.subscribe('transitionEnd', resolve, 1);
        startTransition(
          {
            duration: options.transitionDuration,
            easing: options.transitionEasing,
          },
          [options.showRecticleOnce]
        );
      } else {
        pubSub.subscribe('draw', resolve, 1);
        drawRaf(options.showRecticleOnce);
      }
    });

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
        pubSub.publish('backgroundImageReady');
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

  const setLassoClearEvent = (newLassoClearEvent) => {
    lassoClearEvent = limit(
      LASSO_CLEAR_EVENTS,
      lassoClearEvent
    )(newLassoClearEvent);
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

  const setXScale = (newXScale) => {
    if (!newXScale) return;

    xScale = newXScale;
    xDomainStart = newXScale.domain()[0];
    xDomainSize = newXScale ? newXScale.domain()[1] - newXScale.domain()[0] : 0;
  };

  const setYScale = (newYScale) => {
    if (!newYScale) return;

    yScale = newYScale;
    yDomainStart = yScale.domain()[0];
    yDomainSize = yScale ? yScale.domain()[1] - yScale.domain()[0] : 0;
  };

  const setDeselectOnDblClick = (newDeselectOnDblClick) => {
    deselectOnDblClick = !!newDeselectOnDblClick;
  };

  const setDeselectOnEscape = (newDeselectOnEscape) => {
    deselectOnEscape = !!newDeselectOnEscape;
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
    if (property === 'camera') return camera;
    if (property === 'cameraTarget') return camera.target;
    if (property === 'cameraDistance') return camera.distance;
    if (property === 'cameraRotation') return camera.rotation;
    if (property === 'cameraView') return camera.view;
    if (property === 'canvas') return canvas;
    if (property === 'colorBy') return colorBy;
    if (property === 'sizeBy') return sizeBy;
    if (property === 'deselectOnDblClick') return deselectOnDblClick;
    if (property === 'deselectOnEscape') return deselectOnEscape;
    if (property === 'height') return height;
    if (property === 'lassoColor') return lassoColor;
    if (property === 'lassoMinDelay') return lassoMinDelay;
    if (property === 'lassoMinDist') return lassoMinDist;
    if (property === 'lassoClearEvent') return lassoClearEvent;
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
    if (property === 'xScale') return xScale;
    if (property === 'yScale') return yScale;

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

    if (properties.pointSize !== undefined) {
      setPointSize(properties.pointSize);
    }

    if (properties.pointSizeSelected !== undefined) {
      setPointSizeSelected(properties.pointSizeSelected);
    }

    if (properties.sizeBy !== undefined) {
      setSizeBy(properties.sizeBy);
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

    if (properties.lassoClearEvent !== undefined) {
      setLassoClearEvent(properties.lassoClearEvent);
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

    if (properties.height !== undefined) {
      setHeight(properties.height);
    }

    if (properties.width !== undefined) {
      setWidth(properties.width);
    }

    if (properties.aspectRatio !== undefined) {
      setDataAspectRatio(properties.aspectRatio);
    }

    if (properties.xScale !== undefined) {
      setXScale(properties.xScale);
    }

    if (properties.yScale !== undefined) {
      setYScale(properties.yScale);
    }

    if (properties.deselectOnDblClick !== undefined) {
      setDeselectOnDblClick(properties.deselectOnDblClick);
    }

    if (properties.deselectOnEscape !== undefined) {
      setDeselectOnEscape(properties.deselectOnEscape);
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
      camera.setView(mat4.clone(initialCameraView || initialView));
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
      camera.setView(mat4.clone(DEFAULT_VIEW));
    }
  };

  const reset = () => {
    initCamera();
    updateScales();

    pubSub.publish('view', {
      view: camera.view,
      camera,
      xScale,
      yScale,
    });
  };

  const keyUpHandler = ({ key }) => {
    switch (key) {
      case 'Escape':
        if (deselectOnEscape) deselect();
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
    updateScales();

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
    pointSizeTex = createPointSizeTexture();

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
