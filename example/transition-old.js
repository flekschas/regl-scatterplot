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
const exampleEl = document.querySelector('#example-transition');

exampleEl.setAttribute('class', 'active');
exampleEl.removeAttribute('href');

let points = [];
let pointStates = [];
let numPoints = 100000;
let pointSize = 2;
let opacity = 0.33;
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

checkSupport(scatterplot);

exportEl.addEventListener('click', () => saveAsPng(scatterplot));

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);

const generatePoints = (num) => [
  ...new Array(Math.round(num / 2)).fill().map(() => [
    -1 + Math.random(), // x
    -1 + (Math.random() * 2) / 3, // y
    0, // category
    Math.random() * 0.33, // value
  ]),
  ...new Array(Math.round(num / 2)).fill().map(() => [
    Math.random(), // x
    -1 + Math.random() * 2, // y
    1, // category
    0.66 + Math.random() * 0.33, // value
  ]),
];

const setNumPoint = (newNumPoints) => {
  numPoints = newNumPoints;
  numPointsEl.value = numPoints;
  numPointsValEl.innerHTML = numPoints;
  points = generatePoints(numPoints);
  pointStates = [
    points,
    points.map(([x, y, c, v], j) =>
      j < points.length / 2
        ? [x, (y + 1) * 3 - 1, c, v + 0.66]
        : [x, (y + 1) / 3 - 1, c, v - 0.66]
    ),
  ];
  scatterplot.draw(points);
};

const numPointsInputHandler = (event) => {
  numPointsValEl.innerHTML = `${+event.target
    .value} <em>release to redraw</em>`;
};

numPointsEl.addEventListener('input', numPointsInputHandler);

const numPointsChangeHandler = (event) => setNumPoint(+event.target.value);

numPointsEl.addEventListener('change', numPointsChangeHandler);

const setPointSize = (newPointSize) => {
  pointSize = newPointSize;
  pointSizeEl.value = pointSize;
  pointSizeValEl.innerHTML = pointSize;
  scatterplot.set({ pointSize });
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

const colorsCat = ['#3a78aa', '#aa3a99'];
scatterplot.set({ colorBy: 'category', pointColor: colorsCat });

const colorsScale = [
  '#ff80cb', // bright pink
  '#df80b8',
  '#bf80a5',
  '#9f8092',
  '#808080',
  '#75919f',
  '#6ba3bf',
  '#61b5df',
  '#57c7ff', // bright blue
];
scatterplot.set({ colorBy: 'value', pointColor: colorsScale });

setPointSize(pointSize);
setOpacity(opacity);
setNumPoint(numPoints);

let i = 0;
const transitionPoints = () => {
  i++;
  scatterplot
    .draw(pointStates[i % pointStates.length], {
      transition: true,
      transitionDuration: 1000 - ((i - 1) % 5) * 150,
      transitionEasing: 'quadInOut',
    })
    .then(() => {
      setTimeout(transitionPoints, +!(i % 5) * 3000);
    });
};

transitionPoints();
