import canvasCamera2d from "canvas-camera-2d";
import KDBush from "kdbush";
import createMousePos from "mouse-position";
import createMousePressed from "mouse-pressed";
import createPubSub from "pub-sub-es";
import createRegl from "regl";
import createScroll from "scroll-speed";
import { throttle as withThrottle } from "lodash";
import withRaf from "with-raf";
import { mat4, vec4 } from "gl-matrix";
import createLine from "regl-line";

import POINT_FS from "./point.fs";
import POINT_VS from "./point.vs";

import DEFAULT from "./defaults.js";

import { dist } from "./utils.js";

const CLICK_DELAY = 250;
const LASSO_MIN_DELAY = 25;
const LASSO_MIN_DIST = 8;
const COLOR_NORMAL_IDX = 0;
const COLOR_ACTIVE_IDX = 1;
// const COLOR_HOVER_IDX = 2;
const COLOR_BG_IDX = 3;
const FLOAT_BYTES = Float32Array.BYTES_PER_ELEMENT;
const UINT8_BYTES = Uint8ClampedArray.BYTES_PER_ELEMENT;

const createScatterplot = ({
  canvas: initCanvas = document.createElement("canvas"),
  colorMap: initColorMap = DEFAULT.COLORMAP,
  pointSize: initPointSize = DEFAULT.POINT_SIZE,
  pointSizeSelected: initPointSizeSelected = DEFAULT.POINT_SIZE_SELECTED,
  pointOutlineWidth: initPointOutlineWidth = DEFAULT.POINT_OUTLINE_WIDTH,
  width: initWidth = DEFAULT.WIDTH,
  height: initHeight = DEFAULT.HEIGHT
} = {}) => {
  const pubSub = createPubSub();
  const scratch = new Float32Array(16);

  let canvas = initCanvas;
  let width = initWidth;
  let height = initHeight;
  let pointSize = initPointSize;
  let pointSizeSelected = initPointSizeSelected;
  let pointOutlineWidth = initPointOutlineWidth;
  let colorMap = initColorMap;
  let camera;
  let lasso;
  let regl;
  let scroll;
  let mousePosition;
  let mousePressed;
  let mouseDown;
  let mouseDownShift = false;
  let mouseDownTime;
  let mouseDownX;
  let mouseDownY;
  let numPoints = 0;
  let isInit = false;
  let selection = [];
  let lassoPos = [];
  let lassoScatterPos = [];
  let lassoPrevMousePos;
  let searchIndex;
  let aspectRatio = width / height;
  let projection = mat4.fromScaling([], [1 / aspectRatio, 1, 1]);
  let model = mat4.fromScaling([], [aspectRatio, 1, 1]);
  let isViewChanged = false;

  let positionTex; // Stores the point texture
  let positionTexRes = 0; // Width and height of the texture
  let positionIndex;
  let positionIndexBuffer;

  let colorTex; // Stores the color texture
  let colorTexRes = 0; // Width and height of the texture
  let colorIndex;
  let colorIndexBuffer;

  let highlightIndexBuffer;

  let colors = {
    normal: [0.66, 0.66, 0.66, 1],
    active: [0, 0.55, 1, 1],
    inactive: [0.2, 0.2, 0.2, 1],
    background: [0, 0, 0, 1]
  };

  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;

  const keyUpHandler = ({ key }) => {
    switch (key) {
      case "Escape":
        deselect();
        break;
    }
  };

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
          drawRaf();
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

  const deselect = () => {
    if (selection.length) {
      pubSub.publish("deselect");
      selection.forEach(point => {
        colorIndex[point] = 0;
      });
      colorIndexBuffer.subdata(colorIndex, 0);
      selection = [];
      drawRaf();
    }
  };

  const select = points => {
    selection.forEach(i => {
      colorIndex[i] = 0;
    });

    selection = points;

    highlightIndexBuffer({
      usage: "dynamic",
      type: "float",
      length: FLOAT_BYTES,
      data: new Float32Array(selection)
    });

    pubSub.publish("select", {
      points: selection
    });

    drawRaf();
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
      if (clostestPoint) select([clostestPoint]);
      else deselect();
    }
  };

  const mouseMoveHandler = () => {
    if (mouseDown) drawRaf();
    if (mouseDownShift) lassoDb();
  };

  const createColorTexture = (colors = Object.values(DEFAULT.COLORS)) => {
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
      type: "float"
    });
  };

  const initRegl = (c = canvas) => {
    const gl = c.getContext("webgl");
    const extensions = [];

    // Needed to run the tests properly as the headless-gl doesn't support all
    // extensions, which is fine for the functional tests.
    if (gl.getExtension("OES_standard_derivatives")) {
      extensions.push("OES_standard_derivatives");
    } else {
      console.warn("WebGL: OES_standard_derivatives extension not supported.");
    }

    if (gl.getExtension("OES_texture_float")) {
      extensions.push("OES_texture_float");
    } else {
      console.warn("WebGL: OES_texture_float extension not supported.");
    }

    regl = createRegl({ gl, extensions });
    camera = canvasCamera2d(c, {
      target: DEFAULT.TARGET,
      distance: DEFAULT.DISTANCE,
      rotation: DEFAULT.ROTATION
    });
    lasso = createLine(regl, { width: 3, is2d: true });
    scroll = createScroll(c);
    mousePosition = createMousePos(c);
    mousePressed = createMousePressed(c);

    // Event listeners
    scroll.on("scroll", () => {
      drawRaf();
    });
    mousePosition.on("move", mouseMoveHandler);
    mousePressed.on("down", mouseDownHandler);
    mousePressed.on("up", mouseUpHandler);

    // Buffers
    colorIndexBuffer = regl.buffer();
    positionIndexBuffer = regl.buffer();
    highlightIndexBuffer = regl.buffer();

    colorTex = createColorTexture();
  };

  const destroy = () => {
    canvas = undefined;
    camera = undefined;
    regl = undefined;
    lasso.destroy();
    scroll.dispose();
    mousePosition.dispose();
    mousePressed.dispose();
  };

  const updateRatio = () => {
    aspectRatio = width / height;
    projection = mat4.fromScaling([], [1 / aspectRatio, 1, 1]);
    model = mat4.fromScaling([], [aspectRatio, 1, 1]);
  };

  const canvasGetter = () => canvas;
  const canvasSetter = newCanvas => {
    canvas = newCanvas;
    initRegl(canvas);
  };
  const colorsGetter = () => colors;
  const colorsSetter = newColors => {
    if (Array.isArray(newColors)) {
      for (let i = 0; i < 4; i++) {
        colors[i] = newColors[i] || DEFAULT.COLORS[i];
      }
    }
    try {
      colorTex = createColorIndex();
    } catch (e) {
      colors = DEFAULT.COLORS;
      colorTex = createColorIndex();
      console.error("Invalid colors. Switching back to default colors.");
    }
  };
  const colorMapGetter = () => colorMap;
  const colorMapSetter = newColorMap => {
    colorMap = newColorMap || DEFAULT.COLORMAP;
  };
  const heightGetter = () => height;
  const heightSetter = newHeight => {
    height = +newHeight || DEFAULT.HEIGHT;
    canvas.height = height * window.devicePixelRatio;
    updateRatio();
    camera.refresh();
  };
  const pointSizeGetter = () => pointSize;
  const pointSizeSetter = newPointSize => {
    pointSize = +newPointSize || DEFAULT.POINT_SIZE;
  };
  const pointSizeSelectedGetter = () => pointSizeSelected;
  const pointSizeSelectedSetter = newPointSizeSelected => {
    pointSizeSelected = +newPointSizeSelected || DEFAULT.POINT_SIZE_SELECTED;
  };
  const pointOutlineWidthGetter = () => pointOutlineWidth;
  const pointOutlineWidthSetter = newPointOutlineWidth => {
    pointOutlineWidth = +newPointOutlineWidth || DEFAULT.POINT_OUTLINE_WIDTH;
  };
  const widthGetter = () => width;
  const widthSetter = newWidth => {
    width = +newWidth || DEFAULT.WIDTH;
    canvas.width = width * window.devicePixelRatio;
    updateRatio();
    camera.refresh();
  };

  initRegl(canvas);

  const getColorIndexBuffer = () => colorIndexBuffer;
  const getColorTex = () => colorTex;
  const getColorTexRes = () => colorTexRes;
  const getPositionIndexBuffer = () => positionIndexBuffer;
  const getHighlightIndexBuffer = () => highlightIndexBuffer;
  const getPointSize = () => pointSize * window.devicePixelRatio;
  const getPositionTex = () => positionTex;
  const getPositionTexRes = () => positionTexRes;
  const getProjection = () => projection;
  const getView = () => camera.view;
  const getModel = () => model;
  const getNumPoints = () => numPoints;

  const drawPoints = (
    getPointSize,
    getNumPoints,
    getPositionIndexBuffer,
    globalState = COLOR_NORMAL_IDX
  ) =>
    regl({
      frag: POINT_FS,
      vert: POINT_VS,

      blend: {
        enable: true,
        func: {
          srcRGB: "src alpha",
          srcAlpha: "one",
          dstRGB: "one minus src alpha",
          dstAlpha: "one minus src alpha"
        }
      },

      depth: { enable: false },

      attributes: {
        colorIndex: {
          buffer: getColorIndexBuffer,
          size: 1
        },
        positionIndex: {
          buffer: getPositionIndexBuffer,
          size: 1
        }
      },

      uniforms: {
        projection: getProjection,
        model: getModel,
        view: getView,
        pointSize: getPointSize,
        globalState,
        colorTex: getColorTex,
        colorTexRes: getColorTexRes,
        positionTex: getPositionTex,
        positionTexRes: getPositionTexRes
      },

      count: getNumPoints,

      primitive: "points"
    });

  const drawPointBodies = drawPoints(
    getPointSize,
    getNumPoints,
    getPositionIndexBuffer
  );

  const drawSelectedPoint = () => {
    const numOutlinedPoints = selection.length;
    const size = pointSize + pointSizeSelected;

    // Draw outer outline
    drawPoints(
      () => (size + pointOutlineWidth * 2) * window.devicePixelRatio,
      () => numOutlinedPoints,
      getHighlightIndexBuffer,
      COLOR_ACTIVE_IDX
    )();

    // Draw inner outline
    drawPoints(
      () => (size + pointOutlineWidth) * window.devicePixelRatio,
      () => numOutlinedPoints,
      getHighlightIndexBuffer,
      COLOR_BG_IDX
    )();

    // Draw body
    drawPoints(
      () => size * window.devicePixelRatio,
      () => numOutlinedPoints,
      getHighlightIndexBuffer,
      COLOR_ACTIVE_IDX
    )();
  };

  const createColorIndex = numPoints => new Uint8ClampedArray(numPoints);

  // const createPointState = newPoints => {
  //   const state = new Float32Array(newPoints.length * 2);
  //   for (let i = 0; i < newPoints.length; ++i) {
  //     state[i * 2] = newPoints[i][0]; // x
  //     state[i * 2 + 1] = newPoints[i][1]; // y
  //   }
  //   return state;
  // };

  const createPositionIndex = numPoints => {
    const index = new Float32Array(numPoints);

    for (let i = 0; i < numPoints; ++i) {
      index[i] = i;
    }

    return index;
  };

  const createPositionTexture = newPoints => {
    positionTexRes = Math.max(2, Math.ceil(Math.sqrt(numPoints)));
    const data = new Float32Array(positionTexRes ** 2 * 2);

    for (let i = 0; i < numPoints; ++i) {
      data[i * 2] = newPoints[i][0]; // x
      data[i * 2 + 1] = newPoints[i][1]; // y
    }

    return regl.texture({
      data: data,
      shape: [positionTexRes, positionTexRes, 2],
      type: "float"
    });
  };

  const setPoints = newPoints => {
    numPoints = newPoints.length;

    positionTex = createPositionTexture(newPoints);

    positionIndex = createPositionIndex(numPoints);
    positionIndexBuffer({
      usage: "static",
      type: "float",
      length: FLOAT_BYTES,
      data: positionIndex
    });

    colorIndex = createColorIndex(numPoints);
    colorIndexBuffer({
      usage: "static",
      type: "uint8",
      length: UINT8_BYTES,
      data: colorIndex
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

    // Draw the points
    drawPointBodies();
    if (selection.length) drawSelectedPoint();

    lasso.draw();

    // Publish camera change
    if (isViewChanged) pubSub.publish("camera", camera.position);
  };

  const drawRaf = withRaf(draw);

  const refresh = () => {
    regl.poll();
  };

  const reset = () => {
    camera.lookAt([...DEFAULT.TARGET], DEFAULT.DISTANCE);
    drawRaf();
    pubSub.publish("camera", camera.position);
  };

  window.addEventListener("keyup", keyUpHandler, false);
  window.addEventListener("blur", mouseUpHandler, false);

  return {
    get canvas() {
      return canvasGetter();
    },
    set canvas(arg) {
      return canvasSetter(arg);
    },
    get colors() {
      return colorsGetter();
    },
    set colors(arg) {
      return colorsSetter(arg);
    },
    get colorMap() {
      return colorMapGetter();
    },
    set colorMap(arg) {
      return colorMapSetter(arg);
    },
    get height() {
      return heightGetter();
    },
    set height(arg) {
      return heightSetter(arg);
    },
    get pointSize() {
      return pointSizeGetter();
    },
    set pointSize(arg) {
      return pointSizeSetter(arg);
    },
    get pointSizeSelected() {
      return pointSizeSelectedGetter();
    },
    set pointSizeSelected(arg) {
      return pointSizeSelectedSetter(arg);
    },
    get pointOutlineWidth() {
      return pointOutlineWidthGetter();
    },
    set pointOutlineWidth(arg) {
      return pointOutlineWidthSetter(arg);
    },
    get width() {
      return widthGetter();
    },
    set width(arg) {
      return widthSetter(arg);
    },
    draw: drawRaf,
    refresh,
    destroy,
    reset,
    subscribe: pubSub.subscribe,
    unsubscribe: pubSub.unsubscribe
  };
};

export default createScatterplot;
