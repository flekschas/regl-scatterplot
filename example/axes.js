/* eslint no-console: 0 */

import { axisBottom, axisRight } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';

import createScatterplot from '../src';
import { saveAsPng } from './utils';

const parentWrapper = document.querySelector('#parent-wrapper');
const canvasWrapper = document.querySelector('#canvas-wrapper');
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
const exampleBg = document.querySelector('#example-axes');

exampleBg.setAttribute('class', 'active');
exampleBg.removeAttribute('href');

const xDomain = [0, 42];
const yDomain = [0, 4.2];
const xScale = scaleLinear().domain(xDomain);
const yScale = scaleLinear().domain(yDomain);
const xAxis = axisBottom(xScale);
const yAxis = axisRight(yScale);
const axisContainer = select(parentWrapper).append('svg');
const xAxisContainer = axisContainer.append('g');
const yAxisContainer = axisContainer.append('g');
const xAxisPadding = 20;
const yAxisPadding = 40;

axisContainer.node().style.position = 'absolute';
axisContainer.node().style.top = 0;
axisContainer.node().style.left = 0;
axisContainer.node().style.width = '100%';
axisContainer.node().style.height = '100%';
axisContainer.node().style.pointerEvents = 'none';

canvasWrapper.style.right = `${yAxisPadding}px`;
canvasWrapper.style.bottom = `${xAxisPadding}px`;

let { width, height } = canvas.getBoundingClientRect();

xAxisContainer.attr('transform', `translate(0, ${height})`).call(xAxis);
yAxisContainer.attr('transform', `translate(${width}, 0)`).call(yAxis);

// Render grid
xAxis.tickSizeInner(-height);
yAxis.tickSizeInner(-width);

let points = [];
let numPoints = 100000;
let pointSize = 2;
let opacity = 0.5;
let selection = [];

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
  pointSize,
  xScale,
  yScale,
  showReticle: true,
});

exportEl.addEventListener('click', () => saveAsPng(scatterplot));

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);
scatterplot.subscribe('view', (event) => {
  xAxisContainer.call(xAxis.scale(event.xScale));
  yAxisContainer.call(yAxis.scale(event.yScale));
});

xAxisContainer.call(xAxis.scale(scatterplot.get('xScale')));
yAxisContainer.call(yAxis.scale(scatterplot.get('yScale')));

const resizeHandler = () => {
  ({ width, height } = canvas.getBoundingClientRect());

  xAxisContainer.attr('transform', `translate(0, ${height})`).call(xAxis);
  yAxisContainer.attr('transform', `translate(${width}, 0)`).call(yAxis);

  // Render grid
  xAxis.tickSizeInner(-height);
  yAxis.tickSizeInner(-width);
};

window.addEventListener('resize', resizeHandler);
window.addEventListener('orientationchange', resizeHandler);

const generatePoints = (num) =>
  new Array(num).fill().map(() => [
    -1 + Math.random() * 2, // x
    -1 + Math.random() * 2, // y
    Math.round(Math.random() * 9), // category
    Math.random(), // value
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

const resetClickHandler = () => {
  scatterplot.reset();
};

resetEl.addEventListener('click', resetClickHandler);

scatterplot.set({
  colorBy: 'category',
  pointColor: [
    '#d192b7',
    '#6fb2e4',
    '#eecb62',
    '#56bf92',
    '#dca237',
    '#3a84cc',
    '#c76526',
  ],
});

setPointSize(pointSize);
setOpacity(opacity);
setNumPoint(numPoints);
