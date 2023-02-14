/* eslint no-console: 0 */

import { tableFromIPC } from 'apache-arrow';

import createScatterplot from '../src';
import { saveAsPng, checkSupport, showModal, closeModal } from './utils';

const CLASS_COLORS = [
  '#FFFF00', // bright yellow
  '#1CFFD9', // turrtoise
  '#FF34FF', // pink/purple
  '#FF4A46', // pale red
  '#008941', // forrest green
  '#1966FF', // dark blue
  '#C00069', // violette
  '#FFDBE5', // almost white
  '#FF9900', // yellow
  '#8148D5', // grass green
];

/**
 * Load Embedding Example
 */
const whenData = fetch(
  'https://storage.googleapis.com/flekschas/regl-scatterplot/cities.arrow'
);

/**
 * Modal
 */
showModal('Loading...');

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

let pointSize = 1.5;

const scatterplot = createScatterplot({
  canvas,
  pointSize,
  lassoInitiator: true,
});

checkSupport(scatterplot);

exportEl.addEventListener('click', () => saveAsPng(scatterplot));

console.log(`Scatterplot v${scatterplot.get('version')}`);

/**
 * Disable num points and opacity setter because we work with fixed data
 */
numPointsEl.disabled = true;
opacityEl.disabled = true;

const setPointSize = (newPointSize) => {
  pointSize = newPointSize;
  pointSizeEl.value = pointSize;
  pointSizeValEl.innerHTML = pointSize;
  scatterplot.set({ pointSize });
};

const pointSizeInputHandler = (event) => setPointSize(+event.target.value);

pointSizeEl.addEventListener('input', pointSizeInputHandler);

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

setPointSize(1.5);

whenData
  .then((data) => tableFromIPC(data))
  .then((table) => {
    closeModal();
    const columnValues = table.data[0].children.map((data) => data.values);

    const population = columnValues[columnValues.length - 2];
    const continents = columnValues[columnValues.length - 1];

    const staticOpacity = new Float32Array(population.length);
    for (let i = 0; i < population.length; i++) {
      staticOpacity[i] = 1;
    }

    numPointsValEl.innerHTML = table.numRows;
    opacityValEl.innerHTML = 'Automatic';

    scatterplot.draw({
      x: columnValues[0],
      y: columnValues[1],
      z: continents,
      w: population,
    });
    scatterplot.set({
      colorBy: 'z',
      pointColor: CLASS_COLORS,
      opacityBy: 'w',
      opacity: Array.from({ length: 10 }, (_, i) => 0.33 + (i / 9) * 0.33),
    });

    let i = 0;
    const transitionPoints = () => {
      i++;

      const startCol = (i % 3) * 2;

      scatterplot
        .draw(
          {
            x: columnValues[startCol],
            y: columnValues[startCol + 1],
            z: continents,
            w: [population, staticOpacity, staticOpacity][i % 3],
          },
          {
            transition: true,
            transitionDuration: 750,
            transitionEasing: 'quadInOut',
          }
        )
        .then(() => {
          setTimeout(transitionPoints, 2500);
        });
    };

    setTimeout(transitionPoints, 2500);
  });
