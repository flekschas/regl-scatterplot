/* eslint no-console: 0 */

import { scaleLog } from 'd3-scale';
import { randomExponential } from 'd3-random';

import createScatterplot from 'regl-scatterplot';
import { saveAsPng } from './utils';

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
const exampleEl = document.querySelector('#example-size-encoding');

exampleEl.setAttribute('class', 'active');
exampleEl.removeAttribute('href');

let points = [];
let numPoints = 100000;
let pointSize = 2;
let opacity = 1.0;
let selection = [];

const lassoMinDelay = 10;
const lassoMinDist = 2;
const showReticle = true;
const reticleColor = [1, 1, 0.878431373, 0.33];

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
  lassoInitiator: true,
});

exportEl.addEventListener('click', () => saveAsPng(scatterplot));

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);

const rndA = randomExponential(2);
const rndB = randomExponential(4);
const rndC = randomExponential(5);

const generatePoints = (num) => {
  const newPoints = [
    ...new Array(Math.round((num * 2) / 12)).fill().map(() => [
      -1 + (Math.random() * 2 * 1) / 3, // x
      -1 + Math.random() * 2, // y
      0, // category
      rndA(), // value
    ]),
    ...new Array(Math.round((num * 4) / 12)).fill().map(() => [
      -1 + 2 / 3 + (Math.random() * 2 * 1) / 3, // x
      -1 + Math.random() * 2, // y
      1, // category
      rndB(), // value
    ]),
    ...new Array(Math.round((num * 6) / 12)).fill().map(() => [
      -1 + 4 / 3 + (Math.random() * 2 * 1) / 3, // x
      -1 + Math.random() * 2, // y
      2, // category
      rndC(), // value
    ]),
  ];

  const [minVal, maxVal] = newPoints.reduce(
    ([min, max], point) => [Math.min(min, point[3]), Math.max(max, point[3])],
    [Infinity, -Infinity]
  );

  const valRange = maxVal - minVal;

  newPoints.forEach((point) => {
    point[3] = (point[3] - minVal) / valRange;
  });

  return newPoints;
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

scatterplot.set({
  colorBy: 'category',
  pointColor: ['#ff80cb', '#57c7ff', '#eee462'],
  sizeBy: 'w',
  opacityBy: 'w',
});

setPointSize(pointSize);
setOpacity(opacity);
setNumPoint(numPoints);
