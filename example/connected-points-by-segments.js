/* eslint no-console: 0 */

import createScatterplot from '../src';
import { saveAsPng, checkSupport } from './utils';

const canvas = document.querySelector('#canvas');
const numPointsEl = document.querySelector('#num-points');
const numPointsValEl = document.querySelector('#num-points-value');
const pointSizeEl = document.querySelector('#point-size');
const pointSizeValEl = document.querySelector('#point-size-value');
const opacityEl = document.querySelector('#opacity');
const opacityValEl = document.querySelector('#opacity-value');
const clickLassoInitiatorEl = document.querySelector('#click-lasso-initiator');
const resetEl = document.querySelector('#reset');
const exportEl = document.querySelector('#export');
const exampleEl = document.querySelector(
  '#example-connected-points-by-segment'
);

exampleEl.setAttribute('class', 'active');
exampleEl.removeAttribute('href');

let points = [];
let numPoints = 9000;
let pointSize = 1;
let opacity = 0.33;
let selection = [];

const pointSizeMax = 10;
const lassoMinDelay = 10;
const lassoMinDist = 2;
const showReticle = true;
const reticleColor = [1, 1, 0.878431373, 0.33];
const showPointConnections = true;
const pointConnectionColor = [1, 1, 1, 0.15];
const pointConnectionSize = 2;

const selectHandler = ({ points: selectedPoints }) => {
  console.log('Selected:', selectedPoints);
  selection = selectedPoints;
  if (selection.length === 1) {
    const point = points[selection[0]];
    console.log(
      `X: ${point[0]}\nY: ${point[1]}\nCategory: ${point[2]}\nValue: ${point[3]}`
    );
  }
};

const deselectHandler = () => {
  console.log('Deselected:', selection);
  selection = [];
};

const scatterplot = createScatterplot({
  canvas,
  lassoMinDelay,
  lassoMinDist,
  pointSize,
  showReticle,
  reticleColor,
  showPointConnections,
  pointConnectionColor,
  pointConnectionSize,
  lassoInitiator: true,
});

checkSupport(scatterplot);

exportEl.addEventListener('click', () => saveAsPng(scatterplot));

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);

const generatePoints = (num) => {
  const numPointsPerGroup = Math.round(num / 3); // 9.000 / 3 => 3000
  const numPointsPerStep = Math.round(numPointsPerGroup / 5); // 3000 / 5 => 600
  // 600 * 3 => 1800 (lines)

  const outPoints = [];

  for (let g = 0; g < 3; g++) {
    for (let i = 0; i < numPointsPerStep; i++) {
      for (let s = 0; s < 5; s++) {
        outPoints.push([
          -0.6 + g * 0.6 + (Math.random() * 0.3 - 0.15), // x
          -0.9 + s * 0.45, // y
          g, // category
          Math.random(), // value
          g * numPointsPerStep + i, // to identify connected points
        ]);
      }
    }
  }

  return outPoints;
};

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

const getPointSizeRange = (basePointSize) =>
  Array(100)
    .fill()
    .map((x, i) => 1 + (i / 99) * (basePointSize * pointSizeMax - 1));

const setPointSize = (newPointSize) => {
  pointSize = newPointSize;
  pointSizeEl.value = pointSize;
  pointSizeValEl.innerHTML = pointSize;
  scatterplot.set({ pointSize: getPointSizeRange(pointSize) });
};

const pointSizeInputHandler = (event) => setPointSize(+event.target.value);

pointSizeEl.addEventListener('input', pointSizeInputHandler);

const setOpacity = (newOpacity) => {
  opacity = newOpacity;
  opacityEl.value = opacity;
  opacityValEl.innerHTML = opacity;
  scatterplot.set({ opacity });
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

scatterplot.set({
  colorBy: 'valueZ',
  sizeBy: 'valueW',
  pointColor: [
    [255, 128, 203, 128],
    [87, 199, 255, 128],
    [238, 228, 98, 128],
  ],
  pointConnectionColorBy: 'segment',
  pointConnectionColor: Array(200)
    .fill()
    .map((v, i) => [i + 55, i + 55, i + 55, 10]),
  pointConnectionSizeBy: 'segment',
  pointConnectionSize: Array(20)
    .fill()
    .map((v, i) => 1 + i / 4),
  pointConnectionOpacityBy: 'segment',
  pointConnectionOpacity: Array(64)
    .fill()
    .map((v, i) => (i + 8) / 256),
});

setPointSize(pointSize);
setOpacity(opacity);
setNumPoint(numPoints);
