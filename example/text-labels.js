/* eslint no-console: 0 */

import { scaleLinear, scaleLog } from 'd3-scale';

import createScatterplot from '../src';
import { saveAsPng, checkSupport } from './utils';

const canvas = document.querySelector('#canvas');
const canvasWrapper = document.querySelector('#canvas-wrapper');
const numPointsEl = document.querySelector('#num-points');
const numPointsValEl = document.querySelector('#num-points-value');
const pointSizeEl = document.querySelector('#point-size');
const pointSizeValEl = document.querySelector('#point-size-value');
const opacityEl = document.querySelector('#opacity');
const opacityValEl = document.querySelector('#opacity-value');
const clickLassoInitiatorEl = document.querySelector('#click-lasso-initiator');
const resetEl = document.querySelector('#reset');
const exportEl = document.querySelector('#export');
const exampleEl = document.querySelector('#example-text-overlay');

exampleEl.setAttribute('class', 'active');
exampleEl.removeAttribute('href');

const noteEl = document.createElement('div');
noteEl.id = 'note';
noteEl.textContent = 'Zoom in to see labels!';
canvasWrapper.appendChild(noteEl);

const textOverlayEl = document.createElement('canvas');
textOverlayEl.id = '#text-overlay';
textOverlayEl.style.position = 'absolute';
textOverlayEl.style.top = 0;
textOverlayEl.style.right = 0;
textOverlayEl.style.bottom = 0;
textOverlayEl.style.left = 0;
textOverlayEl.style.pointerEvents = 'none';

canvasWrapper.appendChild(textOverlayEl);

const resizeTextOverlay = () => {
  const { width, height } = canvasWrapper.getBoundingClientRect();
  textOverlayEl.width = width * window.devicePixelRatio;
  textOverlayEl.height = height * window.devicePixelRatio;
  textOverlayEl.style.width = `${width}px`;
  textOverlayEl.style.height = `${height}px`;
};
resizeTextOverlay();

window.addEventListener('resize', resizeTextOverlay);

const overlayFontSize = 12;
const textOverlayCtx = textOverlayEl.getContext('2d');
textOverlayCtx.font = `${
  overlayFontSize * window.devicePixelRatio
}px sans-serif`;
textOverlayCtx.textAlign = 'center';

let points = [];
let numPoints = 10000;
let pointSize = 4;
let opacity = 1.0;
let selection = [];

const maxPointLabels = 200;
const lassoMinDelay = 10;
const lassoMinDist = 2;
const showReticle = true;
const reticleColor = [1, 1, 0.878431373, 0.33];

const scatterplot = createScatterplot({
  canvas,
  lassoMinDelay,
  lassoMinDist,
  pointSize,
  showReticle,
  reticleColor,
  xScale: scaleLinear().domain([-1, 1]),
  yScale: scaleLinear().domain([-1, 1]),
  pointColor: '#fff',
  opacityBy: 'density',
  lassoInitiator: true,
});

checkSupport(scatterplot);

exportEl.addEventListener('click', () => saveAsPng(scatterplot));

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', ({ points: selectedPoints }) => {
  console.log('Selected:', selectedPoints);
  selection = selectedPoints;
  if (selection.length === 1) {
    const point = points[selection[0]];
    console.log(
      `X: ${point[0]}\nY: ${point[1]}\nCategory: ${point[2]}\nValue: ${point[3]}`
    );
  }
});

scatterplot.subscribe('deselect', () => {
  selection = [];
});

const showPointLabels = (pointsInView, xScale, yScale) => {
  textOverlayCtx.clearRect(0, 0, textOverlayEl.width, textOverlayEl.height);
  textOverlayCtx.fillStyle = 'rgb(255, 255, 255)';

  const dpr = window.devicePixelRatio;

  for (let i = 0; i < pointsInView.length; i++) {
    const [x, y] = points[pointsInView[i]];
    textOverlayCtx.fillText(
      pointsInView[i],
      xScale(x) * dpr,
      yScale(y) * dpr - overlayFontSize * 1.2 * dpr
    );
  }
};

const hidePointLabels = () => {
  textOverlayCtx.clearRect(0, 0, canvas.width, canvas.height);
};

scatterplot.subscribe('drawing', ({ xScale, yScale }) => {
  const pointsInView = scatterplot.get('pointsInView');
  if (pointsInView.length <= maxPointLabels) {
    showPointLabels(pointsInView, xScale, yScale);
  } else {
    hidePointLabels();
  }
});

const generatePoints = (num) =>
  Array.from({ length: num }, () => [
    -1 + Math.random() * 2,
    -1 + Math.random() * 2,
  ]);

const setNumPoint = (newNumPoints) => {
  numPoints = newNumPoints;
  numPointsEl.value = numPoints;
  numPointsValEl.innerHTML = numPoints;
  points = generatePoints(numPoints);
  scatterplot.draw(points);
};

const numPointsInputHandler = (event) => {
  numPointsValEl.innerHTML = `${+event.target
    .value} <em>release to redraw</em>`;
};

numPointsEl.addEventListener('input', numPointsInputHandler);

const numPointsChangeHandler = (event) => setNumPoint(+event.target.value);

numPointsEl.addEventListener('change', numPointsChangeHandler);

const getPointSizeRange = (basePointSize) => {
  const pointSizeScale = scaleLog()
    .domain([1, 10])
    .range([basePointSize, basePointSize * 10]);

  return Array(100)
    .fill()
    .map((x, i) => pointSizeScale(1 + (i / 99) * 9));
};

const setPointSize = (newPointSize) => {
  pointSize = newPointSize;
  pointSizeEl.value = pointSize;
  pointSizeValEl.innerHTML = pointSize;
  scatterplot.set({ pointSize: getPointSizeRange(pointSize) });
};

const pointSizeInputHandler = (event) => setPointSize(+event.target.value);

pointSizeEl.addEventListener('input', pointSizeInputHandler);

const getOpacityRange = (baseOpacity) =>
  Array(10)
    .fill()
    .map((x, i) => ((i + 1) / 10) * baseOpacity);

const setOpacity = (newOpacity) => {
  opacity = newOpacity;
  opacityEl.value = opacity;
  opacityValEl.innerHTML = opacity;
  scatterplot.set({ opacity: getOpacityRange(opacity) });
};

const opacityInputHandler = (event) => setOpacity(+event.target.value);

opacityEl.addEventListener('input', opacityInputHandler);

const clickLassoInitiatorChangeHandler = (event) => {
  scatterplot.set({
    lassoInitiator: event.target.checked,
  });
};

clickLassoInitiatorEl.addEventListener(
  'change',
  clickLassoInitiatorChangeHandler
);
clickLassoInitiatorEl.checked = scatterplot.get('lassoInitiator');

const resetClickHandler = () => {
  scatterplot.reset();
};

resetEl.addEventListener('click', resetClickHandler);

setPointSize(pointSize);
setOpacity(opacity);
setNumPoint(numPoints);
