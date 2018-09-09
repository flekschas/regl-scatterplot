import createScatterplot from '../src';

const canvas = document.querySelector('#canvas');
const numPointsEl = document.querySelector('#num-points');
const numPointsValEl = document.querySelector('#num-points-value');
const pointSizeEl = document.querySelector('#point-size');
const pointSizeValEl = document.querySelector('#point-size-value');
const opacityEl = document.querySelector('#opacity');
const opacityValEl = document.querySelector('#opacity-value');

const color = [1.0, 1.0, 1.0, 0.5];

let { width, height } = canvas.getBoundingClientRect();
let points;

const scatterplot = createScatterplot({
  canvas, width, height, pointSize: 5,
});

const resizeHandler = () => {
  ({ width, height } = canvas.getBoundingClientRect());
  scatterplot.width = width;
  scatterplot.height = height;
  scatterplot.draw();
};

window.addEventListener('resize', resizeHandler);

const generatePoints = num => new Array(num)
  .fill()
  .map(() => [-1 + Math.random() * 2, -1 + Math.random() * 2, color]);

const numPointsInputHandler = (event) => {
  numPointsValEl.innerHTML = `${+event.target.value} <em>release to redraw</em>`;
};

numPointsEl.addEventListener('input', numPointsInputHandler);

const numPointsChangeHandler = (event) => {
  numPointsValEl.innerHTML = +event.target.value;
  points = generatePoints(+event.target.value);
  scatterplot.draw(points);
};

numPointsEl.addEventListener('change', numPointsChangeHandler);

const pointSizeInputHandler = (event) => {
  pointSizeValEl.innerHTML = +event.target.value;
  scatterplot.pointSize = +event.target.value;
  scatterplot.draw();
};

pointSizeEl.addEventListener('input', pointSizeInputHandler);

const opacityInputHandler = (event) => {
  opacityValEl.innerHTML = +event.target.value;
  color[3] = +event.target.value;
  scatterplot.draw();
};

opacityEl.addEventListener('input', opacityInputHandler);

points = generatePoints(1000);
scatterplot.draw(points);
