/* eslint no-console: 0 */

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

let points = [];
let selection = [];

const selectHandler = ({ points: selectedPoints }) => {
  console.log("Selected:", selectedPoints);
  selection = selectedPoints;
  if (selection.length === 1) {
    const point = points[selection[0]];
    console.log(`Category: ${point[2]}\nValue: ${point[3]}`);
  }
};

const deselectHandler = () => {
  console.log("Deselected:", selection);
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
  new Array(num).fill().map(() => [
    -1 + Math.random() * 2, // x
    -1 + Math.random() * 2, // y
    Math.round(Math.random()), // category
    Math.random() // value
  ]);

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
};

pointSizeEl.addEventListener("input", pointSizeInputHandler);

const opacityInputHandler = event => {
  opacityValEl.innerHTML = +event.target.value;
  scatterplot.style({ opacity: +event.target.value });
};

opacityEl.addEventListener("input", opacityInputHandler);

const resetClickHandler = () => {
  scatterplot.reset();
};

resetEl.addEventListener("click", resetClickHandler);

scatterplot.colors = [
  ["#3a78aa", "#008dff", "#008dff"],
  ["#aa3a99", "#ff00da", "#ff00da"]
];
scatterplot.colorBy("category");

scatterplot.colors = [
  "#8b0000",
  "#8e0006",
  "#91000a",
  "#94010e",
  "#970212",
  "#990215",
  "#9d0419",
  "#a0051c",
  "#a2071f",
  "#a40921",
  "#a70b24",
  "#aa0e27",
  "#ac1029",
  "#b0122c",
  "#b2152e",
  "#b41731",
  "#b71933",
  "#ba1c35",
  "#bb1e37",
  "#be213a",
  "#c0233c",
  "#c2263d",
  "#c52940",
  "#c72b42",
  "#ca2e43",
  "#cc3045",
  "#cd3346",
  "#cf3548",
  "#d2384a",
  "#d43b4b",
  "#d53d4d",
  "#d8404e",
  "#d9434f",
  "#db4551",
  "#dd4852",
  "#df4a53",
  "#e14d54",
  "#e35056",
  "#e45356",
  "#e55658",
  "#e75859",
  "#e85b59",
  "#ea5e5b",
  "#ec615b",
  "#ed645c",
  "#ee665d",
  "#f0695e",
  "#f16c5f",
  "#f37060",
  "#f37261",
  "#f57562",
  "#f67862",
  "#f77a63",
  "#f87d64",
  "#f98065",
  "#fa8266",
  "#fb8567",
  "#fc8868",
  "#fd8b69",
  "#fe8f6a",
  "#fe916b",
  "#ff956c",
  "#ff986e",
  "#ff9b6f",
  "#ff9e70",
  "#ffa172",
  "#ffa474",
  "#ffa775",
  "#ffaa77",
  "#ffad79",
  "#ffb17b",
  "#ffb47d",
  "#ffb67f",
  "#ffb981",
  "#ffbd83",
  "#ffbf86",
  "#ffc288",
  "#ffc58a",
  "#ffc88d",
  "#ffca90",
  "#ffcd93",
  "#ffd196",
  "#ffd399",
  "#ffd69c",
  "#ffd9a0",
  "#ffdba4",
  "#ffdda7",
  "#ffe0ab",
  "#ffe3af",
  "#ffe5b2",
  "#ffe9b7",
  "#ffebba",
  "#ffedbf",
  "#fff0c4",
  "#fff2c8",
  "#fff5cd",
  "#fff7d1",
  "#fffad7",
  "#fffddb",
  "#ffffe0"
];
scatterplot.colorBy("value");
points = generatePoints(1000);
scatterplot.draw(points);
