import { axisBottom, axisRight } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';

import createScatterplot from '../src';
import createMenu from './menu';
import { checkSupport } from './utils';

const parentWrapper = document.querySelector('#parent-wrapper');
const canvasWrapper = document.querySelector('#canvas-wrapper');
const canvas = document.querySelector('#canvas');

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

let { width, height } = canvasWrapper.getBoundingClientRect();

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
  opacity,
  xScale,
  yScale,
  showReticle: true,
  lassoInitiator: true,
});

checkSupport(scatterplot);

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);
scatterplot.subscribe('view', (event) => {
  xAxisContainer.call(xAxis.scale(event.xScale));
  yAxisContainer.call(yAxis.scale(event.yScale));
});

scatterplot.subscribe(
  'init',
  () => {
    xAxisContainer.call(xAxis.scale(scatterplot.get('xScale')));
    yAxisContainer.call(yAxis.scale(scatterplot.get('yScale')));
  },
  1
);

const resizeHandler = () => {
  ({ width, height } = canvasWrapper.getBoundingClientRect());

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

const setNumPoints = (newNumPoints) => {
  points = generatePoints(newNumPoints);
  scatterplot.draw(points);
};

createMenu({ scatterplot, setNumPoints });

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

setNumPoints(numPoints);
