import canvasCamera2d from 'canvas-camera-2d';
import createMousePos from 'mouse-position';
import createMousePrs from 'mouse-pressed';
import createPubSub from 'pub-sub-es';
import createRegl from 'regl';
import createScroll from 'scroll-speed';
import withRaf from 'with-raf';

import FRAG_SHADER from './fragment.fs';
import VERT_SHADER from './vertex.vs';

const DEFAULT_POINT_SIZE = 3;
const DEFAULT_POINT_SIZE_HIGHLIGHT = 3;
const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 100;
const DEFAULT_PADDING = 0;
const DEFAULT_COLORMAP = [];
const DEFAULT_TARGET = [0, 0];
const DEFAULT_DISTANCE = 1;
const CLICK_DELAY = 250;

const dist = (x1, x2, y1, y2) => Math.sqrt(((x1 - x2) ** 2) + ((y1 - y2) ** 2));

const Scatterplot = ({
  canvas: initCanvas = document.createElement('canvas'),
  colorMap: initColorMap = DEFAULT_COLORMAP,
  pointSize: initPointSize = DEFAULT_POINT_SIZE,
  pointSizeHighlight: initPointSizeHighlight = DEFAULT_POINT_SIZE_HIGHLIGHT,
  width: initWidth = DEFAULT_WIDTH,
  height: initHeight = DEFAULT_HEIGHT,
  padding: initPadding = DEFAULT_PADDING,
} = {}) => {
  const pubSub = createPubSub();
  let canvas = initCanvas;
  let width = initWidth;
  let height = initHeight;
  let padding = initPadding;
  let pointSize = initPointSize;
  let pointSizeHighlight = initPointSizeHighlight;
  let colorMap = initColorMap;
  let camera;
  let regl;
  let scroll;
  let mousePosition;
  let mousePressed;
  let mouseDown;
  let mouseDownTime;
  let mouseDownX;
  let mouseDownY;
  let points = [];
  let numHighlight = [];

  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;

  const raycast = () => {
    // Get the mouse cursor position
    mousePosition.flush();
    const [x, y] = camera.getGlPos(
      mousePosition[0],
      mousePosition[1],
      width,
      height,
    );
    // Find the closest point
    let minDist = Infinity;
    let clostestPoint;
    points.forEach(([ptX, ptY], i) => {
      const d = dist(ptX, x, ptY, y);
      if (d < minDist) {
        minDist = d;
        clostestPoint = i;
      }
    });
    if (minDist < pointSize / width * 2) return clostestPoint;
  };

  const mouseDownHandler = () => {
    mouseDown = true;
    mouseDownTime = performance.now();

    // Get the mouse cursor position
    mousePosition.flush();

    // Get relative webgl coordinates
    const { 0: x, 1: y } = mousePosition;
    mouseDownX = -1 + (x / width * 2);
    mouseDownY = 1 + (y / height * -2);
  };

  const mouseUpHandler = () => {
    mouseDown = false;
    if (performance.now() - mouseDownTime <= CLICK_DELAY) {
      pubSub.publish(
        'click',
        { selectedPoint: raycast(mouseDownX, mouseDownY) },
      );
    }
  };

  const initRegl = (c = canvas) => {
    regl = createRegl({ canvas: c, extensions: ['OES_standard_derivatives'] });
    camera = canvasCamera2d(c, {
      target: DEFAULT_TARGET,
      distance: DEFAULT_DISTANCE,
    });
    scroll = createScroll(c);
    mousePosition = createMousePos(c);
    mousePressed = createMousePrs(c);

    scroll.on('scroll', () => { drawRaf(); });  // eslint-disable-line
    mousePosition.on('move', () => { if (mouseDown) drawRaf(); }); // eslint-disable-line
    mousePressed.on('down', mouseDownHandler);
    mousePressed.on('up', mouseUpHandler);
  };

  const destroy = () => {
    canvas = undefined;
    camera = undefined;
    regl = undefined;
    scroll.dispose();
    mousePosition.dispose();
    mousePressed.dispose();
  };

  const canvasGetter = () => canvas;
  const canvasSetter = (newCanvas) => {
    canvas = newCanvas;
    initRegl(canvas);
  };
  const colorMapGetter = () => colorMap;
  const colorMapSetter = (newColorMap) => {
    colorMap = newColorMap || DEFAULT_COLORMAP;
  };
  const heightGetter = () => height;
  const heightSetter = (newHeight) => {
    height = +newHeight || DEFAULT_HEIGHT;
    canvas.height = height * window.devicePixelRatio;
  };
  const paddingGetter = () => padding;
  const paddingSetter = (newPadding) => {
    padding = +newPadding || DEFAULT_PADDING;
    padding = Math.max(0, Math.min(0.5, padding));
  };
  const pointSizeGetter = () => pointSize;
  const pointSizeSetter = (newPointSize) => {
    pointSize = +newPointSize || DEFAULT_POINT_SIZE;
  };
  const pointSizeHighlightGetter = () => pointSizeHighlight;
  const pointSizeHighlightSetter = (newPointSizeHighlight) => {
    pointSizeHighlight = +newPointSizeHighlight || DEFAULT_POINT_SIZE_HIGHLIGHT;
  };
  const widthGetter = () => width;
  const widthSetter = (newWidth) => {
    width = +newWidth || DEFAULT_WIDTH;
    canvas.width = width * window.devicePixelRatio;
  };

  initRegl(canvas);

  const drawPoints = pointsToBeDrawn => regl({
    frag: FRAG_SHADER,
    vert: VERT_SHADER,

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
      // each of these gets mapped to a single entry for each of the points.
      // this means the vertex shader will receive just the relevant value for
      // a given point.
      position: pointsToBeDrawn.map(d => d.slice(0, 2)),
      color: pointsToBeDrawn.map(d => d[2]),
      extraPointSize: pointsToBeDrawn.map(d => d[3] | 0), // eslint-disable-line no-bitwise
    },

    uniforms: {
      // Total area that is being used. Value must be in [0, 1]
      span: regl.prop('span'),
      basePointSize: regl.prop('basePointSize'),
      camera: regl.prop('camera'),
    },

    count: pointsToBeDrawn.length,

    primitive: 'points',
  });

  const highlightPoints = (pointsToBeDrawn, numHighlights) => {
    const N = pointsToBeDrawn.length;
    const highlightedPoints = [...pointsToBeDrawn];

    for (let i = 0; i < numHighlights; i++) {
      const pt = highlightedPoints[N - numHighlights + i];
      const ptColor = [...pt[2].slice(0, 3)];
      const ptSize = pointSize * pointSizeHighlight;
      // Update color and point size to the outer most black outline
      pt[2] = [0, 0, 0, 0.33];
      pt[3] = ptSize + 6;
      // Add second white outline
      highlightedPoints.push([
        pt[0], pt[1], [1, 1, 1, 1], ptSize + 2,
      ]);
      // Finally add the point itself again to be on top
      highlightedPoints.push([
        pt[0], pt[1], [...ptColor, 1], ptSize,
      ]);
    }

    return highlightedPoints;
  };

  const draw = (newPoints = points, newNumHighlight = numHighlight) => {
    points = newPoints;
    numHighlight = newNumHighlight;

    if (points.length === 0) return;

    // clear the buffer
    regl.clear({
      // background color (transparent)
      color: [0, 0, 0, 0],
      depth: 1,
    });

    // Update camera
    const isCameraChanged = camera.tick();

    // arguments are available via `regl.prop`.
    drawPoints(highlightPoints(points, numHighlight))({
      span: 1 - padding,
      basePointSize: pointSize,
      camera: camera.view(),
    });

    // Publish camera change
    if (isCameraChanged) pubSub.publish('camera', camera.position);
  };

  const drawRaf = withRaf(draw);

  const refresh = () => { regl.poll(); };

  const reset = () => {
    camera.lookAt([...DEFAULT_TARGET], DEFAULT_DISTANCE);
    drawRaf();
    pubSub.publish('camera', camera.position);
  };

  return {
    get canvas() { return canvasGetter(); },
    set canvas(arg) { return canvasSetter(arg); },
    get colorMap() { return colorMapGetter(); },
    set colorMap(arg) { return colorMapSetter(arg); },
    get height() { return heightGetter(); },
    set height(arg) { return heightSetter(arg); },
    get padding() { return paddingGetter(); },
    set padding(arg) { return paddingSetter(arg); },
    get pointSize() { return pointSizeGetter(); },
    set pointSize(arg) { return pointSizeSetter(arg); },
    get pointSizeHighlight() { return pointSizeHighlightGetter(); },
    set pointSizeHighlight(arg) { return pointSizeHighlightSetter(arg); },
    get width() { return widthGetter(); },
    set width(arg) { return widthSetter(arg); },
    draw: drawRaf,
    refresh,
    destroy,
    reset,
    subscribe: pubSub.subscribe,
    unsubscribe: pubSub.unsubscribe,
  };
};

export default Scatterplot;
