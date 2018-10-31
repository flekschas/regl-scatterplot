import createScatterplot from "../src";

const canvas = document.querySelector("#canvas");
const numPointsEl = document.querySelector("#num-points");
const numPointsValEl = document.querySelector("#num-points-value");
const pointSizeEl = document.querySelector("#point-size");
const pointSizeValEl = document.querySelector("#point-size-value");
const opacityEl = document.querySelector("#opacity");
const opacityValEl = document.querySelector("#opacity-value");
const resetEl = document.querySelector("#reset");

let { width, height } = canvas.getBoundingClientRect();

const resizeHandler = () => {
  ({ width, height } = canvas.getBoundingClientRect());
  scatterplot.width = width;
  scatterplot.height = height;
  scatterplot.draw();
};

window.addEventListener("resize", resizeHandler);

let selection = [];

const selectHandler = ({ points }) => {
  console.log("Selected:", points); // eslint-disable-line
  selection = points;
};

const deselectHandler = () => {
  console.log("Deselected:", selection); // eslint-disable-line
  selection = [];
};

const scatterplot = createScatterplot({
  canvas,
  width,
  height,
  pointSize: 10
});

scatterplot.subscribe("select", selectHandler);
scatterplot.subscribe("deselect", deselectHandler);

const generatePoints = num =>
  new Array(num)
    .fill()
    .map(() => [-1 + Math.random() * 2, -1 + Math.random() * 2]);

const numPointsInputHandler = event => {
  numPointsValEl.innerHTML = `${+event.target
    .value} <em>release to redraw</em>`;
};

numPointsEl.addEventListener("input", numPointsInputHandler);

const numPointsChangeHandler = event => {
  numPointsValEl.innerHTML = +event.target.value;
  scatterplot.draw(generatePoints(+event.target.value));
};

numPointsEl.addEventListener("change", numPointsChangeHandler);

const pointSizeInputHandler = event => {
  pointSizeValEl.innerHTML = +event.target.value;
  scatterplot.pointSize = +event.target.value;
  scatterplot.draw();
};

pointSizeEl.addEventListener("input", pointSizeInputHandler);

const opacityInputHandler = event => {
  opacityValEl.innerHTML = +event.target.value;
  color[3] = +event.target.value;
  scatterplot.draw();
};

opacityEl.addEventListener("input", opacityInputHandler);

const resetClickHandler = () => {
  scatterplot.reset();
};

resetEl.addEventListener("click", resetClickHandler);

scatterplot.draw(generatePoints(1000));
