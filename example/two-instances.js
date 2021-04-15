/* eslint no-console: 0 */

import createScatterplot from '../src';

const canvas1 = document.querySelector('#canvas');

const canvasWrapper1 = canvas1.parentNode;
canvasWrapper1.style.right = '50%';

const parentWrapper = canvasWrapper1.parentNode;

const canvasWrapper2 = canvasWrapper1.cloneNode();
canvasWrapper2.style.left = '50%';
canvasWrapper2.style.right = null;
parentWrapper.appendChild(canvasWrapper2);

const canvas2 = document.createElement('canvas');
canvasWrapper2.appendChild(canvas2);

canvasWrapper1.style.borderRight = '1px solid #333';
canvasWrapper2.style.borderLeft = '1px solid #333';

const numPointsEl = document.querySelector('#num-points');
const numPointsValEl = document.querySelector('#num-points-value');
const pointSizeEl = document.querySelector('#point-size');
const pointSizeValEl = document.querySelector('#point-size-value');
const opacityEl = document.querySelector('#opacity');
const opacityValEl = document.querySelector('#opacity-value');
const clickLassoInitiatorEl = document.querySelector('#click-lasso-initiator');
const resetEl = document.querySelector('#reset');
const exampleEl = document.querySelector('#example-background');

exampleEl.setAttribute('class', 'active');
exampleEl.removeAttribute('href');

[canvas1, canvas2].forEach((canvas) => {
  let points = [];
  let numPoints = 25000;
  let pointSize = 3;
  let opacity = 0.66;
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
    lassoInitiator: true,
  });

  console.log(`Scatterplot v${scatterplot.get('version')}`);

  scatterplot.subscribe('select', selectHandler);
  scatterplot.subscribe('deselect', deselectHandler);

  const generatePoints = (num) =>
    new Array(num).fill().map(() => [
      -1 + Math.random() * 2, // x
      -1 + Math.random() * 2, // y
      Math.round(Math.random()), // category
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
  clickLassoInitiatorEl.checked = true;

  const resetClickHandler = () => {
    scatterplot.reset();
  };

  resetEl.addEventListener('click', resetClickHandler);

  scatterplot.set({ colorBy: 'category', pointColor: ['#3a78aa', '#aa3a99'] });

  setPointSize(pointSize);
  setOpacity(opacity);
  setNumPoint(numPoints);
});
