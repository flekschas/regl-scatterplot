import createDom2dCamera from 'dom-2d-camera';
import KDBush from 'kdbush';
import createPubSub from 'pub-sub-es';
import { mat4, vec4 } from 'gl-matrix';
import createLine from 'regl-line';
import {
  identity,
  rangeMap,
  unionIntegers,
  throttleAndDebounce,
} from '@flekschas/utils';

import createRenderer from './renderer';
import createLassoManager from './lasso-manager';

import BG_FS from './bg.fs';
import BG_VS from './bg.vs';
import POINT_FS from './point.fs';
import POINT_SIMPLE_FS from './point-simple.fs';
import createVertexShader from './point.vs';
import POINT_UPDATE_FS from './point-update.fs';
import POINT_UPDATE_VS from './point-update.vs';

import createSplineCurve from './spline-curve';

import {
  AUTO,
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
  DEFAULT_LASSO_LINE_WIDTH,
  DEFAULT_LASSO_MIN_DELAY,
  DEFAULT_LASSO_MIN_DIST,
  DEFAULT_LASSO_CLEAR_EVENT,
  DEFAULT_SHOW_RETICLE,
  DEFAULT_RETICLE_COLOR,
  DEFAULT_POINT_CONNECTION_COLOR_NORMAL,
  DEFAULT_POINT_CONNECTION_COLOR_ACTIVE,
  DEFAULT_POINT_CONNECTION_COLOR_HOVER,
  DEFAULT_POINT_CONNECTION_COLOR_BY,
  DEFAULT_POINT_CONNECTION_OPACITY,
  DEFAULT_POINT_CONNECTION_OPACITY_BY,
  DEFAULT_POINT_CONNECTION_OPACITY_ACTIVE,
  DEFAULT_POINT_CONNECTION_SIZE,
  DEFAULT_POINT_CONNECTION_SIZE_ACTIVE,
  DEFAULT_POINT_CONNECTION_SIZE_BY,
  DEFAULT_POINT_CONNECTION_MAX_INT_POINTS_PER_SEGMENT,
  DEFAULT_POINT_CONNECTION_INT_POINTS_TOLERANCE,
  DEFAULT_SHOW_POINT_CONNECTIONS,
  DEFAULT_POINT_OUTLINE_WIDTH,
  MIN_POINT_SIZE,
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
  DEFAULT_OPACITY_BY,
  DEFAULT_OPACITY_BY_DENSITY_FILL,
  DEFAULT_OPACITY_BY_DENSITY_DEBOUNCE_TIME,
  DEFAULT_OPACITY_INACTIVE_MAX,
  DEFAULT_OPACITY_INACTIVE_SCALE,
  Z_NAMES,
  W_NAMES,
  DEFAULT_IMAGE_LOAD_TIMEOUT,
} from './constants';

import {
  createRegl,
  createTextureFromUrl,
  dist,
  getBBox,
  isConditionalArray,
  isPositiveNumber,
  isStrictlyPositiveNumber,
  isMultipleColors,
  isPointInPolygon,
  isString,
  limit,
  toRgba,
  max,
  min,
  flipObj,
  rgbBrightness,
  clip,
} from './utils';

import { version } from '../package.json';

const deprecations = {
  showRecticle: 'showReticle',
  recticleColor: 'reticleColor',
};

const checkDeprecations = (properties) => {
  Object.keys(properties)
    .filter((prop) => deprecations[prop])
    .forEach((name) => {
      console.warn(
        `regl-scatterplot: the "${name}" property is deprecated. Please use "${deprecations[name]}" instead.`
      );
      properties[deprecations[name]] = properties[name];
      delete properties[name];
    });
};

const getEncodingType = (
  type,
  defaultValue,
  { allowSegment = false, allowDensity = false } = {}
) => {
  // Z refers to the 3rd component of the RGBA value
  if (Z_NAMES.has(type)) return 'valueZ';

  // W refers to the 4th component of the RGBA value
  if (W_NAMES.has(type)) return 'valueW';

  if (type === 'segment') return allowSegment ? 'segment' : defaultValue;

  if (type === 'density') return allowDensity ? 'density' : defaultValue;

  return defaultValue;
};

const getEncodingIdx = (type) => {
  switch (type) {
    case 'valueZ':
      return 2;

    case 'valueW':
      return 3;

    default:
      return null;
  }
};

const createScatterplot = (
  /** @type {Partial<import('./types').Properties>} */ initialProperties = {}
) => {
  /** @type {import('./types').PubSub} */
  const pubSub = createPubSub({
    async: !initialProperties.syncEvents,
    caseInsensitive: true,
  });
  const scratch = new Float32Array(16);
  const pvm = new Float32Array(16);
  const mousePosition = [0, 0];

  checkDeprecations(initialProperties);

  let {
    renderer,
    backgroundColor = DEFAULT_COLOR_BG,
    backgroundImage = DEFAULT_BACKGROUND_IMAGE,
    canvas = document.createElement('canvas'),
    colorBy = DEFAULT_COLOR_BY,
    deselectOnDblClick = DEFAULT_DESELECT_ON_DBL_CLICK,
    deselectOnEscape = DEFAULT_DESELECT_ON_ESCAPE,
    lassoColor = DEFAULT_LASSO_COLOR,
    lassoLineWidth = DEFAULT_LASSO_LINE_WIDTH,
    lassoMinDelay = DEFAULT_LASSO_MIN_DELAY,
    lassoMinDist = DEFAULT_LASSO_MIN_DIST,
    lassoClearEvent = DEFAULT_LASSO_CLEAR_EVENT,
    lassoInitiator = DEFAULT_LASSO_INITIATOR,
    lassoInitiatorParentElement = document.body,
    keyMap = DEFAULT_KEY_MAP,
    mouseMode = DEFAULT_MOUSE_MODE,
    showReticle = DEFAULT_SHOW_RETICLE,
    reticleColor = DEFAULT_RETICLE_COLOR,
    pointColor = DEFAULT_COLOR_NORMAL,
    pointColorActive = DEFAULT_COLOR_ACTIVE,
    pointColorHover = DEFAULT_COLOR_HOVER,
    showPointConnections = DEFAULT_SHOW_POINT_CONNECTIONS,
    pointConnectionColor = DEFAULT_POINT_CONNECTION_COLOR_NORMAL,
    pointConnectionColorActive = DEFAULT_POINT_CONNECTION_COLOR_ACTIVE,
    pointConnectionColorHover = DEFAULT_POINT_CONNECTION_COLOR_HOVER,
    pointConnectionColorBy = DEFAULT_POINT_CONNECTION_COLOR_BY,
    pointConnectionOpacity = DEFAULT_POINT_CONNECTION_OPACITY,
    pointConnectionOpacityBy = DEFAULT_POINT_CONNECTION_OPACITY_BY,
    pointConnectionOpacityActive = DEFAULT_POINT_CONNECTION_OPACITY_ACTIVE,
    pointConnectionSize = DEFAULT_POINT_CONNECTION_SIZE,
    pointConnectionSizeActive = DEFAULT_POINT_CONNECTION_SIZE_ACTIVE,
    pointConnectionSizeBy = DEFAULT_POINT_CONNECTION_SIZE_BY,
    pointConnectionMaxIntPointsPerSegment = DEFAULT_POINT_CONNECTION_MAX_INT_POINTS_PER_SEGMENT,
    pointConnectionTolerance = DEFAULT_POINT_CONNECTION_INT_POINTS_TOLERANCE,
    pointSize = DEFAULT_POINT_SIZE,
    pointSizeSelected = DEFAULT_POINT_SIZE_SELECTED,
    pointSizeMouseDetection = DEFAULT_POINT_SIZE_MOUSE_DETECTION,
    pointOutlineWidth = DEFAULT_POINT_OUTLINE_WIDTH,
    opacity = AUTO,
    opacityBy = DEFAULT_OPACITY_BY,
    opacityByDensityFill = DEFAULT_OPACITY_BY_DENSITY_FILL,
    opacityInactiveMax = DEFAULT_OPACITY_INACTIVE_MAX,
    opacityInactiveScale = DEFAULT_OPACITY_INACTIVE_SCALE,
    sizeBy = DEFAULT_SIZE_BY,
    height = DEFAULT_HEIGHT,
    width = DEFAULT_WIDTH,
  } = initialProperties;

  let currentWidth = width === AUTO ? 1 : width;
  let currentHeight = height === AUTO ? 1 : height;

  // The following properties cannot be changed after the initialization
  const {
    performanceMode = DEFAULT_PERFORMANCE_MODE,
    opacityByDensityDebounceTime = DEFAULT_OPACITY_BY_DENSITY_DEBOUNCE_TIME,
  } = initialProperties;

  // Same as renderer ||= createRenderer({ ... }) but avoids having to rely on
  // https://babeljs.io/docs/en/babel-plugin-proposal-logical-assignment-operators
  // eslint-disable-next-line no-unused-expressions
  renderer ||
    (renderer = createRenderer({
      regl: initialProperties.regl,
      gamma: initialProperties.gamma,
    }));

  backgroundColor = toRgba(backgroundColor, true);
  lassoColor = toRgba(lassoColor, true);
  reticleColor = toRgba(reticleColor, true);

  let backgroundColorBrightness = rgbBrightness(backgroundColor);
  let camera;
  let lasso;
  let mouseDown = false;
  let selection = [];
  const selectionSet = new Set();
  const selectionConnecionSet = new Set();
  let mouseDownTime = null;
  let mouseDownPosition = [0, 0];
  let numPoints = 0;
  let numPointsInView = 0;
  let lassoActive = false;
  let lassoPointsCurr = [];
  let searchIndex;
  let viewAspectRatio;
  let dataAspectRatio = DEFAULT_DATA_ASPECT_RATIO;
  let projectionLocal;
  let projection;
  let model;
  let pointConnections;
  let pointConnectionMap;
  let computingPointConnectionCurves;
  let reticleHLine;
  let reticleVLine;
  let computedPointSizeMouseDetection;
  let keyActionMap = flipObj(keyMap);
  let lassoInitiatorTimeout;
  let topRightNdc;
  let bottomLeftNdc;
  let preventEventView = false;
  let draw = true;
  let drawReticleOnce = false;
  let canvasObserver;

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

  opacity =
    !Array.isArray(opacity) && Number.isNaN(+opacity)
      ? pointColor[0][3]
      : opacity;
  opacity = isConditionalArray(opacity, isPositiveNumber, {
    minLength: 1,
  })
    ? [...opacity]
    : [opacity];

  pointSize = isConditionalArray(pointSize, isPositiveNumber, {
    minLength: 1,
  })
    ? [...pointSize]
    : [pointSize];

  let minPointScale = MIN_POINT_SIZE / pointSize[0];

  if (pointConnectionColor === 'inherit') {
    pointConnectionColor = [...pointColor];
  } else {
    pointConnectionColor = isMultipleColors(pointConnectionColor)
      ? [...pointConnectionColor]
      : [pointConnectionColor];
    pointConnectionColor = pointConnectionColor.map((color) =>
      toRgba(color, true)
    );
  }

  if (pointConnectionColorActive === 'inherit') {
    pointConnectionColorActive = [...pointColorActive];
  } else {
    pointConnectionColorActive = isMultipleColors(pointConnectionColorActive)
      ? [...pointConnectionColorActive]
      : [pointConnectionColorActive];
    pointConnectionColorActive = pointConnectionColorActive.map((color) =>
      toRgba(color, true)
    );
  }

  if (pointConnectionColorHover === 'inherit') {
    pointConnectionColorHover = [...pointColorHover];
  } else {
    pointConnectionColorHover = isMultipleColors(pointConnectionColorHover)
      ? [...pointConnectionColorHover]
      : [pointConnectionColorHover];
    pointConnectionColorHover = pointConnectionColorHover.map((color) =>
      toRgba(color, true)
    );
  }

  if (pointConnectionOpacity === 'inherit') {
    pointConnectionOpacity = [...opacity];
  } else {
    pointConnectionOpacity = isConditionalArray(
      pointConnectionOpacity,
      isPositiveNumber,
      {
        minLength: 1,
      }
    )
      ? [...pointConnectionOpacity]
      : [pointConnectionOpacity];
  }

  if (pointConnectionSize === 'inherit') {
    pointConnectionSize = [...pointSize];
  } else {
    pointConnectionSize = isConditionalArray(
      pointConnectionSize,
      isPositiveNumber,
      {
        minLength: 1,
      }
    )
      ? [...pointConnectionSize]
      : [pointConnectionSize];
  }

  colorBy = getEncodingType(colorBy, DEFAULT_COLOR_BY);
  opacityBy = getEncodingType(opacityBy, DEFAULT_OPACITY_BY, {
    allowDensity: true,
  });
  sizeBy = getEncodingType(sizeBy, DEFAULT_SIZE_BY);

  pointConnectionColorBy = getEncodingType(
    pointConnectionColorBy,
    DEFAULT_POINT_CONNECTION_COLOR_BY,
    { allowSegment: true }
  );
  pointConnectionOpacityBy = getEncodingType(
    pointConnectionOpacityBy,
    DEFAULT_POINT_CONNECTION_OPACITY_BY,
    { allowSegment: true }
  );
  pointConnectionSizeBy = getEncodingType(
    pointConnectionSizeBy,
    DEFAULT_POINT_CONNECTION_SIZE_BY,
    { allowSegment: true }
  );

  let stateTex; // Stores the point texture holding x, y, category, and value
  let prevStateTex; // Stores the previous point texture. Used for transitions
  let tmpStateTex; // Stores a temporary point texture. Used for transitions
  let tmpStateBuffer; // Temporary frame buffer
  let stateTexRes = 0; // Width and height of the texture
  let stateTexEps = 0; // Half a texel
  let normalPointsIndexBuffer; // Buffer holding the indices pointing to the correct texel
  let selectedPointsIndexBuffer; // Used for pointing to the selected texels
  let hoveredPointIndexBuffer; // Used for pointing to the hovered texels

  let cameraZoomTargetStart; // Stores the start (i.e., current) camera target for zooming
  let cameraZoomTargetEnd; // Stores the end camera target for zooming
  let cameraZoomDistanceStart; // Stores the start camera distance for zooming
  let cameraZoomDistanceEnd; // Stores the end camera distance for zooming

  let isTransitioning = false;
  let transitionStartTime = null;
  let transitionDuration;
  let transitionEasing;
  let preTransitionShowReticle = showReticle;

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
    xScale.range([0, currentWidth]);
  }
  if (yScale) {
    yDomainStart = yScale.domain()[0];
    yDomainSize = yScale.domain()[1] - yScale.domain()[0];
    yScale.range([currentHeight, 0]);
  }

  const getNdcX = (x) => -1 + (x / currentWidth) * 2;
  const getNdcY = (y) => 1 + (y / currentHeight) * -2;

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
        projectionLocal,
        mat4.multiply(scratch, camera.view, model)
      )
    );

    // Translate vector
    vec4.transformMat4(v, v, mvp);

    return v.slice(0, 2);
  };

  const getPointSizeNdc = () => {
    // eslint-disable-next-line no-use-before-define
    const pointScale = getPointScale();

    // The height of the view in normalized device coordinates
    const heightNdc = topRightNdc[1] - bottomLeftNdc[1];
    // The size of a pixel in the current view in normalized device coordinates
    const pxNdc = heightNdc / currentHeight;
    // The scaled point size in normalized device coordinates
    return computedPointSizeMouseDetection * pointScale * pxNdc * 0.66;
  };

  const raycast = () => {
    const [xGl, yGl] = getMouseGlPos();
    const [xNdc, yNdc] = getScatterGlPos(xGl, yGl);

    const pointSizeNdc = getPointSizeNdc();

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

    if (minDist < (computedPointSizeMouseDetection / currentWidth) * 2)
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
      if (isPointInPolygon(lassoPolygon, searchIndex.points[pointIdx]))
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

    const isNormal = stateIndex === 0;
    const lineIdCacher =
      stateIndex === 1
        ? (lineId) => selectionConnecionSet.add(lineId)
        : identity;

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

    const buffer = pointConnections.getData().opacities;

    lineIds
      .filter((lineId) => !selectionConnecionSet.has(+lineId))
      .forEach((lineId) => {
        const index = pointConnectionMap[lineId][0];
        const numPointPerLine = pointConnectionMap[lineId][2];
        const pointOffset = pointConnectionMap[lineId][3];

        const bufferStart = index * 4 + pointOffset * 2;
        const bufferEnd = bufferStart + numPointPerLine * 2 + 4;

        // eslint-disable-next-line no-underscore-dangle
        if (buffer.__original__ === undefined) {
          // eslint-disable-next-line no-underscore-dangle
          buffer.__original__ = buffer.slice();
        }

        for (let i = bufferStart; i < bufferEnd; i++) {
          // buffer[i] = Math.floor(buffer[i] / 4) * 4 + stateIndex;
          buffer[i] = isNormal
            ? // eslint-disable-next-line no-underscore-dangle
              buffer.__original__[i]
            : pointConnectionOpacityActive;
        }

        lineIdCacher(lineId);
      });

    pointConnections.getBuffer().opacities.subdata(buffer, 0);
  };

  const indexToStateTexCoord = (index) => [
    (index % stateTexRes) / stateTexRes + stateTexEps,
    Math.floor(index / stateTexRes) / stateTexRes + stateTexEps,
  ];

  const deselect = ({ preventEvent = false } = {}) => {
    if (lassoClearEvent === LASSO_CLEAR_ON_DESELECT) lassoClear();
    if (selection.length) {
      if (!preventEvent) pubSub.publish('deselect');
      selectionConnecionSet.clear();
      setPointConnectionColorState(selection, 0);
      selection = [];
      selectionSet.clear();
      draw = true;
    }
  };

  /**
   * Select and highlight a set of points
   * @param {number | number[]} pointIdxs
   * @param {import('./types').ScatterplotMethodOptions['select']}
   */
  const select = (pointIdxs, { merge = false, preventEvent = false } = {}) => {
    const pointIdxsArr = Array.isArray(pointIdxs) ? pointIdxs : [pointIdxs];

    if (merge) {
      selection = unionIntegers(selection, pointIdxsArr);
    } else {
      // Unset previously highlight point connections
      if (selection && selection.length)
        setPointConnectionColorState(selection, 0);
      selection = pointIdxsArr;
    }

    const selectionBuffer = [];

    selectionSet.clear();
    selectionConnecionSet.clear();

    for (let i = selection.length - 1; i >= 0; i--) {
      const pointIdx = selection[i];

      if (pointIdx < 0 || pointIdx >= numPoints) {
        // Remove invalid selection
        selection.splice(i, 1);
      } else {
        selectionSet.add(pointIdx);
        const texCoords = indexToStateTexCoord(pointIdx);
        selectionBuffer.push(texCoords[0]);
        selectionBuffer.push(texCoords[1]);
      }
    }

    selectedPointsIndexBuffer({
      usage: 'dynamic',
      type: 'float',
      data: selectionBuffer,
    });

    setPointConnectionColorState(selection, 1);

    if (!preventEvent) pubSub.publish('select', { points: selection });

    draw = true;
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
    camera.config({ isFixed: false });
    lassoPointsCurr = [...lassoPoints];
    const pointsInLasso = findPointsInLasso(lassoPointsFlat);
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
      event.preventDefault();
      lassoActive = false;
      lassoManager.end({
        merge: checkModKey(event, KEY_ACTION_MERGE),
      });
    }
  };

  const mouseClickHandler = (event) => {
    if (!isInit) return;

    event.preventDefault();

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

  const mouseDblClickHandler = (event) => {
    lassoManager.hideInitiator();
    if (lassoInitiatorTimeout) {
      clearTimeout(lassoInitiatorTimeout);
      lassoInitiatorTimeout = null;
    }
    if (deselectOnDblClick) {
      event.preventDefault();
      deselect();
    }
  };

  const mouseMoveHandler = (event) => {
    if (!isInit || (!isMouseInCanvas && !mouseDown)) return;

    getRelativeMousePosition(event);

    // Only ray cast if the mouse cursor is inside
    if (isMouseInCanvas && !lassoActive) {
      hover(raycast()); // eslint-disable-line no-use-before-define
    }

    if (lassoActive) {
      event.preventDefault();
      lassoManager.extend(event, true);
    }

    // Always redraw when mousedown as the user might have panned or lassoed
    if (mouseDown) draw = true;
  };

  const blurHandler = () => {
    if (!isInit) return;

    if (+hoveredPoint >= 0 && !selectionSet.has(hoveredPoint))
      setPointConnectionColorState([hoveredPoint], 0);
    hoveredPoint = undefined;
    isMouseInCanvas = false;
    mouseUpHandler();
    draw = true;
  };

  const createEncodingTexture = () => {
    const maxEncoding = Math.max(pointSize.length, opacity.length);

    encodingTexRes = Math.max(2, Math.ceil(Math.sqrt(maxEncoding)));
    const rgba = new Float32Array(encodingTexRes ** 2 * 4);

    for (let i = 0; i < maxEncoding; i++) {
      rgba[i * 4] = pointSize[i] || 0;
      rgba[i * 4 + 1] = Math.min(1, opacity[i] || 0);

      const active = Number((pointColorActive[i] || pointColorActive[0])[3]);
      rgba[i * 4 + 2] = Math.min(1, Number.isNaN(active) ? 1 : active);

      const hover = Number((pointColorHover[i] || pointColorHover[0])[3]);
      rgba[i * 4 + 3] = Math.min(1, Number.isNaN(hover) ? 1 : hover);
    }

    return renderer.regl.texture({
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

    return renderer.regl.texture({
      data: rgba,
      shape: [colorTexRes, colorTexRes, 4],
      type: 'float',
    });
  };

  /**
   * Since we're using an external renderer whose canvas' width and height
   * might differ from this instance's width and height, we have to adjust the
   * projection of camera spaces into clip space accordingly.
   *
   * The `widthRatio` is rendererCanvas.width / thisCanvas.width
   * The `heightRatio` is rendererCanvas.height / thisCanvas.height
   */
  const updateProjectionMatrix = (widthRatio, heightRatio) => {
    projection[0] = widthRatio / viewAspectRatio;
    projection[5] = heightRatio;
  };

  const updateViewAspectRatio = () => {
    viewAspectRatio = currentWidth / currentHeight;
    projectionLocal = mat4.fromScaling([], [1 / viewAspectRatio, 1, 1]);
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

  const setCurrentHeight = (newCurrentHeight) => {
    currentHeight = Math.max(1, newCurrentHeight);
    canvas.height = Math.floor(currentHeight * window.devicePixelRatio);
    if (yScale) {
      yScale.range([currentHeight, 0]);
      updateScales();
    }
  };

  const setHeight = (newHeight) => {
    if (newHeight === AUTO) {
      height = newHeight;
      canvas.style.height = '100%';
      window.requestAnimationFrame(() => {
        if (canvas) setCurrentHeight(canvas.getBoundingClientRect().height);
      });
      return;
    }

    if (!+newHeight || +newHeight <= 0) return;

    height = +newHeight;
    setCurrentHeight(height);
    canvas.style.height = `${height}px`;
  };

  const computePointSizeMouseDetection = () => {
    computedPointSizeMouseDetection = pointSizeMouseDetection;

    if (pointSizeMouseDetection === AUTO) {
      computedPointSizeMouseDetection = Array.isArray(pointSize)
        ? pointSize[Math.floor(pointSize.length / 2)]
        : pointSize;
    }
  };

  const setPointSize = (newPointSize) => {
    if (isConditionalArray(newPointSize, isPositiveNumber, { minLength: 1 }))
      pointSize = [...newPointSize];

    if (isStrictlyPositiveNumber(+newPointSize)) pointSize = [+newPointSize];

    minPointScale = MIN_POINT_SIZE / pointSize[0];
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

  const setCurrentWidth = (newCurrentWidth) => {
    currentWidth = Math.max(1, newCurrentWidth);
    canvas.width = Math.floor(currentWidth * window.devicePixelRatio);
    if (xScale) {
      xScale.range([0, currentWidth]);
      updateScales();
    }
  };

  const setWidth = (newWidth) => {
    if (newWidth === AUTO) {
      width = newWidth;
      canvas.style.width = '100%';
      window.requestAnimationFrame(() => {
        if (canvas) setCurrentWidth(canvas.getBoundingClientRect().width);
      });
      return;
    }

    if (!+newWidth || +newWidth <= 0) return;

    width = +newWidth;
    setCurrentWidth(width);
    canvas.style.width = `${currentWidth}px`;
  };

  const setOpacity = (newOpacity) => {
    if (isConditionalArray(newOpacity, isPositiveNumber, { minLength: 1 }))
      opacity = [...newOpacity];

    if (isStrictlyPositiveNumber(+newOpacity)) opacity = [+newOpacity];

    encodingTex = createEncodingTexture();
  };

  const getEncodingDataType = (type) => {
    switch (type) {
      case 'valueZ':
        return maxValueZ > 1 ? 'categorical' : 'continuous';

      case 'valueW':
        return maxValueW > 1 ? 'categorical' : 'continuous';

      default:
        return null;
    }
  };

  const getEncodingValueToIdx = (type, rangeValues) => {
    switch (type) {
      case 'continuous':
        return (value) => Math.round(value * (rangeValues.length - 1));

      case 'categorical':
      default:
        return identity;
    }
  };

  const setColorBy = (type) => {
    colorBy = getEncodingType(type, DEFAULT_COLOR_BY);
  };
  const setOpacityBy = (type) => {
    opacityBy = getEncodingType(type, DEFAULT_OPACITY_BY, {
      allowDensity: true,
    });
  };
  const setSizeBy = (type) => {
    sizeBy = getEncodingType(type, DEFAULT_SIZE_BY);
  };
  const setPointConnectionColorBy = (type) => {
    pointConnectionColorBy = getEncodingType(
      type,
      DEFAULT_POINT_CONNECTION_COLOR_BY,
      { allowSegment: true }
    );
  };
  const setPointConnectionOpacityBy = (type) => {
    pointConnectionOpacityBy = getEncodingType(
      type,
      DEFAULT_POINT_CONNECTION_OPACITY_BY,
      { allowSegment: true }
    );
  };
  const setPointConnectionSizeBy = (type) => {
    pointConnectionSizeBy = getEncodingType(
      type,
      DEFAULT_POINT_CONNECTION_SIZE_BY,
      { allowSegment: true }
    );
  };

  const getResolution = () => [canvas.width, canvas.height];
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
  const getModelViewProjection = () =>
    mat4.multiply(pvm, projection, mat4.multiply(pvm, camera.view, model));
  const getPointScale = () => {
    if (camera.scaling[0] > 1)
      return (
        (Math.asinh(max(1.0, camera.scaling[0])) / Math.asinh(1)) *
        window.devicePixelRatio
      );

    return max(minPointScale, camera.scaling[0]) * window.devicePixelRatio;
  };
  const getNormalNumPoints = () => numPoints;
  const getSelectedNumPoints = () => selection.length;
  const getPointOpacityMaxBase = () =>
    getSelectedNumPoints() > 0 ? opacityInactiveMax : 1;
  const getPointOpacityScaleBase = () =>
    getSelectedNumPoints() > 0 ? opacityInactiveScale : 1;
  const getIsColoredByZ = () => +(colorBy === 'valueZ');
  const getIsColoredByW = () => +(colorBy === 'valueW');
  const getIsOpacityByZ = () => +(opacityBy === 'valueZ');
  const getIsOpacityByW = () => +(opacityBy === 'valueW');
  const getIsOpacityByDensity = () => +(opacityBy === 'density');
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
  const getOpacityDensity = (context) => {
    if (opacityBy !== 'density') return 1;

    // Adopted from the fabulous Ricky Reusser:
    // https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
    // Extended with a point-density based approach
    const pointScale = getPointScale(true);
    const p = pointSize[0] * pointScale;

    // Compute the plot's x and y range from the view matrix, though these could come from any source
    const s = (2 / (2 / camera.view[0])) * (2 / (2 / camera.view[5]));

    // Viewport size, in device pixels
    const H = context.viewportHeight;
    const W = context.viewportWidth;

    // Adaptation: Instead of using the global number of points, I am using a
    // density-based approach that takes the points in the view into context
    // when zooming in. This ensure that in sparse areas, points are opaque and
    // in dense areas points are more translucent.
    let alpha =
      ((opacityByDensityFill * W * H) / (numPointsInView * p * p)) * min(1, s);

    // In performanceMode we use squares, otherwise we use circles, which only
    // take up (pi r^2) of the unit square
    alpha *= performanceMode ? 1 : 1 / (0.25 * Math.PI);

    // If the pixels shrink below the minimum permitted size, then we adjust the opacity instead
    // and apply clamping of the point size in the vertex shader. Note that we add 0.5 since we
    // slightly inrease the size of points during rendering to accommodate SDF-style antialiasing.
    const clampedPointDeviceSize = max(MIN_POINT_SIZE, p) + 0.5;

    // We square this since we're concerned with the ratio of *areas*.
    // eslint-disable-next-line no-restricted-properties
    alpha *= (p / clampedPointDeviceSize) ** 2;

    // And finally, we clamp to the range [0, 1]. We should really clamp this to 1 / precision
    // on the low end, depending on the data type of the destination so that we never render *nothing*.
    return min(1, max(0, alpha));
  };

  const updatePoints = renderer.regl({
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
    globalState = COLOR_NORMAL_IDX,
    getPointOpacityMax = getPointOpacityMaxBase,
    getPointOpacityScale = getPointOpacityScaleBase
  ) =>
    renderer.regl({
      frag: performanceMode ? POINT_SIMPLE_FS : POINT_FS,
      vert: createVertexShader(globalState),

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
        resolution: getResolution,
        modelViewProjection: getModelViewProjection,
        devicePixelRatio: getDevicePixelRatio,
        pointScale: getPointScale,
        encodingTex: getEncodingTex,
        encodingTexRes: getEncodingTexRes,
        encodingTexEps: getEncodingTexEps,
        pointOpacityMax: getPointOpacityMax,
        pointOpacityScale: getPointOpacityScale,
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
        isOpacityByDensity: getIsOpacityByDensity,
        isSizedByZ: getIsSizedByZ,
        isSizedByW: getIsSizedByW,
        colorMultiplicator: getColorMultiplicator,
        opacityMultiplicator: getOpacityMultiplicator,
        opacityDensity: getOpacityDensity,
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
    COLOR_HOVER_IDX,
    () => 1,
    () => 1
  );

  const drawSelectedPointOutlines = drawPoints(
    () => (pointSizeSelected + pointOutlineWidth * 2) * window.devicePixelRatio,
    getSelectedNumPoints,
    getSelectedPointsIndexBuffer,
    COLOR_ACTIVE_IDX,
    () => 1,
    () => 1
  );

  const drawSelectedPointInnerBorder = drawPoints(
    () => (pointSizeSelected + pointOutlineWidth) * window.devicePixelRatio,
    getSelectedNumPoints,
    getSelectedPointsIndexBuffer,
    COLOR_BG_IDX,
    () => 1,
    () => 1
  );

  const drawSelectedPointBodies = drawPoints(
    () => pointSizeSelected * window.devicePixelRatio,
    getSelectedNumPoints,
    getSelectedPointsIndexBuffer,
    COLOR_ACTIVE_IDX,
    () => 1,
    () => 1
  );

  const drawSelectedPoints = () => {
    drawSelectedPointOutlines();
    drawSelectedPointInnerBorder();
    drawSelectedPointBodies();
  };

  const drawBackgroundImage = renderer.regl({
    frag: BG_FS,
    vert: BG_VS,

    attributes: {
      position: [0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0],
    },

    uniforms: {
      modelViewProjection: getModelViewProjection,
      texture: getBackgroundImage,
    },

    count: 6,
  });

  const drawPolygon2d = renderer.regl({
    vert: `
      precision mediump float;
      uniform mat4 modelViewProjection;
      attribute vec2 position;
      void main () {
        gl_Position = modelViewProjection * vec4(position, 0, 1);
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
      modelViewProjection: getModelViewProjection,
      color: () => lassoColor,
    },

    elements: () =>
      Array.from({ length: lassoPointsCurr.length - 2 }, (_, i) => [
        0,
        i + 1,
        i + 2,
      ]),
  });

  const drawReticle = () => {
    if (!(hoveredPoint >= 0)) return;

    const [x, y] = searchIndex.points[hoveredPoint].slice(0, 2);

    // Homogeneous coordinates of the point
    const v = [x, y, 0, 1];

    // We have to calculate the model-view-projection matrix outside of the
    // shader as we actually don't want the model, view, or projection of the
    // line view space to change such that the reticle is visualized across the
    // entire view container and not within the view of the scatterplot
    mat4.multiply(
      scratch,
      projection,
      mat4.multiply(scratch, camera.view, model)
    );

    vec4.transformMat4(v, v, scratch);

    reticleHLine.setPoints([-1, v[1], 1, v[1]]);
    reticleVLine.setPoints([v[0], 1, v[0], -1]);

    reticleHLine.draw();
    reticleVLine.draw();

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

    return renderer.regl.texture({
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
    tmpStateBuffer = renderer.regl.framebuffer({
      color: tmpStateTex,
      depth: false,
      stencil: false,
    });
    stateTex = undefined;

    return true;
  };

  const hasCachedPoints = () => Boolean(prevStateTex && tmpStateTex);

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
    numPointsInView = numPoints;

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

  const cacheCamera = (newTarget, newDistance) => {
    cameraZoomTargetStart = camera.target;
    cameraZoomTargetEnd = newTarget;
    cameraZoomDistanceStart = camera.distance[0];
    cameraZoomDistanceEnd = newDistance;
  };

  const hasCachedCamera = () =>
    Boolean(
      cameraZoomTargetStart !== undefined &&
        cameraZoomTargetEnd !== undefined &&
        cameraZoomDistanceStart !== undefined &&
        cameraZoomDistanceEnd !== undefined
    );

  const clearCachedCamera = () => {
    cameraZoomTargetStart = undefined;
    cameraZoomTargetEnd = undefined;
    cameraZoomDistanceStart = undefined;
    cameraZoomDistanceEnd = undefined;
  };

  const getPointConnectionColorIndices = (curvePoints) => {
    const colorEncoding =
      pointConnectionColorBy === 'inherit' ? colorBy : pointConnectionColorBy;

    if (colorEncoding === 'segment') {
      const maxColorIdx = pointConnectionColor.length - 1;
      if (maxColorIdx < 1) return [];
      return curvePoints.reduce((colorIndices, curve, index) => {
        let totalLength = 0;
        const segLengths = [];
        // Compute the total length of the line
        for (let i = 2; i < curve.length; i += 2) {
          const segLength = Math.sqrt(
            (curve[i - 2] - curve[i]) ** 2 + (curve[i - 1] - curve[i + 1]) ** 2
          );
          segLengths.push(segLength);
          totalLength += segLength;
        }
        colorIndices[index] = [0];
        let cumLength = 0;
        // Assign the color index based on the cumulative length
        for (let i = 0; i < curve.length / 2 - 1; i++) {
          cumLength += segLengths[i];
          // The `4` comes from the fact that we have 4 color states:
          // normal, active, hover, and background
          colorIndices[index].push(
            Math.floor((cumLength / totalLength) * maxColorIdx) * 4
          );
        }
        // The `4` comes from the fact that we have 4 color states:
        // normal, active, hover, and background
        // colorIndices[index] = rangeMap(
        //   curve.length,
        //   (i) => Math.floor((i / (curve.length - 1)) * maxColorIdx) * 4
        // );
        return colorIndices;
      }, []);
    }

    if (colorEncoding) {
      const encodingIdx = getEncodingIdx(colorEncoding);
      const encodingValueToIdx = getEncodingValueToIdx(
        getEncodingDataType(colorEncoding),
        pointConnectionColorBy === 'inherit' ? pointColor : pointConnectionColor
      );
      return pointConnectionMap.reduce(
        (colorIndices, [index, referencePoint]) => {
          // The `4` comes from the fact that we have 4 color states:
          // normal, active, hover, and background
          colorIndices[index] =
            encodingValueToIdx(referencePoint[encodingIdx]) * 4;
          return colorIndices;
        },
        []
      );
    }

    return Array(pointConnectionMap.length).fill(0);
  };

  const getPointConnectionOpacities = () => {
    const opacityEncoding =
      pointConnectionOpacityBy === 'inherit'
        ? opacityBy
        : pointConnectionOpacityBy;

    if (opacityEncoding === 'segment') {
      const maxOpacityIdx = pointConnectionOpacity.length - 1;
      if (maxOpacityIdx < 1) return [];
      return pointConnectionMap.reduce(
        // eslint-disable-next-line no-unused-vars
        (opacities, [index, referencePoint, length]) => {
          opacities[index] = rangeMap(
            length,
            (i) =>
              pointConnectionOpacity[
                Math.floor((i / (length - 1)) * maxOpacityIdx)
              ]
          );
          return opacities;
        },
        []
      );
    }

    if (opacityEncoding) {
      const encodingIdx = getEncodingIdx(opacityEncoding);
      const encodingRangeMap =
        pointConnectionOpacityBy === 'inherit'
          ? opacity
          : pointConnectionOpacity;
      const encodingValueToIdx = getEncodingValueToIdx(
        getEncodingDataType(opacityEncoding),
        encodingRangeMap
      );
      return pointConnectionMap.reduce((opacities, [index, referencePoint]) => {
        opacities[index] =
          encodingRangeMap[encodingValueToIdx(referencePoint[encodingIdx])];
        return opacities;
      }, []);
    }

    return undefined;
  };

  const getPointConnectionWidths = () => {
    const sizeEncoding =
      pointConnectionSizeBy === 'inherit' ? sizeBy : pointConnectionSizeBy;

    if (sizeEncoding === 'segment') {
      const maxSizeIdx = pointConnectionSize.length - 1;
      if (maxSizeIdx < 1) return [];
      return pointConnectionMap.reduce(
        // eslint-disable-next-line no-unused-vars
        (widths, [index, referencePoint, length]) => {
          widths[index] = rangeMap(
            length,
            (i) =>
              pointConnectionSize[Math.floor((i / (length - 1)) * maxSizeIdx)]
          );
          return widths;
        },
        []
      );
    }

    if (sizeEncoding) {
      const encodingIdx = getEncodingIdx(sizeEncoding);
      const encodingRangeMap =
        pointConnectionSizeBy === 'inherit' ? pointSize : pointConnectionSize;
      const encodingValueToIdx = getEncodingValueToIdx(
        getEncodingDataType(sizeEncoding),
        encodingRangeMap
      );
      return pointConnectionMap.reduce((widths, [index, referencePoint]) => {
        widths[index] =
          encodingRangeMap[encodingValueToIdx(referencePoint[encodingIdx])];
        return widths;
      }, []);
    }

    return undefined;
  };

  const setPointConnectionMap = (curvePoints) => {
    pointConnectionMap = [];

    let cumLinePoints = 0;
    Object.keys(curvePoints).forEach((id, index) => {
      pointConnectionMap[id] = [
        index,
        curvePoints[id].reference,
        curvePoints[id].length / 2,
        // Used for offsetting in the buffer manipulations on
        // hovering and selecting
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
          const curvePointValues = Object.values(curvePoints);
          pointConnections.setPoints(curvePointValues, {
            colorIndices: getPointConnectionColorIndices(curvePointValues),
            opacities: getPointConnectionOpacities(curvePointValues),
            widths: getPointConnectionWidths(curvePointValues),
          });
          computingPointConnectionCurves = false;
          resolve();
        });
      }
    });

  const getPointsInView = () =>
    searchIndex.range(
      bottomLeftNdc[0],
      bottomLeftNdc[1],
      topRightNdc[0],
      topRightNdc[1]
    );

  const getNumPointsInView = () => {
    numPointsInView = getPointsInView().length;
  };

  const getNumPointsInViewDb = throttleAndDebounce(
    getNumPointsInView,
    opacityByDensityDebounceTime
  );

  const tweenCamera = (t) => {
    const [xStart, yStart] = cameraZoomTargetStart;
    const [xEnd, yEnd] = cameraZoomTargetEnd;

    const ti = 1.0 - t;

    const targetX = xStart * ti + xEnd * t;
    const targetY = yStart * ti + yEnd * t;
    const distance = cameraZoomDistanceStart * ti + cameraZoomDistanceEnd * t;

    camera.lookAt([targetX, targetY], distance);
  };

  const isTransitioningPoints = () => hasCachedPoints();

  const isTransitioningCamera = () => hasCachedCamera();

  const tween = (duration, easing) => {
    if (!transitionStartTime) transitionStartTime = performance.now();

    const dt = performance.now() - transitionStartTime;
    const t = clip(easing(dt / duration), 0, 1);

    if (isTransitioningPoints()) {
      updatePoints({ t });
    }

    if (isTransitioningCamera()) {
      tweenCamera(t);
    }

    return dt < duration;
  };

  const endTransition = () => {
    isTransitioning = false;
    transitionStartTime = null;
    transitionDuration = undefined;
    transitionEasing = undefined;
    showReticle = preTransitionShowReticle;

    clearCachedPoints();
    clearCachedCamera();

    pubSub.publish('transitionEnd');
  };

  const startTransition = ({ duration = 500, easing = DEFAULT_EASING }) => {
    if (isTransitioning) pubSub.publish('transitionEnd');

    isTransitioning = true;
    transitionStartTime = null;
    transitionDuration = duration;
    transitionEasing = isString(easing)
      ? EASING_FNS[easing] || DEFAULT_EASING
      : easing;
    preTransitionShowReticle = showReticle;
    showReticle = false;

    pubSub.publish('transitionStart');
  };

  const toArrayOrientedPoints = (points) =>
    new Promise((resolve, reject) => {
      if (!points || Array.isArray(points)) {
        resolve(points);
      } else {
        const length =
          Array.isArray(points.x) || ArrayBuffer.isView(points.x)
            ? points.x.length
            : 0;

        const getX =
          (Array.isArray(points.x) || ArrayBuffer.isView(points.x)) &&
          ((i) => points.x[i]);
        const getY =
          (Array.isArray(points.y) || ArrayBuffer.isView(points.y)) &&
          ((i) => points.y[i]);
        const getL =
          (Array.isArray(points.line) || ArrayBuffer.isView(points.line)) &&
          ((i) => points.line[i]);
        const getLO =
          (Array.isArray(points.lineOrder) ||
            ArrayBuffer.isView(points.lineOrder)) &&
          ((i) => points.lineOrder[i]);

        const components = Object.keys(points);
        const getZ = (() => {
          const z = components.find((c) => Z_NAMES.has(c));
          return (
            z &&
            (Array.isArray(points[z]) || ArrayBuffer.isView(points[z])) &&
            ((i) => points[z][i])
          );
        })();
        const getW = (() => {
          const w = components.find((c) => W_NAMES.has(c));
          return (
            w &&
            (Array.isArray(points[w]) || ArrayBuffer.isView(points[w])) &&
            ((i) => points[w][i])
          );
        })();

        if (getX && getY && getZ && getW && getL && getLO) {
          resolve(
            points.x.map((x, i) => [
              x,
              getY(i),
              getZ(i),
              getW(i),
              getL(i),
              getLO(i),
            ])
          );
        } else if (getX && getY && getZ && getW && getL) {
          resolve(
            Array.from({ length }, (_, i) => [
              getX(i),
              getY(i),
              getZ(i),
              getW(i),
              getL(i),
            ])
          );
        } else if (getX && getY && getZ && getW) {
          resolve(
            Array.from({ length }, (_, i) => [
              getX(i),
              getY(i),
              getZ(i),
              getW(i),
            ])
          );
        } else if (getX && getY && getZ) {
          resolve(
            Array.from({ length }, (_, i) => [getX(i), getY(i), getZ(i)])
          );
        } else if (getX && getY) {
          resolve(Array.from({ length }, (_, i) => [getX(i), getY(i)]));
        } else {
          reject(new Error('You need to specify at least x and y'));
        }
      }
    });

  /**
   * @param {import('./types').Points} newPoints
   * @param {import('./types').ScatterplotMethodOptions['draw']} options
   * @returns {Promise<void>}
   */
  const publicDraw = (newPoints, options = {}) =>
    toArrayOrientedPoints(newPoints).then(
      (points) =>
        new Promise((resolve) => {
          let pointsCached = false;
          if (points) {
            if (options.transition) {
              if (points.length === numPoints) {
                pointsCached = cachePoints(points);
              } else {
                console.warn(
                  'Cannot transition! The number of points between the previous and current draw call must be identical.'
                );
              }
            }
            setPoints(points);
            if (
              showPointConnections ||
              (options.showPointConnectionsOnce &&
                hasPointConnections(points[0]))
            ) {
              setPointConnections(points).then(() => {
                pubSub.publish('pointConnectionsDraw');
                draw = true;
                drawReticleOnce = options.showReticleOnce;
              });
            }
          }

          if (options.transition && pointsCached) {
            pubSub.subscribe(
              'transitionEnd',
              () => {
                // Point connects cannot be transitioned yet so we hide them during
                // the transition. Hence, we need to make sure we call `draw()` once
                // the transition has ended.
                draw = true;
                drawReticleOnce = options.showReticleOnce;
                resolve();
              },
              1
            );
            startTransition({
              duration: options.transitionDuration,
              easing: options.transitionEasing,
            });
          } else {
            pubSub.subscribe('draw', resolve, 1);
            draw = true;
            drawReticleOnce = options.showReticleOnce;
          }
        })
    );

  /** @type {<F extends Function>(f: F) => (...args: Parameters<F>) => ReturnType<F>} */
  const withDraw =
    (f) =>
    (...args) => {
      const out = f(...args);
      draw = true;
      return out;
    };

  /**
   * Get the bounding box of a set of points.
   * @param {number[]} pointIdxs - A list of point indices
   * @returns {import('./types').Rect} The bounding box
   */
  const getBBoxOfPoints = (pointIdxs) => {
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;

    for (let i = 0; i < pointIdxs.length; i++) {
      const [x, y] = searchIndex.points[pointIdxs[i]];
      xMin = Math.min(xMin, x);
      xMax = Math.max(xMax, x);
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }

    return { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
  };

  /**
   * Zoom to an area specified as a rectangle
   * @param {import('./types').Rect} rect - The rectangle to zoom to
   * @param {import('./types').ScatterplotMethodOptions['draw']} options
   * @returns {Promise<void>}
   */
  const zoomToArea = (rect, options = {}) =>
    new Promise((resolve) => {
      const target = [rect.x + rect.width / 2, rect.y + rect.height / 2];

      // Vertical field of view
      const vFOV = 2 * Math.atan(1 / camera.view[5]);

      const distance =
        rect.height * viewAspectRatio > rect.width
          ? // Distance is based on the height of the bounding box
            rect.height / 2 / Math.tan(vFOV / 2)
          : // Distance is based on the width of the bounding box
            rect.width / 2 / Math.tan((vFOV * viewAspectRatio) / 2);

      if (options.transition) {
        camera.config({ isFixed: true });
        cacheCamera(target, distance);
        pubSub.subscribe(
          'transitionEnd',
          () => {
            resolve();
            camera.config({ isFixed: false });
          },
          1
        );
        startTransition({
          duration: options.transitionDuration,
          easing: options.transitionEasing,
        });
      } else {
        camera.lookAt(target, distance);
        pubSub.subscribe('draw', resolve, 1);
        draw = true;
      }
    });

  /**
   * Zoom to a set of points
   * @param {number[]} pointIdxs - A list of point indices
   * @param {import('./types').ScatterplotMethodOptions['zoomToPoints']} options
   * @returns {Promise<void>}
   */
  const zoomToPoints = (pointIdxs, options = {}) => {
    const rect = getBBoxOfPoints(pointIdxs);
    const cX = rect.x + rect.width / 2;
    const cY = rect.y + rect.height / 2;

    const pointSizeNdc = getPointSizeNdc();
    const scale = 1 + (options.padding || 0);

    const w = Math.max(rect.width, pointSizeNdc) * scale;
    const h = Math.max(rect.height, pointSizeNdc) * scale;
    const x = cX - w / 2;
    const y = cY - h / 2;

    return zoomToArea({ x, y, width: w, height: h }, options);
  };

  /**
   * Zoom to a location specified in normalized devide coordinates.
   * @param {number[]} target - The camera target
   * @param {number} distance - The camera distance
   * @param {import('./types').ScatterplotMethodOptions['draw']} options
   * @returns {Promise<void>}
   */
  const zoomToLocation = (target, distance, options = {}) =>
    new Promise((resolve) => {
      if (options.transition) {
        camera.config({ isFixed: true });
        cacheCamera(target, distance);
        pubSub.subscribe(
          'transitionEnd',
          () => {
            resolve();
            camera.config({ isFixed: false });
          },
          1
        );
        startTransition({
          duration: options.transitionDuration,
          easing: options.transitionEasing,
        });
      } else {
        camera.lookAt(target, distance);
        pubSub.subscribe('draw', resolve, 1);
        draw = true;
      }
    });

  /**
   * Zoom to the origin
   * @param {import('./types').ScatterplotMethodOptions['draw']} options
   * @returns {Promise<void>}
   */
  const zoomToOrigin = (options = {}) => zoomToLocation([0, 0], 1, options);

  const updatePointConnectionStyle = () => {
    pointConnections.setStyle({
      color: getColors(
        pointConnectionColor,
        pointConnectionColorActive,
        pointConnectionColorHover
      ),
      opacity:
        pointConnectionOpacity === null ? null : pointConnectionOpacity[0],
      width: pointConnectionSize[0],
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
      createTextureFromUrl(renderer.regl, newBackgroundImage)
        .then((texture) => {
          backgroundImage = texture;
          draw = true;
          pubSub.publish('backgroundImageReady');
        })
        .catch(() => {
          console.error(`Count not create texture from ${newBackgroundImage}`);
          backgroundImage = null;
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
      camera.lookAt(camera.target, camera.distance[0], rotation);
  };

  const setCameraTarget = (target) => {
    if (target) camera.lookAt(target, camera.distance[0], camera.rotation);
  };

  const setCameraView = (view) => {
    if (view) camera.setView(view);
  };

  const setLassoColor = (newLassoColor) => {
    if (!newLassoColor) return;

    lassoColor = toRgba(newLassoColor, true);

    lasso.setStyle({ color: lassoColor });
  };

  const setLassoLineWidth = (newLassoLineWidth) => {
    if (Number.isNaN(+newLassoLineWidth) || +newLassoLineWidth < 1) return;

    lassoLineWidth = +newLassoLineWidth;

    lasso.setStyle({ width: lassoLineWidth });
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

  const setShowReticle = (newShowReticle) => {
    if (newShowReticle === null) return;

    showReticle = newShowReticle;
  };

  const setReticleColor = (newReticleColor) => {
    if (!newReticleColor) return;

    reticleColor = toRgba(newReticleColor, true);

    reticleHLine.setStyle({ color: reticleColor });
    reticleVLine.setStyle({ color: reticleColor });
  };

  const setXScale = (newXScale) => {
    if (!newXScale) return;

    xScale = newXScale;
    xDomainStart = newXScale.domain()[0];
    xDomainSize = newXScale ? newXScale.domain()[1] - newXScale.domain()[0] : 0;
    xScale.range([0, currentWidth]);
    updateScales();
  };

  const setYScale = (newYScale) => {
    if (!newYScale) return;

    yScale = newYScale;
    yDomainStart = yScale.domain()[0];
    yDomainSize = yScale ? yScale.domain()[1] - yScale.domain()[0] : 0;
    yScale.range([currentHeight, 0]);
    updateScales();
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
          draw = true;
        });
      }
    } else {
      setPointConnections();
    }
  };

  const setPointConnectionColors = (setter, getInheritance) => (newColors) => {
    if (newColors === 'inherit') {
      setter([...getInheritance()]);
    } else {
      const tmpColors = isMultipleColors(newColors) ? newColors : [newColors];
      setter(tmpColors.map((color) => toRgba(color, true)));
    }
    updatePointConnectionStyle();
  };

  const setPointConnectionColor = setPointConnectionColors(
    (newColors) => {
      pointConnectionColor = newColors;
    },
    () => pointColor
  );

  const setPointConnectionColorActive = setPointConnectionColors(
    (newColors) => {
      pointConnectionColorActive = newColors;
    },
    () => pointColorActive
  );

  const setPointConnectionColorHover = setPointConnectionColors(
    (newColors) => {
      pointConnectionColorHover = newColors;
    },
    () => pointColorHover
  );

  const setPointConnectionOpacity = (newOpacity) => {
    if (isConditionalArray(newOpacity, isPositiveNumber, { minLength: 1 }))
      pointConnectionOpacity = [...newOpacity];

    if (isStrictlyPositiveNumber(+newOpacity))
      pointConnectionOpacity = [+newOpacity];

    pointConnectionColor = pointConnectionColor.map((color) => {
      color[3] = !Number.isNaN(+pointConnectionOpacity[0])
        ? +pointConnectionOpacity[0]
        : color[3];
      return color;
    });

    updatePointConnectionStyle();
  };

  const setPointConnectionOpacityActive = (newOpacity) => {
    if (!Number.isNaN(+newOpacity) && +newOpacity)
      pointConnectionOpacityActive = +newOpacity;
  };

  const setPointConnectionSize = (newPointConnectionSize) => {
    if (
      isConditionalArray(newPointConnectionSize, isPositiveNumber, {
        minLength: 1,
      })
    )
      pointConnectionSize = [...newPointConnectionSize];

    if (isStrictlyPositiveNumber(+newPointConnectionSize))
      pointConnectionSize = [+newPointConnectionSize];

    updatePointConnectionStyle();
  };

  const setPointConnectionSizeActive = (newPointConnectionSizeActive) => {
    if (
      !Number.isNaN(+newPointConnectionSizeActive) &&
      +newPointConnectionSizeActive
    )
      pointConnectionSizeActive = Math.max(0, newPointConnectionSizeActive);
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

  const setOpacityByDensityFill = (newOpacityByDensityFill) => {
    opacityByDensityFill = +newOpacityByDensityFill;
  };

  const setOpacityInactiveMax = (newOpacityInactiveMax) => {
    opacityInactiveMax = +newOpacityInactiveMax;
  };

  const setOpacityInactiveScale = (newOpacityInactiveScale) => {
    opacityInactiveScale = +newOpacityInactiveScale;
  };

  const setGamma = (newGamma) => {
    renderer.gamma = newGamma;
  };

  /** @type {<Key extends keyof import('./types').Properties>(property: Key) => import('./types').Properties[Key] } */
  const get = (property) => {
    checkDeprecations({ property: true });

    if (property === 'aspectRatio') return dataAspectRatio;
    if (property === 'background') return backgroundColor;
    if (property === 'backgroundColor') return backgroundColor;
    if (property === 'backgroundImage') return backgroundImage;
    if (property === 'camera') return camera;
    if (property === 'cameraTarget') return camera.target;
    if (property === 'cameraDistance') return camera.distance[0];
    if (property === 'cameraRotation') return camera.rotation;
    if (property === 'cameraView') return camera.view;
    if (property === 'canvas') return canvas;
    if (property === 'colorBy') return colorBy;
    if (property === 'sizeBy') return sizeBy;
    if (property === 'deselectOnDblClick') return deselectOnDblClick;
    if (property === 'deselectOnEscape') return deselectOnEscape;
    if (property === 'height') return height;
    if (property === 'lassoColor') return lassoColor;
    if (property === 'lassoLineWidth') return lassoLineWidth;
    if (property === 'lassoMinDelay') return lassoMinDelay;
    if (property === 'lassoMinDist') return lassoMinDist;
    if (property === 'lassoClearEvent') return lassoClearEvent;
    if (property === 'lassoInitiator') return lassoInitiator;
    if (property === 'lassoInitiatorElement') return lassoManager.initiator;
    if (property === 'lassoInitiatorParentElement')
      return lassoInitiatorParentElement;
    if (property === 'keyMap') return { ...keyMap };
    if (property === 'mouseMode') return mouseMode;
    if (property === 'opacity')
      return opacity.length === 1 ? opacity[0] : opacity;
    if (property === 'opacityBy') return opacityBy;
    if (property === 'opacityByDensityFill') return opacityByDensityFill;
    if (property === 'opacityByDensityDebounceTime')
      return opacityByDensityDebounceTime;
    if (property === 'opacityInactiveMax') return opacityInactiveMax;
    if (property === 'opacityInactiveScale') return opacityInactiveScale;
    if (property === 'points') return searchIndex.points;
    if (property === 'pointsInView') return getPointsInView();
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
    if (property === 'pointSize')
      return pointSize.length === 1 ? pointSize[0] : pointSize;
    if (property === 'pointSizeSelected') return pointSizeSelected;
    if (property === 'pointSizeMouseDetection') return pointSizeMouseDetection;
    if (property === 'showPointConnections') return showPointConnections;
    if (property === 'pointConnectionColor')
      return pointConnectionColor.length === 1
        ? pointConnectionColor[0]
        : pointConnectionColor;
    if (property === 'pointConnectionColorActive')
      return pointConnectionColorActive.length === 1
        ? pointConnectionColorActive[0]
        : pointConnectionColorActive;
    if (property === 'pointConnectionColorHover')
      return pointConnectionColorHover.length === 1
        ? pointConnectionColorHover[0]
        : pointConnectionColorHover;
    if (property === 'pointConnectionColorBy') return pointConnectionColorBy;
    if (property === 'pointConnectionOpacity')
      return pointConnectionOpacity.length === 1
        ? pointConnectionOpacity[0]
        : pointConnectionOpacity;
    if (property === 'pointConnectionOpacityBy')
      return pointConnectionOpacityBy;
    if (property === 'pointConnectionOpacityActive')
      return pointConnectionOpacityActive;
    if (property === 'pointConnectionSize')
      return pointConnectionSize.length === 1
        ? pointConnectionSize[0]
        : pointConnectionSize;
    if (property === 'pointConnectionSizeActive')
      return pointConnectionSizeActive;
    if (property === 'pointConnectionSizeBy') return pointConnectionSizeBy;
    if (property === 'pointConnectionMaxIntPointsPerSegment')
      return pointConnectionMaxIntPointsPerSegment;
    if (property === 'pointConnectionTolerance')
      return pointConnectionTolerance;
    if (property === 'reticleColor') return reticleColor;
    if (property === 'regl') return renderer.regl;
    if (property === 'showReticle') return showReticle;
    if (property === 'version') return version;
    if (property === 'width') return width;
    if (property === 'xScale') return xScale;
    if (property === 'yScale') return yScale;
    if (property === 'performanceMode') return performanceMode;
    if (property === 'gamma') return renderer.gamma;
    if (property === 'renderer') return renderer;

    return undefined;
  };

  /** @type {(properties: Partial<import('./types').Settable>) => void} */
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

    if (properties.pointConnectionOpacityBy !== undefined) {
      setPointConnectionOpacityBy(properties.pointConnectionOpacityBy);
    }

    if (properties.pointConnectionOpacity !== undefined) {
      setPointConnectionOpacity(properties.pointConnectionOpacity);
    }

    if (properties.pointConnectionOpacityActive !== undefined) {
      setPointConnectionOpacityActive(properties.pointConnectionOpacityActive);
    }

    if (properties.pointConnectionSize !== undefined) {
      setPointConnectionSize(properties.pointConnectionSize);
    }

    if (properties.pointConnectionSizeActive !== undefined) {
      setPointConnectionSizeActive(properties.pointConnectionSizeActive);
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

    if (properties.lassoLineWidth !== undefined) {
      setLassoLineWidth(properties.lassoLineWidth);
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

    if (properties.showReticle !== undefined) {
      setShowReticle(properties.showReticle);
    }

    if (properties.reticleColor !== undefined) {
      setReticleColor(properties.reticleColor);
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

    if (properties.opacityByDensityFill !== undefined) {
      setOpacityByDensityFill(properties.opacityByDensityFill);
    }

    if (properties.opacityInactiveMax !== undefined) {
      setOpacityInactiveMax(properties.opacityInactiveMax);
    }

    if (properties.opacityInactiveScale !== undefined) {
      setOpacityInactiveScale(properties.opacityInactiveScale);
    }

    if (properties.gamma !== undefined) {
      setGamma(properties.gamma);
    }

    // setWidth and setHeight can be async when width or height are set to
    // 'auto'. And since draw() would have anyway been async we can just make
    // all calls async.
    return new Promise((resolve) => {
      window.requestAnimationFrame(() => {
        if (!canvas) return; // Instance was destroyed in between
        updateViewAspectRatio();
        camera.refresh();
        renderer.refresh();
        draw = true;
        resolve();
      });
    });
  };

  /**
   * @param {number[]} cameraView
   * @param {import('./types').ScatterplotMethodOptions['preventEvent']} options
   */
  const view = (cameraView, { preventEvent = false } = {}) => {
    setCameraView(cameraView);
    draw = true;
    preventEventView = preventEvent;
  };

  /**
   * @param {number | number[]} point
   * @param {import('./types').ScatterplotMethodOptions['hover']} options
   */
  const hover = (
    point,
    { showReticleOnce = false, preventEvent = false } = {}
  ) => {
    let needsRedraw = false;

    if (point >= 0 && point < numPoints) {
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
      if (newHoveredPoint && !preventEvent)
        pubSub.publish('pointover', hoveredPoint);
    } else {
      needsRedraw = +hoveredPoint >= 0;
      if (needsRedraw) {
        if (!selectionSet.has(hoveredPoint)) {
          setPointConnectionColorState([hoveredPoint], 0);
        }
        if (!preventEvent) {
          pubSub.publish('pointout', hoveredPoint);
        }
      }
      hoveredPoint = undefined;
    }

    if (needsRedraw) {
      draw = true;
      drawReticleOnce = showReticleOnce;
    }
  };

  const initCamera = () => {
    if (!camera)
      camera = createDom2dCamera(canvas, { isPanInverted: [false, true] });

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

    topRightNdc = getScatterGlPos(1, 1);
    bottomLeftNdc = getScatterGlPos(-1, -1);
  };

  /**
   * @param {import('./types').ScatterplotMethodOptions['preventEvent']} options
   */
  const reset = ({ preventEvent = false } = {}) => {
    initCamera();
    updateScales();

    if (preventEvent) return;

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
    draw = true;
  };

  const wheelHandler = () => {
    draw = true;
  };

  /** @type {() => void} */
  const clear = () => {
    setPoints([]);
    pointConnections.clear();
  };

  const resizeHandler = () => {
    camera.refresh();
    const autoWidth = width === AUTO;
    const autoHeight = height === AUTO;
    if (autoWidth || autoHeight) {
      const { width: newWidth, height: newHeight } =
        canvas.getBoundingClientRect();

      if (autoWidth) setCurrentWidth(newWidth);
      if (autoHeight) setCurrentHeight(newHeight);

      updateViewAspectRatio();
      draw = true;
    }
  };

  /** @type {() => ImageData} */
  const exportFn = () =>
    canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

  const init = () => {
    updateViewAspectRatio();
    initCamera();
    updateScales();

    lasso = createLine(renderer.regl, {
      color: lassoColor,
      width: lassoLineWidth,
      is2d: true,
    });
    pointConnections = createLine(renderer.regl, {
      color: pointConnectionColor,
      colorHover: pointConnectionColorHover,
      colorActive: pointConnectionColorActive,
      opacity:
        pointConnectionOpacity === null ? null : pointConnectionOpacity[0],
      width: pointConnectionSize[0],
      widthActive: pointConnectionSizeActive,
      is2d: true,
    });
    reticleHLine = createLine(renderer.regl, {
      color: reticleColor,
      width: 1,
      is2d: true,
    });
    reticleVLine = createLine(renderer.regl, {
      color: reticleColor,
      width: 1,
      is2d: true,
    });
    computePointSizeMouseDetection();

    // Event listeners
    canvas.addEventListener('wheel', wheelHandler);

    // Buffers
    normalPointsIndexBuffer = renderer.regl.buffer();
    selectedPointsIndexBuffer = renderer.regl.buffer();
    hoveredPointIndexBuffer = renderer.regl.buffer({
      usage: 'dynamic',
      type: 'float',
      length: FLOAT_BYTES * 2, // This buffer is fixed to exactly 1 point consisting of 2 coordinates
    });

    colorTex = createColorTexture();
    encodingTex = createEncodingTexture();

    // Set dimensions
    const whenSet = set({
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

    if ('ResizeObserver' in window) {
      canvasObserver = new ResizeObserver(resizeHandler);
      canvasObserver.observe(canvas);
    } else {
      window.addEventListener('resize', resizeHandler);
      window.addEventListener('orientationchange', resizeHandler);
    }

    whenSet.then(() => {
      pubSub.publish('init');
    });
  };

  const cancelFrameListener = renderer.onFrame(() => {
    // Update camera: this needs to happen on every
    isViewChanged = camera.tick();

    if (!isInit || !(draw || isTransitioning)) return;

    if (isTransitioning && !tween(transitionDuration, transitionEasing))
      endTransition();

    if (isViewChanged) {
      topRightNdc = getScatterGlPos(1, 1);
      bottomLeftNdc = getScatterGlPos(-1, -1);
      if (opacityBy === 'density') getNumPointsInViewDb();
    }

    renderer.render((widthRatio, heightRatio) => {
      updateProjectionMatrix(widthRatio, heightRatio);

      // eslint-disable-next-line no-underscore-dangle
      if (backgroundImage && backgroundImage._reglType) {
        drawBackgroundImage();
      }

      if (lassoPointsCurr.length > 2) drawPolygon2d();

      // The draw order of the following calls is important!
      if (!isTransitioning) {
        pointConnections.draw({
          projection: getProjection(),
          model: getModel(),
          view: getView(),
        });
      }

      drawPointBodies();
      if (!mouseDown && (showReticle || drawReticleOnce)) drawReticle();
      if (hoveredPoint >= 0) drawHoveredPoint();
      if (selection.length) drawSelectedPoints();

      lasso.draw({
        projection: getProjection(),
        model: getModel(),
        view: getView(),
      });
    }, canvas);

    // Publish camera change
    if (isViewChanged) {
      updateScales();

      if (preventEventView) {
        preventEventView = false;
      } else {
        pubSub.publish('view', {
          view: camera.view,
          camera,
          xScale,
          yScale,
        });
      }
    }

    draw = false;
    drawReticleOnce = false;

    pubSub.publish('draw');
  });

  const redraw = () => {
    draw = true;
  };

  const destroy = () => {
    cancelFrameListener();
    window.removeEventListener('keyup', keyUpHandler, false);
    window.removeEventListener('blur', blurHandler, false);
    window.removeEventListener('mouseup', mouseUpHandler, false);
    window.removeEventListener('mousemove', mouseMoveHandler, false);
    canvas.removeEventListener('mousedown', mouseDownHandler, false);
    canvas.removeEventListener('mouseenter', mouseEnterCanvasHandler, false);
    canvas.removeEventListener('mouseleave', mouseLeaveCanvasHandler, false);
    canvas.removeEventListener('click', mouseClickHandler, false);
    canvas.removeEventListener('dblclick', mouseDblClickHandler, false);
    if (canvasObserver) {
      canvasObserver.disconnect();
    } else {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('orientationchange', resizeHandler);
    }
    canvas = undefined;
    camera.dispose();
    camera = undefined;
    lasso.destroy();
    pointConnections.destroy();
    reticleHLine.destroy();
    reticleVLine.destroy();
    pubSub.publish('destroy');
    pubSub.clear();
    if (!initialProperties.renderer) {
      // Since the user did not pass in an externally created renderer we can
      // assume that the renderer is only used by this scatter plot instance.
      // Therefore it's save to destroy it when this scatter plot instance is
      // destroyed.
      renderer.destroy();
    }
  };

  init();

  return {
    /**
     * Get whether the browser supports all necessary WebGL features
     * @return {boolean} If `true` the browser supports all necessary WebGL features
     */
    get isSupported() {
      return renderer.isSupported;
    },
    clear: withDraw(clear),
    createTextureFromUrl: (
      /** @type {string} */ url,
      /** @type {number} */ timeout = DEFAULT_IMAGE_LOAD_TIMEOUT
    ) => createTextureFromUrl(renderer.regl, url, timeout),
    deselect,
    destroy,
    draw: publicDraw,
    get,
    hover,
    redraw,
    refresh: renderer.refresh,
    reset: withDraw(reset),
    select,
    set,
    export: exportFn,
    subscribe: pubSub.subscribe,
    unsubscribe: pubSub.unsubscribe,
    view,
    zoomToLocation,
    zoomToArea,
    zoomToPoints,
    zoomToOrigin,
  };
};

export default createScatterplot;

export { createRegl, createRenderer, createTextureFromUrl };

export { checkReglExtensions as checkSupport } from './utils';
