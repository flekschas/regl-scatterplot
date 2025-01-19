import createScatterplot from '../src';
import createMenu from './menu';
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
const exampleEl = document.querySelector('#example-basic');

const canvasWrapper = canvas.parentNode;
canvasWrapper.style.padding = '15rem 0';
canvasWrapper.style.height = '100vh';
canvasWrapper.parentNode.style.overflow = 'auto';

exampleEl.setAttribute('class', 'active');
exampleEl.removeAttribute('href');

let points = [];
let numPoints = 100000;
let pointSize = 4;
let opacity = 0.33;
let selection = [];

const reticleColor = [1, 1, 0.878431373, 0.33];

const selectHandler = ({ points: selectedPoints }) => {
  selection = selectedPoints;
  if (selection.length === 1) {
    const point = points[selection[0]];
    console.log(
      `Selected: ${selectedPoints}`,
      `X: ${point[0]}\nY: ${point[1]}\nCategory: ${point[2]}\nValue: ${point[3]}`
    );
  }
};

const deselectHandler = () => {
  selection = [];
};

const scatterplot = createScatterplot({
  canvas,
  pointSize,
  showReticle: true,
  reticleColor,
  lassoInitiator: true,
});

checkSupport(scatterplot);

exportEl.addEventListener('click', () => saveAsPng(scatterplot));

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);

const generatePoints = (num) =>
  new Array(num).fill().map(() => [
    -0.8 + Math.random() * 1.6, // x
    -0.8 + Math.random() * 1.6, // y
    Math.round(Math.random()), // category
    Math.random(), // value
  ]);

const setNumPoints = (newNumPoints) => {
  numPoints = newNumPoints;
  numPointsEl.value = numPoints;
  numPointsValEl.innerHTML = numPoints;
  points = generatePoints(numPoints);
  scatterplot.draw(points);
};

createMenu({ scatterplot, setNumPoints });

const numPointsInputHandler = (event) => {
  numPointsValEl.innerHTML = `${+event.target
    .value} <em>release to redraw</em>`;
};

numPointsEl.addEventListener('input', numPointsInputHandler);

const numPointsChangeHandler = (event) => setNumPoints(+event.target.value);

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

setPointSize(pointSize);
setOpacity(opacity);
setNumPoints(numPoints);
