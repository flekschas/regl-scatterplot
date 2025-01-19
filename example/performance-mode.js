import { createWorker } from '@flekschas/utils';
import { saveAsPng, checkSupport } from './utils';

import createScatterplot from '../src';
import createMenu from './menu';
import pointWorkerFn from './performance-mode-point-worker';

const modal = document.querySelector('#modal');
const modalText = document.querySelector('#modal span');
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
const exampleEl = document.querySelector('#example-performance-mode');

exampleEl.setAttribute('class', 'active');
exampleEl.removeAttribute('href');

let points = [];
let numPoints = 20000000;
let pointSize = 0.25;
let opacity = 0.33;
let selection = [];

const lassoMinDelay = 10;
const lassoMinDist = 2;

const pointWorker = createWorker(pointWorkerFn);

const generatePoints = (num) =>
  new Promise((resolve, reject) => {
    pointWorker.onmessage = (e) => {
      if (e.data.error) reject(e.data.error);
      else resolve(e.data.points);
    };
    pointWorker.postMessage(num);
  });

const showModal = (text) => {
  modal.style.display = 'flex';
  modalText.textContent = text;
};

const closeModal = () => {
  modal.style.display = 'none';
  modalText.textContent = '';
};

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
  showReticle: true,
  performanceMode: true,
  lassoInitiator: true,
});

checkSupport(scatterplot);

exportEl.addEventListener('click', () => saveAsPng(scatterplot));

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);

const setNumPoints = (newNumPoints) => {
  showModal(
    `Hang tight. Generating ${(numPoints / 1000000).toFixed(
      1
    )} million points...`
  );
  numPoints = newNumPoints;
  numPointsEl.value = numPoints;
  numPointsValEl.innerHTML = numPoints;

  generatePoints(numPoints).then((newPoints) => {
    points = newPoints;
    scatterplot.draw(points);
    closeModal();
  });
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

const colorsScale = [
  '#002072', // dark blue
  '#162b79',
  '#233680',
  '#2e4186',
  '#394d8d',
  '#425894',
  '#4b649a',
  '#5570a1',
  '#5e7ca7',
  '#6789ae',
  '#7195b4',
  '#7ba2ba',
  '#85aec0',
  '#90bbc6',
  '#9cc7cc',
  '#a9d4d2',
  '#b8e0d7',
  '#c8ecdc',
  '#ddf7df',
  '#ffffe0', // bright yellow
];
scatterplot.set({ colorBy: 'value', pointColor: colorsScale });

setPointSize(pointSize);
setOpacity(opacity);
setNumPoints(numPoints);
