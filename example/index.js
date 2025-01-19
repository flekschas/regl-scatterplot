import createScatterplot from '../src';
import createMenu from './menu';
import { checkSupport } from './utils';

const canvas = document.querySelector('#canvas');

let points = { x: [], y: [], z: [], w: [] };
let numPoints = 100000;
let pointSize = 2;
let opacity = 0.33;
let selection = [];

const lassoMinDelay = 10;
const lassoMinDist = 2;
const showReticle = true;
const reticleColor = [1, 1, 0.878431373, 0.33];

const pointoverHandler = (pointId) => {
  const x = points.x[pointId];
  const y = points.y[pointId];
  const category = points.z[pointId];
  const value = points.w[pointId];
  console.log(
    `Out point: ${pointId}`,
    `X: ${x}\nY: ${y}\nCategory: ${category}\nValue: ${value}`
  );
};

const pointoutHandler = (pointId) => {
  const x = points.x[pointId];
  const y = points.y[pointId];
  const category = points.z[pointId];
  const value = points.w[pointId];
  console.log(
    `Out point: ${pointId}`,
    `X: ${x}\nY: ${y}\nCategory: ${category}\nValue: ${value}`
  );
};

const selectHandler = ({ points: selectedPoints }) => {
  selection = selectedPoints;
  if (selection.length === 1) {
    const x = points.x[selection[0]];
    const y = points.y[selection[0]];
    const category = points.z[selection[0]];
    const value = points.w[selection[0]];
    console.log(
      `Selected: ${selectedPoints}`,
      `X: ${x}\nY: ${y}\nCategory: ${category}\nValue: ${value}`
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
  showReticle,
  reticleColor,
  opacity,
  lassoOnLongPress: true,
  lassoType: 'brush'
});

checkSupport(scatterplot);

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('pointover', pointoverHandler);
scatterplot.subscribe('pointout', pointoutHandler);
scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);

const generatePoints = (length) => ({
  x: Array.from({ length }, () => -1 + Math.random() * 2),
  y: Array.from({ length }, () => -1 + Math.random() * 2),
  z: Array.from({ length }, () => Math.round(Math.random())), // category
  w: Array.from({ length }, () => Math.random()), // value
});

const setNumPoints = (newNumPoints) => {
  points = generatePoints(numPoints);
  scatterplot.draw(points);
};

createMenu({ scatterplot, setNumPoints });

const colorsCat = ['#3a78aa', '#aa3a99'];
scatterplot.set({ colorBy: 'category', pointColor: colorsCat });

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

setNumPoints(numPoints);
