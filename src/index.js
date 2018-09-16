import canvasCamera2d from 'canvas-camera-2d';
import createMousePos from 'mouse-position';
import createMousePressed from 'mouse-pressed';
import createPubSub from 'pub-sub-es';
import createRegl from 'regl';
import createScroll from 'scroll-speed';
import withRaf from 'with-raf';

import FSHADER_DRAW from './draw.fshader';
import VSHADER_DRAW from './draw.vshader';
import FSHADER_UPDATE from './update.fshader';
import VSHADER_QUAD from './quad.vshader';

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
  let numParticles = 0;
  let particlesRes = 0;
  let prevParticleState;
  let currParticleState;
  let particleIndex;
  let isInit = false;

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
    regl = createRegl({
      canvas: c,
      extensions: ['OES_standard_derivatives', 'OES_texture_float'],
    });
    camera = canvasCamera2d(c, {
      target: DEFAULT_TARGET,
      distance: DEFAULT_DISTANCE,
    });
    scroll = createScroll(c);
    mousePosition = createMousePos(c);
    mousePressed = createMousePressed(c);

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

  const drawPoints = regl({
    frag: FSHADER_DRAW,
    vert: VSHADER_DRAW,

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
      aIndex: { buffer: regl.prop('particleIndex'), size: 1 },
    },

    uniforms: {
      uCamera: regl.prop('camera'),
      uParticlesRes: regl.prop('particlesRes'),
      uParticleState: () => currParticleState,
      uPointSize: regl.prop('pointSize'),
      uSpan: regl.prop('span'),
    },

    count: regl.prop('numParticles'),

    primitive: 'points',
  });

  // regl command that updates particles state based on previous two
  const updatePoints = regl({
    // write to a framebuffer instead of to the screen
    framebuffer: () => prevParticleState,

    vert: VSHADER_QUAD,
    frag: FSHADER_UPDATE,

    attributes: {
      // a square covering the entire webgl space
      aPosition: [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1],
    },

    uniforms: {
      uParticleState: () => currParticleState,
    },

    count: 6,
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

  const createFrameBuffer = (newState, res) => {
    const texture = regl.texture({
      data: newState,
      shape: [res, res, 4],
      type: 'float',
    });

    return regl.framebuffer({
      color: texture,
      depth: false,
      stencil: false,
    });
  };

  const createParticleIndex = (texNumParticles) => {
    const particleIndices = new Float32Array(texNumParticles);
    for (let i = 0; i < texNumParticles; i++) particleIndices[i] = i;
    return regl.buffer({
      data: particleIndices,
      usage: 'static',
      type: 'float',
      length: texNumParticles,
    });
  };

  const initParticleState = (newPoints, texNumParticles) => {
    const particleState = new Float32Array(texNumParticles * 4);
    for (let i = 0; i < newPoints.length; ++i) {
      // store x then y and then leave 2 spots empty
      particleState[i * 4] = newPoints[i][0]; // x
      particleState[i * 4 + 1] = newPoints[i][1]; // y
    }
    return particleState;
  };

  const init = (newPoints) => {
    numParticles = newPoints.length;
    particlesRes = Math.ceil(Math.sqrt(numParticles));
    const texNumParticles = particlesRes ** 2;

    const particleState = initParticleState(newPoints, texNumParticles);
    particleIndex = createParticleIndex(texNumParticles);
    prevParticleState = createFrameBuffer(particleState, particlesRes);
    currParticleState = createFrameBuffer(particleState, particlesRes);

    isInit = true;
  };

  const swapParticleStates = () => {
    const tmp = prevParticleState;
    prevParticleState = currParticleState;
    currParticleState = tmp;
  };

  const draw = (newPoints) => {
    if (newPoints) init(newPoints);
    if (!isInit) return;

    // clear the buffer
    regl.clear({
      // background color (transparent)
      color: [0, 0, 0, 0],
      depth: 1,
    });

    // Update camera
    const isCameraChanged = camera.tick();

    // Draw the points
    drawPoints({
      camera: camera.view(),
      numParticles,
      particleIndex,
      particlesRes,
      pointSize,
      span: 1 - padding,
    });

    // Update position of points in the frame buffers
    updatePoints();

    // Swap frame buffers (i.e., states)
    swapParticleStates();

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
