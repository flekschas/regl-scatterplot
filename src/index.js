import createDom2dCamera from 'dom-2d-camera';
import KDBush from 'kdbush';
import createPubSub from 'pub-sub-es';
import withRaf from 'with-raf';
import { mat4, vec4 } from 'gl-matrix';
import createLine from 'regl-line';
import { unionIntegers } from '@flekschas/utils';

import createLassoManager from './lasso-manager';

import BG_FS from './bg.fs';
import BG_VS from './bg.vs';
import POINT_FS from './point.fs';
import POINT_SIMPLE_FS from './point-simple.fs';
import POINT_VS from './point.vs';
import POINT_UPDATE_FS from './point-update.fs';
import POINT_UPDATE_VS from './point-update.vs';

import createSplineCurve from './spline-curve';

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
  DEFAULT_POINT_CONNECTION_COLOR_NORMAL,
  DEFAULT_POINT_CONNECTION_COLOR_ACTIVE,
  DEFAULT_POINT_CONNECTION_COLOR_HOVER,
  DEFAULT_POINT_CONNECTION_COLOR_BY,
  DEFAULT_POINT_CONNECTION_SIZE,
  DEFAULT_POINT_CONNECTION_SIZE_SELECTED,
  DEFAULT_POINT_CONNECTION_SIZE_BY,
  DEFAULT_POINT_CONNECTION_MAX_INT_POINTS_PER_SEGMENT,
  DEFAULT_POINT_CONNECTION_INT_POINTS_TOLERANCE,
  DEFAULT_SHOW_POINT_CONNECTIONS,
  DEFAULT_POINT_OUTLINE_WIDTH,
  DEFAULT_POINT_SIZE,
  DEFAULT_POINT_SIZE_SELECTED,
  DEFAULT_POINT_SIZE_MOUSE_DETECTION,
  DEFAULT_SIZE_BY,
  DEFAULT_ROTATION,
  DEFAULT_TARGET,
  DEFAULT_VIEW,
  DEFAULT_WIDTH,
  DEFAULT_PERFORMANCE_MODE,
  EASING_FNS,
  FLOAT_BYTES,
  LASSO_CLEAR_EVENTS,
  LASSO_CLEAR_ON_DESELECT,
  LASSO_CLEAR_ON_END,
  DEFAULT_LASSO_INITIATOR,
  KEY_ACTION_LASSO,
  KEY_ACTION_ROTATE,
  KEY_ACTION_MERGE,
  KEY_ACTIONS,
  KEY_ALT,
  KEY_CMD,
  KEY_CTRL,
  KEY_META,
  KEY_SHIFT,
  KEYS,
  DEFAULT_KEY_MAP,
  MOUSE_MODE_PANZOOM,
  MOUSE_MODE_LASSO,
  MOUSE_MODE_ROTATE,
  MOUSE_MODES,
  DEFAULT_MOUSE_MODE,
  SINGLE_CLICK_DELAY,
  LONG_CLICK_TIME,
  DEFAULT_OPACITY,
  DEFAULT_OPACITY_BY,
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
  flipObj,
  rgbBrightness,
} from './utils';

import { version } from '../package.json';

const deprecations = {};

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
  const pvm = new Float32Array(16);
  const mousePosition = [0, 0];

  checkDeprecations(initialProperties);

  let {
    regl,
    backgroundColor = DEFAULT_COLOR_BG,
    backgroundImage = DEFAULT_BACKGROUND_IMAGE,
    canvas = document.createElement('canvas'),
    colorBy = DEFAULT_COLOR_BY,
    deselectOnDblClick = DEFAULT_DESELECT_ON_DBL_CLICK,
    deselectOnEscape = DEFAULT_DESELECT_ON_ESCAPE,
    lassoColor = DEFAULT_LASSO_COLOR,
    lassoMinDelay = DEFAULT_LASSO_MIN_DELAY,
    lassoMinDist = DEFAULT_LASSO_MIN_DIST,
    lassoClearEvent = DEFAULT_LASSO_CLEAR_EVENT,
    lassoInitiator = DEFAULT_LASSO_INITIATOR,
    lassoInitiatorParentElement = document.body,
    keyMap = DEFAULT_KEY_MAP,
    mouseMode = DEFAULT_MOUSE_MODE,
    showRecticle = DEFAULT_SHOW_RECTICLE,
    recticleColor = DEFAULT_RECTICLE_COLOR,
    pointColor = DEFAULT_COLOR_NORMAL,
    pointColorActive = DEFAULT_COLOR_ACTIVE,
    pointColorHover = DEFAULT_COLOR_HOVER,
    showPointConnections = DEFAULT_SHOW_POINT_CONNECTIONS,
    pointConnectionColor = DEFAULT_POINT_CONNECTION_COLOR_NORMAL,
    pointConnectionColorActive = DEFAULT_POINT_CONNECTION_COLOR_ACTIVE,
    pointConnectionColorHover = DEFAULT_POINT_CONNECTION_COLOR_HOVER,
    pointConnectionColorBy = DEFAULT_POINT_CONNECTION_COLOR_BY,
    pointConnectionSize = DEFAULT_POINT_CONNECTION_SIZE,
    pointConnectionSizeSelected = DEFAULT_POINT_CONNECTION_SIZE_SELECTED,
    pointConnectionSizeBy = DEFAULT_POINT_CONNECTION_SIZE_BY,
    pointConnectionMaxIntPointsPerSegment = DEFAULT_POINT_CONNECTION_MAX_INT_POINTS_PER_SEGMENT,
    pointConnectionTolerance = DEFAULT_POINT_CONNECTION_INT_POINTS_TOLERANCE,
    pointSize = DEFAULT_POINT_SIZE,
    pointSizeSelected = DEFAULT_POINT_SIZE_SELECTED,
    pointSizeMouseDetection = DEFAULT_POINT_SIZE_MOUSE_DETECTION,
    pointOutlineWidth = DEFAULT_POINT_OUTLINE_WIDTH,
    opacity = DEFAULT_OPACITY,
    opacityBy = DEFAULT_OPACITY_BY,
    sizeBy = DEFAULT_SIZE_BY,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
  } = initialProperties;

  // The following properties cannod be changed after the initialization
  const { performanceMode = DEFAULT_PERFORMANCE_MODE } = initialProperties;

  checkReglExtensions(regl);

  regl ||= createRegl(canvas);

  backgroundColor = toRgba(backgroundColor, true);
  lassoColor = toRgba(lassoColor, true);
  recticleColor = toRgba(recticleColor, true);

  pointSize = isConditionalArray(pointSize, isPositiveNumber, {
    minLength: 1,
  })
    ? [...pointSize]
    : [pointSize];

  const fboRes = [
    Math.floor(width * window.devicePixelRatio),
    Math.floor(height * window.devicePixelRatio),
  ];
  const fbo = regl.framebuffer({
    width: fboRes[0],
    height: fboRes[1],
    colorType: 'float',
  });
  let backgroundColorBrightness = rgbBrightness(backgroundColor);
  let camera;
  let lasso;
  let mouseDown = false;
  let selection = [];
  const selectionSet = new Set();
  let mouseDownTime = null;
  let mouseDownPosition = [0, 0];
  let numPoints = 0;
  let lassoActive = false;
  let lassoPointsCurr = [];
  let searchIndex;
  let viewAspectRatio;
  let dataAspectRatio = DEFAULT_DATA_ASPECT_RATIO;
  let projection;
  let model;
  let pointConnections;
  let pointConnectionMap;
  let computingPointConnectionCurves;
  let recticleHLine;
  let recticleVLine;
  let computedPointSizeMouseDetection;
  let keyActionMap = flipObj(keyMap);
  let lassoInitiatorTimeout;

  pointColor = isMultipleColors(pointColor) ? [...pointColor] : [pointColor];
  pointColorActive = isMultipleColors(pointColorActive)
    ? [...pointColorActive]
    : [pointColorActive];
  pointColorHover = isMultipleColors(pointColorHover)
    ? [...pointColorHover]
    : [pointColorHover];

  pointColor = pointColor.map((color) => toRgba(color, true));
  pointColorActive = pointColorActive.map((color) => toRgba(color, true));
  pointColorHover = pointColorHover.map((color) => toRgba(color, true));

  pointConnectionColor = toRgba(pointConnectionColor, true);
  pointConnectionColorActive = toRgba(pointConnectionColorActive, true);
  pointConnectionColorHover = toRgba(pointConnectionColorHover, true);

  let stateTex; // Stores the point texture holding x, y, category, and value
  let prevStateTex; // Stores the previous point texture. Used for transitions
  let tmpStateTex; // Stores a temporary point texture. Used for transitions
  let tmpStateBuffer; // Temporary frame buffer
  let stateTexRes = 0; // Width and height of the texture
  let stateTexEps = 0; // Half a texel
  let normalPointsIndexBuffer; // Buffer holding the indices pointing to the correct texel
  let selectedPointsIndexBuffer; // Used for pointing to the selected texels
  let hoveredPointIndexBuffer; // Used for pointing to the hovered texels

  let isTransitioning = false;
  let transitionStartTime = null;
  let transitionRafId = null;
  let preTransitionShowRecticle = showRecticle;

  let colorTex; // Stores the point color texture
  let colorTexRes = 0; // Width and height of the texture
  let encodingTex; // Stores the point sizes and opacity values
  let encodingTexRes = 0; // Width and height of the texture

  let isViewChanged = false;
  let isInit = false;

  let maxValueZ = 0;
  let maxValueW = 0;

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
    const [xNdc, yNdc] = getScatterGlPos(xGl, yGl);

    // eslint-disable-next-line no-use-before-define
    const pointScale = getPointScale();

    // The height of the view in normalized device coordinates
    const heightNdc = getScatterGlPos(1, 1)[1] - getScatterGlPos(-1, -1)[1];
    // The size of a pixel in the current view in normalized device coordinates
    const pxNdc = heightNdc / height;
    // The scaled point size in normalized device coordinates
    const pointSizeNdc =
      computedPointSizeMouseDetection * pointScale * pxNdc * 0.66;

    // Get all points within a close range
    const pointsInBBox = searchIndex.range(
      xNdc - pointSizeNdc,
      yNdc - pointSizeNdc,
      xNdc + pointSizeNdc,
      yNdc + pointSizeNdc
    );

    // Find the closest point
    let minDist = pointSizeNdc;
    let clostestPoint;
    pointsInBBox.forEach((idx) => {
      const [ptX, ptY] = searchIndex.points[idx];
      const d = dist(ptX, ptY, xNdc, yNdc);
      if (d < minDist) {
        minDist = d;
        clostestPoint = idx;
      }
    });

    if (minDist < (computedPointSizeMouseDetection / width) * 2)
      return clostestPoint;
    return -1;
  };

  const lassoExtend = (lassoPoints, lassoPointsFlat) => {
    lassoPointsCurr = lassoPoints;
    lasso.setPoints(lassoPointsFlat);
    pubSub.publish('lassoExtend', { coordinates: lassoPoints });
  };

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
    lassoPointsCurr = [];
    if (lasso) lasso.clear();
  };

  const hasPointConnections = (point) => point && point.length > 4;

  const setPointConnectionColorState = (pointIdxs, stateIndex) => {
    if (
      computingPointConnectionCurves ||
      !showPointConnections ||
      !hasPointConnections(searchIndex.points[pointIdxs[0]])
    )
      return;

    // Get line IDs
    const lineIds = Object.keys(
      pointIdxs.reduce((ids, pointIdx) => {
        const point = searchIndex.points[pointIdx];
        const isStruct = Array.isArray(point[4]);
        const lineId = isStruct ? point[4][0] : point[4];

        ids[lineId] = true;

        return ids;
      }, {})
    );

    lineIds.forEach((lineId) => {
      const index = pointConnectionMap[lineId][0];
      const numPointPerLine = pointConnectionMap[lineId][2];
      const pointOffset = pointConnectionMap[lineId][3];

      const bufferStart = index * 4 + pointOffset * 2;
      const bufferEnd = bufferStart + numPointPerLine * 2 + 4;

      const buffer = pointConnections.getData().colorIndices;

      for (let i = bufferStart; i < bufferEnd; i++) {
        buffer[i] = Math.floor(buffer[i] / 4) * 4 + stateIndex;
      }
    });

    pointConnections
      .getBuffer()
      .colorIndices.subdata(pointConnections.getData().colorIndices, 0);
  };

  const indexToStateTexCoord = (index) => [
    (index % stateTexRes) / stateTexRes + stateTexEps,
    Math.floor(index / stateTexRes) / stateTexRes + stateTexEps,
  ];

  const deselect = ({ preventEvent = false } = {}) => {
    if (lassoClearEvent === LASSO_CLEAR_ON_DESELECT) lassoClear();
    if (selection.length) {
      if (!preventEvent) pubSub.publish('deselect');
      setPointConnectionColorState(selection, 0);
      selection = [];
      selectionSet.clear();
      drawRaf(); // eslint-disable-line no-use-before-define
    }
  };

  const select = (pointIdxs, { merge = false, preventEvent = false } = {}) => {
    if (merge) {
      selection = unionIntegers(selection, pointIdxs);
    } else {
      // Unset previously highlight point connections
      if (selection && selection.length)
        setPointConnectionColorState(selection, 0);
      selection = pointIdxs;
    }

    const selectionBuffer = new Float32Array(selection.length * 2);

    selectionSet.clear();
    selection.forEach((pointIdx, i) => {
      selectionSet.add(pointIdx);
      const texCoords = indexToStateTexCoord(pointIdx);
      selectionBuffer[i * 2] = texCoords[0];
      selectionBuffer[i * 2 + 1] = texCoords[1];
    });

    selectedPointsIndexBuffer({
      usage: 'dynamic',
      type: 'float',
      data: selectionBuffer,
    });

    setPointConnectionColorState(selection, 1);

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
    mouseDown = true;
    lassoActive = true;
    lassoClear();
    pubSub.publish('lassoStart');
  };

  const lassoEnd = (lassoPoints, lassoPointsFlat, { merge = false } = {}) => {
    if (mouseMode === MOUSE_MODE_PANZOOM) camera.config({ isFixed: false });
    lassoPointsCurr = [...lassoPoints];
    // const t0 = performance.now();
    const pointsInLasso = findPointsInLasso(lassoPointsFlat);
    // console.log(`found ${pointsInLasso.length} in ${performance.now() - t0} msec`);
    select(pointsInLasso, { merge });
    pubSub.publish('lassoEnd', {
      coordinates: lassoPointsCurr,
    });
    if (lassoClearEvent === LASSO_CLEAR_ON_END) lassoClear();
  };

  const lassoManager = createLassoManager(canvas, {
    onStart: lassoStart,
    onDraw: lassoExtend,
    onEnd: lassoEnd,
    enableInitiator: lassoInitiator,
    initiatorParentElement: lassoInitiatorParentElement,
    pointNorm: ([x, y]) => getScatterGlPos(getNdcX(x), getNdcY(y)),
  });

  const checkLassoMode = () => mouseMode === MOUSE_MODE_LASSO;

  const checkModKey = (event, action) => {
    switch (keyActionMap[action]) {
      case KEY_ALT:
        return event.altKey;

      case KEY_CMD:
        return event.metaKey;

      case KEY_CTRL:
        return event.ctrlKey;

      case KEY_META:
        return event.metaKey;

      case KEY_SHIFT:
        return event.shiftKey;

      default:
        return false;
    }
  };

  const mouseDownHandler = (event) => {
    if (!isInit) return;

    mouseDown = true;
    mouseDownTime = performance.now();

    mouseDownPosition = getRelativeMousePosition(event);
    lassoActive = checkLassoMode() || checkModKey(event, KEY_ACTION_LASSO);
  };

  const mouseUpHandler = (event) => {
    if (!isInit) return;

    mouseDown = false;

    if (lassoActive) {
      lassoActive = false;
      lassoManager.end({
        merge: checkModKey(event, KEY_ACTION_MERGE),
      });
    }
  };

  const mouseClickHandler = (event) => {
    if (!isInit) return;

    const currentMousePosition = getRelativeMousePosition(event);

    if (dist(...currentMousePosition, ...mouseDownPosition) >= lassoMinDist)
      return;

    const clickTime = performance.now() - mouseDownTime;

    if (lassoInitiator && clickTime > LONG_CLICK_TIME) {
      // Show lasso initiator on long click immideately
      lassoManager.showInitiator(event);
    } else {
      // If the user clicked normally (i.e., fast) we'll only show the lasso
      // initiator if the use click into the void
      const clostestPoint = raycast();
      if (clostestPoint >= 0) {
        if (selection.length && lassoClearEvent === LASSO_CLEAR_ON_DESELECT) {
          // Special case where we silently "deselect" the previous points by
          // overriding the selection. Hence, we need to clear the lasso.
          lassoClear();
        }
        select([clostestPoint], {
          merge: checkModKey(event, KEY_ACTION_MERGE),
        });
      } else if (!lassoInitiatorTimeout) {
        // We'll also wait to make sure the user didn't double click
        lassoInitiatorTimeout = setTimeout(() => {
          lassoInitiatorTimeout = null;
          lassoManager.showInitiator(event);
        }, SINGLE_CLICK_DELAY);
      }
    }
  };

  const mouseDblClickHandler = () => {
    if (lassoInitiatorTimeout) {
      clearTimeout(lassoInitiatorTimeout);
      lassoInitiatorTimeout = null;
    }
    if (deselectOnDblClick) deselect();
  };

  const mouseMoveHandler = (event) => {
    if (!isInit || (!isMouseInCanvas && !mouseDown)) return;

    getRelativeMousePosition(event);

    // Only ray cast if the mouse cursor is inside
    if (isMouseInCanvas && !lassoActive) {
      const clostestPoint = raycast();
      hover(clostestPoint); // eslint-disable-line no-use-before-define
    }

    if (lassoActive) lassoManager.extend(event, true);

    // Always redraw when mousedown as the user might have panned or lassoed
    if (mouseDown) drawRaf(); // eslint-disable-line no-use-before-define
  };

  const blurHandler = () => {
    if (!isInit) return;

    if (+hoveredPoint >= 0 && !selectionSet.has(hoveredPoint))
      setPointConnectionColorState([hoveredPoint], 0);
    hoveredPoint = undefined;
    isMouseInCanvas = false;
    mouseUpHandler();
    drawRaf(); // eslint-disable-line no-use-before-define
  };

  const createEncodingTexture = () => {
    const maxEncoding = Math.max(pointSize.length, opacity.length);

    encodingTexRes = Math.max(2, Math.ceil(Math.sqrt(maxEncoding)));
    const rgba = new Float32Array(encodingTexRes ** 2 * 4);

    for (let i = 0; i < maxEncoding; i++) {
      rgba[i * 4] = pointSize[i] || 0;
      rgba[i * 4 + 1] = opacity[i] || 0;
    }

    return regl.texture({
      data: rgba,
      shape: [encodingTexRes, encodingTexRes, 4],
      type: 'float',
    });
  };

  const getColors = (
    baseColor = pointColor,
    activeColor = pointColorActive,
    hoverColor = pointColorHover
  ) => {
    const n = baseColor.length;
    const n2 = activeColor.length;
    const n3 = hoverColor.length;
    const colors = [];
    if (n === n2 && n2 === n3) {
      for (let i = 0; i < n; i++) {
        colors.push(
          baseColor[i],
          activeColor[i],
          hoverColor[i],
          backgroundColor
        );
      }
    } else {
      for (let i = 0; i < n; i++) {
        const rgbaOpaque = [
          baseColor[i][0],
          baseColor[i][1],
          baseColor[i][2],
          1,
        ];
        const colorActive =
          colorBy === DEFAULT_COLOR_BY ? activeColor[0] : rgbaOpaque;
        const colorHover =
          colorBy === DEFAULT_COLOR_BY ? hoverColor[0] : rgbaOpaque;
        colors.push(baseColor[i], colorActive, colorHover, backgroundColor);
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
      rgba[i * 4 + 3] = color[3]; // a
    });

    return regl.texture({
      data: rgba,
      shape: [colorTexRes, colorTexRes, 4],
      type: 'float',
    });
  };

  const updateFbo = () => {
    fboRes[0] = Math.floor(width * window.devicePixelRatio);
    fboRes[1] = Math.floor(height * window.devicePixelRatio);
    fbo.resize(...fboRes);
  };

  const updateViewAspectRatio = () => {
    viewAspectRatio = width / height;
    projection = mat4.fromScaling([], [1 / viewAspectRatio, 1, 1]);
    model = mat4.fromScaling([], [dataAspectRatio, 1, 1]);
    updateFbo();
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

  const setPointColor = setColors(
    () => pointColor,
    (colors) => {
      pointColor = colors;
    }
  );
  const setPointColorActive = setColors(
    () => pointColorActive,
    (colors) => {
      pointColorActive = colors;
    }
  );
  const setPointColorHover = setColors(
    () => pointColorHover,
    (colors) => {
      pointColorHover = colors;
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

  const computePointSizeMouseDetection = () => {
    computedPointSizeMouseDetection = pointSizeMouseDetection;

    if (pointSizeMouseDetection === 'auto') {
      computedPointSizeMouseDetection = Array.isArray(pointSize)
        ? pointSize[Math.floor(pointSize.length / 2)]
        : pointSize;
    }
  };

  const setPointSize = (newPointSize) => {
    if (isConditionalArray(newPointSize, isPositiveNumber, { minLength: 1 }))
      pointSize = [...newPointSize];

    if (isPositiveNumber(+newPointSize)) pointSize = [+newPointSize];

    encodingTex = createEncodingTexture();
    computePointSizeMouseDetection();
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

  const setOpacity = (newOpacity) => {
    if (isConditionalArray(newOpacity, isPositiveNumber, { minLength: 1 }))
      opacity = [...newOpacity];

    if (isPositiveNumber(+newOpacity)) opacity = [+newOpacity];

    encodingTex = createEncodingTexture();
  };

  const getEncodingType = (type, defaultValue) => {
    switch (type) {
      case 'category':
      case 'value1':
      case 'valueA':
      case 'valueZ':
      case 'z':
        return 'valueZ'; // Z refers to the 3rd component of the RGBA value

      case 'value':
      case 'value2':
      case 'valueB':
      case 'valueW':
      case 'w':
        return 'valueW'; // W refers to the 4th component of the RGBA value

      default:
        return defaultValue;
    }
  };

  const setColorBy = (type) => {
    colorBy = getEncodingType(type, DEFAULT_COLOR_BY);
  };

  const setOpacityBy = (type) => {
    opacityBy = getEncodingType(type, DEFAULT_OPACITY_BY);
  };

  const setSizeBy = (type) => {
    sizeBy = getEncodingType(type, DEFAULT_SIZE_BY);
  };

  const getBackgroundImage = () => backgroundImage;
  const getColorTex = () => colorTex;
  const getColorTexRes = () => colorTexRes;
  const getColorTexEps = () => 0.5 / colorTexRes;
  const getDevicePixelRatio = () => window.devicePixelRatio;
  const getNormalPointsIndexBuffer = () => normalPointsIndexBuffer;
  const getSelectedPointsIndexBuffer = () => selectedPointsIndexBuffer;
  const getEncodingTex = () => encodingTex;
  const getEncodingTexRes = () => encodingTexRes;
  const getEncodingTexEps = () => 0.5 / encodingTexRes;
  const getNormalPointSizeExtra = () => 0;
  const getStateTex = () => tmpStateTex || stateTex;
  const getStateTexRes = () => stateTexRes;
  const getStateTexEps = () => 0.5 / stateTexRes;
  const getProjection = () => projection;
  const getView = () => camera.view;
  const getModel = () => model;
  const getProjectionViewModel = () =>
    mat4.multiply(pvm, projection, mat4.multiply(pvm, camera.view, model));
  const getPointScale = () =>
    min(1.0, camera.scaling) +
    Math.log2(max(1.0, camera.scaling)) * window.devicePixelRatio;
  const getNormalNumPoints = () => numPoints;
  const getIsColoredByZ = () => +(colorBy === 'valueZ');
  const getIsColoredByW = () => +(colorBy === 'valueW');
  const getIsOpacityByZ = () => +(opacityBy === 'valueZ');
  const getIsOpacityByW = () => +(opacityBy === 'valueW');
  const getIsSizedByZ = () => +(sizeBy === 'valueZ');
  const getIsSizedByW = () => +(sizeBy === 'valueW');
  const getColorMultiplicator = () => {
    if (colorBy === 'valueZ') return maxValueZ <= 1 ? pointColor.length - 1 : 1;
    return maxValueW <= 1 ? pointColor.length - 1 : 1;
  };
  const getOpacityMultiplicator = () => {
    if (opacityBy === 'valueZ') return maxValueZ <= 1 ? opacity.length - 1 : 1;
    return maxValueW <= 1 ? opacity.length - 1 : 1;
  };
  const getSizeMultiplicator = () => {
    if (sizeBy === 'valueZ') return maxValueZ <= 1 ? pointSize.length - 1 : 1;
    return maxValueW <= 1 ? pointSize.length - 1 : 1;
  };

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

  const copyToScreen = regl({
    vert: `
      precision highp float;
      attribute vec2 xy;
      void main () {
        gl_Position = vec4(xy, 0, 1);
      }`,
    frag: `
      precision highp float;
      uniform vec2 srcRes;
      uniform sampler2D src;

      void main () {
        gl_FragColor = texture2D(src, gl_FragCoord.xy / srcRes);
      }`,
    attributes: {
      xy: [-4, -4, 4, -4, 0, 4],
    },
    uniforms: {
      src: () => fbo,
      srcRes: () => fboRes,
    },
    count: 3,
    depth: { enable: false },
  });

  const drawPoints = (
    getPointSizeExtra,
    getNumPoints,
    getStateIndexBuffer,
    globalState = COLOR_NORMAL_IDX
  ) =>
    regl({
      frag: performanceMode ? POINT_SIMPLE_FS : POINT_FS,
      vert: POINT_VS,

      blend: {
        enable: !performanceMode,
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
          size: 2,
        },
      },

      uniforms: {
        projectionViewModel: getProjectionViewModel,
        devicePixelRatio: getDevicePixelRatio,
        pointScale: getPointScale,
        encodingTex: getEncodingTex,
        encodingTexRes: getEncodingTexRes,
        encodingTexEps: getEncodingTexEps,
        pointSizeExtra: getPointSizeExtra,
        globalState,
        colorTex: getColorTex,
        colorTexRes: getColorTexRes,
        colorTexEps: getColorTexEps,
        stateTex: getStateTex,
        stateTexRes: getStateTexRes,
        stateTexEps: getStateTexEps,
        isColoredByZ: getIsColoredByZ,
        isColoredByW: getIsColoredByW,
        isOpacityByZ: getIsOpacityByZ,
        isOpacityByW: getIsOpacityByW,
        isSizedByZ: getIsSizedByZ,
        isSizedByW: getIsSizedByW,
        colorMultiplicator: getColorMultiplicator,
        opacityMultiplicator: getOpacityMultiplicator,
        sizeMultiplicator: getSizeMultiplicator,
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
      projectionViewModel: getProjectionViewModel,
      texture: getBackgroundImage,
    },

    count: 6,
  });

  const drawPolygon2d = regl({
    vert: `
      precision mediump float;
      uniform mat4 projectionViewModel;
      attribute vec2 position;
      void main () {
        gl_Position = projectionViewModel * vec4(position, 0, 1);
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
      position: () => lassoPointsCurr,
    },

    uniforms: {
      projectionViewModel: getProjectionViewModel,
      color: () => lassoColor,
    },

    elements: () =>
      Array(lassoPointsCurr.length - 2)
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
    const index = new Float32Array(numNewPoints * 2);

    let j = 0;
    for (let i = 0; i < numNewPoints; ++i) {
      const texCoord = indexToStateTexCoord(i);
      index[j] = texCoord[0]; // x
      index[j + 1] = texCoord[1]; // y
      j += 2;
    }

    return index;
  };

  const createStateTexture = (newPoints) => {
    const numNewPoints = newPoints.length;
    stateTexRes = Math.max(2, Math.ceil(Math.sqrt(numNewPoints)));
    stateTexEps = 0.5 / stateTexRes;
    const data = new Float32Array(stateTexRes ** 2 * 4);

    maxValueZ = 0;
    maxValueW = 0;

    for (let i = 0; i < numNewPoints; ++i) {
      data[i * 4] = newPoints[i][0]; // x
      data[i * 4 + 1] = newPoints[i][1]; // y
      data[i * 4 + 2] = newPoints[i][2] || 0; // z: value 1
      data[i * 4 + 3] = newPoints[i][3] || 0; // w: value 2

      maxValueZ = Math.max(maxValueZ, data[i * 4 + 2]);
      maxValueW = Math.max(maxValueW, data[i * 4 + 3]);
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

  const getPointConnectionColorIndices = () => {
    const colorEncoding =
      pointConnectionColorBy === 'inherit' ? colorBy : pointConnectionColorBy;

    if (colorEncoding) {
      return pointConnectionMap.reduce(
        (colorIndices, [index, referencePoint]) => {
          // The `4` comes from the fact that we have 4 color states:
          // normal, active, hover, and background
          colorIndices[index] = referencePoint[2] * 4;
          return colorIndices;
        },
        []
      );
    }

    return Array(pointConnectionMap.length).fill(0);
  };

  const setPointConnectionMap = (curvePoints) => {
    pointConnectionMap = [];

    let cumLinePoints = 0;
    Object.keys(curvePoints).forEach((id, index) => {
      pointConnectionMap[id] = [
        index,
        curvePoints[id].reference,
        curvePoints[id].length / 2,
        cumLinePoints,
      ];
      cumLinePoints += curvePoints[id].length / 2;
    });
  };

  const setPointConnections = (newPoints) =>
    new Promise((resolve) => {
      pointConnections.setPoints([]);
      if (!newPoints || !newPoints.length) {
        resolve();
      } else {
        computingPointConnectionCurves = true;
        createSplineCurve(newPoints, {
          maxIntPointsPerSegment: pointConnectionMaxIntPointsPerSegment,
          tolerance: pointConnectionTolerance,
        }).then((curvePoints) => {
          setPointConnectionMap(curvePoints);
          pointConnections.setPoints(Object.values(curvePoints), {
            colorIndices: getPointConnectionColorIndices(),
          });
          computingPointConnectionCurves = false;
          resolve();
        });
      }
    });

  const draw = (showRecticleOnce) => {
    if (!isInit || !regl) return;

    fbo.use(() => {
      regl.clear({
        // background color (transparent)
        color: [0, 0, 0, 0],
        depth: 1,
      });

      // Update camera
      isViewChanged = camera.tick();

      // eslint-disable-next-line no-underscore-dangle
      if (backgroundImage && backgroundImage._reglType) {
        drawBackgroundImage();
      }

      if (lassoPointsCurr.length > 2) drawPolygon2d();

      // The draw order of the following calls is important!
      if (!isTransitioning)
        pointConnections.draw({
          projection: getProjection(),
          model: getModel(),
          view: getView(),
        });
      drawPointBodies();
      if (!mouseDown && (showRecticle || showRecticleOnce)) drawRecticle();
      if (hoveredPoint >= 0) drawHoveredPoint();
      if (selection.length) drawSelectedPoint();

      lasso.draw({
        projection: getProjection(),
        model: getModel(),
        view: getView(),
      });
    });

    copyToScreen();

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
        if (
          showPointConnections ||
          (options.showPointConnectionsOnce &&
            hasPointConnections(newPoints[0]))
        ) {
          setPointConnections(newPoints).then(() => {
            pubSub.publish('pointConnectionsDraw');
            drawRaf(options.showRecticleOnce);
          });
        }
      }

      if (transition && pointsCached) {
        pubSub.subscribe(
          'transitionEnd',
          () => {
            // Point connects cannot be transitioned yet so we hide them during
            // the transition. Hence, we need to make sure we call `draw()` once
            // the transition has ended.
            drawRaf(options.showRecticleOnce);
            resolve();
          },
          1
        );
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

  const updatePointConnectionsStyle = () => {
    pointConnections.setStyle({
      color: getColors(
        pointConnectionColor,
        pointConnectionColorActive,
        pointConnectionColorHover
      ),
      width: pointConnectionSize,
    });
  };

  const updateLassoInitiatorStyle = () => {
    const v = Math.round(backgroundColorBrightness) > 0 ? 0 : 255;
    lassoManager.initiator.style.border = `1px dashed rgba(${v}, ${v}, ${v}, 0.33)`;
    lassoManager.initiator.style.background = `rgba(${v}, ${v}, ${v}, 0.1)`;
  };

  const setBackgroundColor = (newBackgroundColor) => {
    if (!newBackgroundColor) return;

    backgroundColor = toRgba(newBackgroundColor, true);
    backgroundColorBrightness = rgbBrightness(backgroundColor);
    updateLassoInitiatorStyle();
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
      // eslint-disable-next-line no-underscore-dangle
    } else if (newBackgroundImage._reglType === 'texture2d') {
      backgroundImage = newBackgroundImage;
    } else {
      backgroundImage = null;
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

    lassoManager.set({
      minDelay: lassoMinDelay,
    });
  };

  const setLassoMinDist = (newLassoMinDist) => {
    if (!+newLassoMinDist) return;

    lassoMinDist = +newLassoMinDist;

    lassoManager.set({
      minDist: lassoMinDist,
    });
  };

  const setLassoClearEvent = (newLassoClearEvent) => {
    lassoClearEvent = limit(
      LASSO_CLEAR_EVENTS,
      lassoClearEvent
    )(newLassoClearEvent);
  };

  const setLassoInitiator = (newLassoInitiator) => {
    lassoInitiator = Boolean(newLassoInitiator);

    lassoManager.set({
      enableInitiator: lassoInitiator,
    });
  };

  const setLassoInitiatorParentElement = (newLassoInitiatorParentElement) => {
    lassoInitiatorParentElement = newLassoInitiatorParentElement;

    lassoManager.set({
      startInitiatorParentElement: lassoInitiatorParentElement,
    });
  };

  const setKeyMap = (newKeyMap) => {
    keyMap = Object.entries(newKeyMap).reduce((map, [key, value]) => {
      if (KEYS.includes(key) && KEY_ACTIONS.includes(value)) {
        map[key] = value;
      }
      return map;
    }, {});
    keyActionMap = flipObj(keyMap);

    if (keyActionMap[KEY_ACTION_ROTATE]) {
      camera.config({
        isRotate: true,
        mouseDownMoveModKey: keyActionMap[KEY_ACTION_ROTATE],
      });
    } else {
      camera.config({
        isRotate: false,
      });
    }
  };

  const setMouseMode = (newMouseMode) => {
    mouseMode = limit(MOUSE_MODES, MOUSE_MODE_PANZOOM)(newMouseMode);

    camera.config({
      defaultMouseDownMoveAction:
        mouseMode === MOUSE_MODE_ROTATE ? 'rotate' : 'pan',
    });
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

  const setShowPointConnections = (newShowPointConnections) => {
    showPointConnections = !!newShowPointConnections;
    if (showPointConnections) {
      if (hasPointConnections(searchIndex.points[0])) {
        setPointConnections(searchIndex.points).then(() => {
          pubSub.publish('pointConnectionsDraw');
          drawRaf();
        });
      }
    } else {
      setPointConnections();
    }
  };

  const setPointConnectionColors = (setter) => (newColors) => {
    const tmpColors = isMultipleColors(newColors) ? newColors : [newColors];
    setter(tmpColors.map((color) => toRgba(color, true)));
    updatePointConnectionsStyle();
  };

  const setPointConnectionColor = setPointConnectionColors((newColors) => {
    pointConnectionColor = newColors;
  });

  const setPointConnectionColorActive = setPointConnectionColors(
    (newColors) => {
      pointConnectionColorActive = newColors;
    }
  );

  const setPointConnectionColorHover = setPointConnectionColors((newColors) => {
    pointConnectionColorHover = newColors;
  });

  const setPointConnectionColorBy = (type) => {
    switch (type) {
      case 'category':
        pointConnectionColorBy = 'category';
        break;

      case 'value':
        pointConnectionColorBy = 'value';
        break;

      case 'inherit':
        pointConnectionColorBy = 'inherit';
        break;

      default:
        pointConnectionColorBy = DEFAULT_POINT_CONNECTION_COLOR_BY;
    }
  };

  const setPointConnectionSize = (newPointConnectionSize) => {
    pointConnectionSize = Math.max(0, newPointConnectionSize);
    updatePointConnectionsStyle();
  };

  const setPointConnectionSizeSelected = (newPointConnectionSizeSelected) => {
    pointConnectionSizeSelected = Math.max(0, newPointConnectionSizeSelected);
  };

  const setPointConnectionSizeBy = (newPointConnectionSizeBy) => {
    pointConnectionSizeBy = newPointConnectionSizeBy;
  };

  const setPointConnectionMaxIntPointsPerSegment = (
    newPointConnectionMaxIntPointsPerSegment
  ) => {
    pointConnectionMaxIntPointsPerSegment = Math.max(
      0,
      newPointConnectionMaxIntPointsPerSegment
    );
  };

  const setPointConnectionTolerance = (newPointConnectionTolerance) => {
    pointConnectionTolerance = Math.max(0, newPointConnectionTolerance);
  };

  const setPointSizeMouseDetection = (newPointSizeMouseDetection) => {
    pointSizeMouseDetection = newPointSizeMouseDetection;
    computePointSizeMouseDetection();
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
    if (property === 'lassoInitiator') return lassoInitiator;
    if (property === 'lassoInitiatorElement') return lassoManager.initiator;
    if (property === 'lassoInitiatorParentElement')
      return lassoInitiatorParentElement;
    if (property === 'keyMap') return { ...keyMap };
    if (property === 'mouseMode') return mouseMode;
    if (property === 'opacity') return opacity;
    if (property === 'opacityBy') return opacityBy;
    if (property === 'pointColor')
      return pointColor.length === 1 ? pointColor[0] : pointColor;
    if (property === 'pointColorActive')
      return pointColorActive.length === 1
        ? pointColorActive[0]
        : pointColorActive;
    if (property === 'pointColorHover')
      return pointColorHover.length === 1
        ? pointColorHover[0]
        : pointColorHover;
    if (property === 'pointOutlineWidth') return pointOutlineWidth;
    if (property === 'pointSize') return pointSize;
    if (property === 'pointSizeSelected') return pointSizeSelected;
    if (property === 'pointSizeMouseDetection') return pointSizeMouseDetection;
    if (property === 'showPointConnections') return showPointConnections;
    if (property === 'pointConnectionColor') return pointConnectionColor;
    if (property === 'pointConnectionColorActive')
      return pointConnectionColorActive;
    if (property === 'pointConnectionColorHover')
      return pointConnectionColorHover;
    if (property === 'pointConnectionColorBy') return pointConnectionColorBy;
    if (property === 'pointConnectionSize') return pointConnectionSize;
    if (property === 'pointConnectionSizeSelected')
      return pointConnectionSizeSelected;
    if (property === 'pointConnectionSizeBy') return pointConnectionSizeBy;
    if (property === 'pointConnectionMaxIntPointsPerSegment')
      return pointConnectionMaxIntPointsPerSegment;
    if (property === 'pointConnectionTolerance')
      return pointConnectionTolerance;
    if (property === 'recticleColor') return recticleColor;
    if (property === 'regl') return regl;
    if (property === 'showRecticle') return showRecticle;
    if (property === 'version') return version;
    if (property === 'width') return width;
    if (property === 'xScale') return xScale;
    if (property === 'yScale') return yScale;
    if (property === 'performanceMode') return performanceMode;

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
      setPointColor(properties.pointColor);
    }

    if (properties.pointColorActive !== undefined) {
      setPointColorActive(properties.pointColorActive);
    }

    if (properties.pointColorHover !== undefined) {
      setPointColorHover(properties.pointColorHover);
    }

    if (properties.pointSize !== undefined) {
      setPointSize(properties.pointSize);
    }

    if (properties.pointSizeSelected !== undefined) {
      setPointSizeSelected(properties.pointSizeSelected);
    }

    if (properties.pointSizeMouseDetection !== undefined) {
      setPointSizeMouseDetection(properties.pointSizeMouseDetection);
    }

    if (properties.sizeBy !== undefined) {
      setSizeBy(properties.sizeBy);
    }

    if (properties.opacity !== undefined) {
      setOpacity(properties.opacity);
    }

    if (properties.showPointConnections !== undefined) {
      setShowPointConnections(properties.showPointConnections);
    }

    if (properties.pointConnectionColor !== undefined) {
      setPointConnectionColor(properties.pointConnectionColor);
    }

    if (properties.pointConnectionColorActive !== undefined) {
      setPointConnectionColorActive(properties.pointConnectionColorActive);
    }

    if (properties.pointConnectionColorHover !== undefined) {
      setPointConnectionColorHover(properties.pointConnectionColorHover);
    }

    if (properties.pointConnectionColorBy !== undefined) {
      setPointConnectionColorBy(properties.pointConnectionColorBy);
    }

    if (properties.pointConnectionSize !== undefined) {
      setPointConnectionSize(properties.pointConnectionSize);
    }

    if (properties.pointConnectionSizeSelected !== undefined) {
      setPointConnectionSizeSelected(properties.pointConnectionSizeSelected);
    }

    if (properties.pointConnectionSizeBy !== undefined) {
      setPointConnectionSizeBy(properties.pointConnectionSizeBy);
    }

    if (properties.pointConnectionMaxIntPointsPerSegment !== undefined) {
      setPointConnectionMaxIntPointsPerSegment(
        properties.pointConnectionMaxIntPointsPerSegment
      );
    }

    if (properties.pointConnectionTolerance !== undefined) {
      setPointConnectionTolerance(properties.pointConnectionTolerance);
    }

    if (properties.opacityBy !== undefined) {
      setOpacityBy(properties.opacityBy);
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

    if (properties.lassoInitiator !== undefined) {
      setLassoInitiator(properties.lassoInitiator);
    }

    if (properties.lassoInitiatorParentElement !== undefined) {
      setLassoInitiatorParentElement(properties.lassoInitiatorParentElement);
    }

    if (properties.keyMap !== undefined) {
      setKeyMap(properties.keyMap);
    }

    if (properties.mouseMode !== undefined) {
      setMouseMode(properties.mouseMode);
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
      const oldHoveredPoint = hoveredPoint;
      const newHoveredPoint = point !== hoveredPoint;
      if (
        +oldHoveredPoint >= 0 &&
        newHoveredPoint &&
        !selectionSet.has(oldHoveredPoint)
      ) {
        setPointConnectionColorState([oldHoveredPoint], 0);
      }
      hoveredPoint = point;
      hoveredPointIndexBuffer.subdata(indexToStateTexCoord(point));
      if (!selectionSet.has(point)) setPointConnectionColorState([point], 2);
      if (newHoveredPoint) pubSub.publish('pointover', hoveredPoint);
    } else {
      needsRedraw = hoveredPoint;
      hoveredPoint = undefined;
      if (+needsRedraw >= 0) {
        setPointConnectionColorState([needsRedraw], 0);
        pubSub.publish('pointout', needsRedraw);
      }
    }

    if (needsRedraw) drawRaf(null, showRecticleOnce);
  };

  const initCamera = () => {
    if (!camera) camera = createDom2dCamera(canvas);

    if (initialProperties.cameraView) {
      camera.setView(mat4.clone(initialProperties.cameraView));
    } else if (
      initialProperties.cameraTarget ||
      initialProperties.cameraDistance ||
      initialProperties.cameraRotation
    ) {
      camera.lookAt(
        [...(initialProperties.cameraTarget || DEFAULT_TARGET)],
        initialProperties.cameraDistance || DEFAULT_DISTANCE,
        initialProperties.cameraRotation || DEFAULT_ROTATION
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
    pointConnections.clear();
  };

  const init = () => {
    updateViewAspectRatio();
    initCamera();
    updateScales();

    lasso = createLine(regl, { color: lassoColor, width: 3, is2d: true });
    pointConnections = createLine(regl, {
      color: pointConnectionColor,
      colorHover: pointConnectionColorHover,
      colorActive: pointConnectionColorActive,
      width: pointConnectionSize,
      widthActive: pointConnectionSizeSelected,
      is2d: true,
    });
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
    computePointSizeMouseDetection();

    // Event listeners
    canvas.addEventListener('wheel', wheelHandler);

    // Buffers
    normalPointsIndexBuffer = regl.buffer();
    selectedPointsIndexBuffer = regl.buffer();
    hoveredPointIndexBuffer = regl.buffer({
      usage: 'dynamic',
      type: 'float',
      length: FLOAT_BYTES * 2, // This buffer is fixed to exactly 1 point consisting of 2 coordinates
    });

    colorTex = createColorTexture();
    encodingTex = createEncodingTexture();

    // Set dimensions
    set({
      backgroundImage,
      width,
      height,
      keyMap,
    });
    updateLassoInitiatorStyle();

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
    camera.dispose();
    camera = undefined;
    regl = undefined;
    lasso.destroy();
    pointConnections.destroy();
    recticleHLine.destroy();
    recticleVLine.destroy();
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
