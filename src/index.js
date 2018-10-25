import canvasCamera2d from "canvas-camera-2d";
import KDBush from "kdbush";
import createMousePos from "mouse-position";
import createMousePrs from "mouse-pressed";
import createPubSub from "pub-sub-es";
import createRegl from "regl";
import createScroll from "scroll-speed";
import { throttle as withThrottle } from "lodash";
import withRaf from "with-raf";
import { mat4, vec4 } from "gl-matrix";

import createLine from "regl-line";

import FRAG_SHADER from "./point.fs";
import VERT_SHADER from "./point.vs";

const DEFAULT_POINT_SIZE = 3;
const DEFAULT_POINT_SIZE_HIGHLIGHT = 3;
const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 100;
const DEFAULT_PADDING = 0;
const DEFAULT_COLORMAP = [];
const DEFAULT_TARGET = [0, 0];
const DEFAULT_DISTANCE = 1;
const DEFAULT_ROTATION = 0;
const CLICK_DELAY = 250;
const LASSO_MIN_DELAY = 25;
const LASSO_MIN_DIST = 8;

const dist = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

const Scatterplot = ({
  canvas: initCanvas = document.createElement("canvas"),
  colorMap: initColorMap = DEFAULT_COLORMAP,
  pointSize: initPointSize = DEFAULT_POINT_SIZE,
  pointSizeHighlight: initPointSizeHighlight = DEFAULT_POINT_SIZE_HIGHLIGHT,
  width: initWidth = DEFAULT_WIDTH,
  height: initHeight = DEFAULT_HEIGHT,
  padding: initPadding = DEFAULT_PADDING
} = {}) => {
  const pubSub = createPubSub();
  const scratch = new Float32Array(16);
  const viewInv = new Float32Array(16);

  let canvas = initCanvas;
  let width = initWidth;
  let height = initHeight;
  let padding = initPadding;
  let pointSize = initPointSize;
  let pointSizeHighlight = initPointSizeHighlight;
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
  let points = [];
  let selection = [];
  let lassoGlPos = [];
  let lassoPrevMousePos;
  let searchIndex;
  let aspectRatio = width / height;
  let projection = mat4.fromScaling([], [1 / aspectRatio, 1, 1]);
  let model = mat4.fromScaling([], [aspectRatio, 1, 1]);
  let isViewChanged = false;

  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;

  const keyUpHandler = ({ key }) => {
    switch (key) {
      case "Escape":
        unselect();
        break;
    }
  };

  const getMousePos = () => {
    mousePosition.flush();
    return [mousePosition[0], mousePosition[1]];
  };

  const getMouseGlPos = ([x, y] = getMousePos()) => {
    // Get relative WebGL position
    const relX = -1 + (x / width) * 2;
    const relY = 1 + (y / height) * -2;

    // Homogeneous vector
    const v = [relX, relY, 1, 1];

    // projection^-1 * view^-1 * model^-1 is the same as
    // model * view^-1 * projection
    const mvp = mat4.multiply(
      scratch,
      model,
      mat4.multiply(scratch, viewInv, projection)
    );

    // Translate vector
    vec4.transformMat4(v, v, mvp);

    return v.slice(0, 2);
  };

  const raycast = () => {
    const [x, y] = getMouseGlPos();

    // Find the closest point
    let minDist = Infinity;
    let clostestPoint;
    points.forEach(([ptX, ptY], i) => {
      const d = dist(ptX, ptY, x, y);
      if (d < minDist) {
        minDist = d;
        clostestPoint = i;
      }
    });

    if (minDist < (pointSize / width) * 2) return clostestPoint;
  };

  const lassoExtend = () => {
    const currMousePos = getMousePos();

    if (!lassoPrevMousePos) {
      lassoGlPos.push(...getMouseGlPos(currMousePos));
      lassoPrevMousePos = currMousePos;
    } else {
      const d = dist(...currMousePos, ...lassoPrevMousePos);

      if (d > LASSO_MIN_DIST) {
        lassoGlPos.push(...getMouseGlPos(currMousePos));
        lassoPrevMousePos = currMousePos;
        if (lassoGlPos.length > 2) {
          lasso.setPoints(lassoGlPos);
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
    // next we text each point in the bounding box if it is in the polygon too
    const ptsInPoly = [];
    pointsInBBox.forEach(pointIdx => {
      if (pointInPoly(points[pointIdx], lassoPolygon)) ptsInPoly.push(pointIdx);
    });

    return ptsInPoly;
  };

  const lassoEnd = () => {
    // const t0 = performance.now();
    const ptsInLasso = findPointsInLasso(lassoGlPos);
    // console.log(`found ${ptsInLasso.length} in ${performance.now() - t0} msec`);
    select(ptsInLasso);
    lassoGlPos = [];
    lassoPrevMousePos = undefined;
    lasso.clear();
    drawRaf();
  };

  const unselect = () => {
    if (selection.length) {
      pubSub.publish("unselect");
      selection = [];
      drawRaf();
    }
  };

  const select = points => {
    selection = points;

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
      else unselect();
    }
  };

  const mouseMoveHandler = () => {
    if (mouseDown) drawRaf();
    if (mouseDownShift) lassoDb();
  };

  const init = (c = canvas) => {
    regl = createRegl({ canvas: c, extensions: ["OES_standard_derivatives"] });
    camera = canvasCamera2d(c, {
      target: DEFAULT_TARGET,
      distance: DEFAULT_DISTANCE,
      rotation: DEFAULT_ROTATION
    });
    lasso = createLine(regl, { width: 3, is2d: true });
    scroll = createScroll(c);
    mousePosition = createMousePos(c);
    mousePressed = createMousePrs(c);

    scroll.on("scroll", () => {
      drawRaf();
    });
    mousePosition.on("move", mouseMoveHandler);
    mousePressed.on("down", mouseDownHandler);
    mousePressed.on("up", mouseUpHandler);

    mat4.invert(viewInv, camera.view);
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
    init(canvas);
  };
  const colorMapGetter = () => colorMap;
  const colorMapSetter = newColorMap => {
    colorMap = newColorMap || DEFAULT_COLORMAP;
  };
  const heightGetter = () => height;
  const heightSetter = newHeight => {
    height = +newHeight || DEFAULT_HEIGHT;
    canvas.height = height * window.devicePixelRatio;
    updateRatio();
    camera.refresh();
  };
  const paddingGetter = () => padding;
  const paddingSetter = newPadding => {
    padding = +newPadding || DEFAULT_PADDING;
    padding = Math.max(0, Math.min(0.5, padding));
  };
  const pointSizeGetter = () => pointSize;
  const pointSizeSetter = newPointSize => {
    pointSize = +newPointSize || DEFAULT_POINT_SIZE;
  };
  const pointSizeHighlightGetter = () => pointSizeHighlight;
  const pointSizeselectionetter = newPointSizeHighlight => {
    pointSizeHighlight = +newPointSizeHighlight || DEFAULT_POINT_SIZE_HIGHLIGHT;
  };
  const widthGetter = () => width;
  const widthSetter = newWidth => {
    width = +newWidth || DEFAULT_WIDTH;
    canvas.width = width * window.devicePixelRatio;
    updateRatio();
    camera.refresh();
  };

  init(canvas);

  const drawPoints = pointsToBeDrawn => {
    return regl({
      frag: FRAG_SHADER,
      vert: VERT_SHADER,

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
        // each of these gets mapped to a single entry for each of the points.
        // this means the vertex shader will receive just the relevant value for
        // a given point.
        position: pointsToBeDrawn.map(d => d.slice(0, 2)),
        color: pointsToBeDrawn.map(d => d[2]),
        extraPointSize: pointsToBeDrawn.map(d => d[3] || 0)
      },

      uniforms: {
        // Total area that is being used. Value must be in [0, 1]
        basePointSize: regl.prop("basePointSize"),
        projection: () => projection,
        model: () => model,
        view: () => camera.view,
        aspectRatio: ({ viewportWidth, viewportHeight }) =>
          viewportWidth / viewportHeight
      },

      count: pointsToBeDrawn.length,

      primitive: "points"
    });
  };

  const highlightPoints = (pointsToBeDrawn, newSelection) => {
    const highlightedPoints = [...pointsToBeDrawn];

    for (let i = 0; i < newSelection.length; i++) {
      const pt = highlightedPoints[newSelection[i]];
      const ptColor = [...pt[2].slice(0, 3)];
      const ptSize = pointSize * pointSizeHighlight;
      // Update color and point size to the outer most black outline
      pt[2] = [0, 0, 0, 0.33];
      pt[3] = ptSize + 6;
      // Add second white outline
      highlightedPoints.push([pt[0], pt[1], [1, 1, 1, 1], ptSize + 2]);
      // Finally add the point itself again to be on top
      highlightedPoints.push([pt[0], pt[1], [...ptColor, 1], ptSize]);
    }

    return highlightedPoints;
  };

  const setPoints = newPoints => {
    points = newPoints;
    searchIndex = new KDBush(points);
  };

  const draw = (newPoints, newSelection = selection) => {
    if (newPoints) setPoints(newPoints);

    selection = newSelection;

    if (points.length === 0) return;

    regl.clear({
      // background color (transparent)
      color: [0, 0, 0, 0],
      depth: 1
    });

    // Update camera
    isViewChanged = camera.tick();

    if (isViewChanged) mat4.invert(viewInv, camera.view);

    drawPoints(highlightPoints(points, selection))({
      span: 1 - padding,
      basePointSize: pointSize,
      camera: camera.view
    });

    lasso.draw({ view: camera.view });

    // Publish camera change
    if (isViewChanged) pubSub.publish("camera", camera.position);
  };

  const drawRaf = withRaf(draw);

  const refresh = () => {
    regl.poll();
  };

  const reset = () => {
    camera.lookAt([...DEFAULT_TARGET], DEFAULT_DISTANCE);
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
    get padding() {
      return paddingGetter();
    },
    set padding(arg) {
      return paddingSetter(arg);
    },
    get pointSize() {
      return pointSizeGetter();
    },
    set pointSize(arg) {
      return pointSizeSetter(arg);
    },
    get pointSizeHighlight() {
      return pointSizeHighlightGetter();
    },
    set pointSizeHighlight(arg) {
      return pointSizeselectionetter(arg);
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

export default Scatterplot;
