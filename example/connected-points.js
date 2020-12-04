/* eslint no-console: 0 */

import createScatterplot from '../src';

const canvas = document.querySelector('#canvas');
const numPointsEl = document.querySelector('#num-points');
const numPointsValEl = document.querySelector('#num-points-value');
const pointSizeEl = document.querySelector('#point-size');
const pointSizeValEl = document.querySelector('#point-size-value');
const opacityEl = document.querySelector('#opacity');
const opacityValEl = document.querySelector('#opacity-value');
const resetEl = document.querySelector('#reset');
const exampleEl = document.querySelector('#example-connected-points');

exampleEl.setAttribute('class', 'active');
exampleEl.removeAttribute('href');

let { width, height } = canvas.getBoundingClientRect();

let points = [];
let numPoints = 9000;
let pointSize = 1;
let opacity = 1;
let selection = [];

const pointSizeMax = 10;
const lassoMinDelay = 10;
const lassoMinDist = 2;
const showRecticle = true;
const recticleColor = [1, 1, 0.878431373, 0.33];
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
  width,
  height,
  lassoMinDelay,
  lassoMinDist,
  pointSize,
  showRecticle,
  recticleColor,
  showPointConnections,
  pointConnectionColor,
  pointConnectionSize,
});

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);

const resizeHandler = () => {
  ({ width, height } = canvas.getBoundingClientRect());
  scatterplot.set({ width, height });
};

window.addEventListener('resize', resizeHandler);

const generatePoints = (num) => {
  const numPointsPerGroup = Math.round(num / 3); // 12.000 / 3 => 4000
  const numPointsPerStep = Math.round(numPointsPerGroup / 5); // 4000 / 5 => 800
  // 800 * 3 => 2400

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
  scatterplot.draw(points, { connectPoints: true });
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

const resetClickHandler = () => {
  scatterplot.reset();
};

resetEl.addEventListener('click', resetClickHandler);

scatterplot.set({
  colorBy: 'category',
  pointColor: [
    [255, 128, 203, 128],
    [87, 199, 255, 128],
    [238, 228, 98, 128],
  ],
  pointConnectionColorBy: 'category',
  pointConnectionColor: [
    [255, 128, 203, 6],
    [87, 199, 255, 6],
    [238, 228, 98, 6],
  ],
  pointConnectionColorActive: [
    [255, 128, 203, 128],
    [87, 199, 255, 128],
    [238, 228, 98, 128],
  ],
  pointConnectionColorHover: [
    [255, 128, 203, 99],
    [87, 199, 255, 99],
    [238, 228, 98, 99],
  ],
  sizeBy: 'value',
});

setPointSize(pointSize);
setOpacity(opacity);
setNumPoint(numPoints);
