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

const gaussianRandom = (mean = 0, stdev = 1) => {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
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
  selection = [];
};

const scatterplot = createScatterplot({
  canvas,
  lassoMinDelay,
  lassoMinDist,
  pointSize,
  opacity,
  showReticle,
  reticleColor,
  lassoOnLongPress: true,
});

checkSupport(scatterplot);

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);

const generatePoints = (l) => {
  const s = (Math.log10(l) / Math.log10(100000)) ** 2;
  const clusters = [
    {
      length: l * (7 / 16),
      cx: -0.48,
      cy: 0.46,
      stdx: 0.05 * s,
      stdy: 0.1 * s,
    },
    {
      length: l * (5 / 16),
      cx: 0.49,
      cy: 0.5,
      stdx: 0.07 * s,
      stdy: 0.066 * s,
    },
    {
      length: l * (3 / 16),
      cx: 0.48,
      cy: -0.51,
      stdx: 0.12 * s,
      stdy: 0.05 * s,
    },
    {
      length: l * (1 / 16),
      cx: -0.49,
      cy: -0.51,
      stdx: 0.033 * s,
      stdy: 0.033 * s,
    },
  ];

  let x = [];
  let y = [];
  let z = [];
  let w = [];

  clusters.forEach(({ length, cx, cy, stdx, stdy }, i) => {
    x = x.concat(Array.from({ length }, () => gaussianRandom(cx, stdx)));
    y = y.concat(Array.from({ length }, () => gaussianRandom(cy, stdy)));
    z = z.concat(Array.from({ length }, () => i));
    w = w.concat(Array.from({ length }, () => Math.random()));
  });

  return { x, y, z, w };
};

const setNumPoints = (newNumPoints) => {
  points = generatePoints(newNumPoints);
  scatterplot.draw(points);
};

createMenu({ scatterplot, setNumPoints });

const colorsCat = ['#3a78aa', '#aa3a99'];
scatterplot.set({ colorBy: 'category', pointColor: colorsCat });

const colorsScale = ['#009E73', '#CC79A7', '#56B4E9', '#F0E442'];
scatterplot.set({ colorBy: 'z', pointColor: colorsScale });

setNumPoints(numPoints);

scatterplot.drawAnnotations([
  { x: 0, lineColor: [1, 1, 1, 0.1], lineWidth: 1 },
  { y: 0, lineColor: [1, 1, 1, 0.1], lineWidth: 1 },
  { y: 0.5, x1: -0.9, x2: 0.9, lineColor: [1, 1, 1, 1], lineWidth: 1 },
  {
    x1: -1,
    y1: -1,
    x2: 1,
    y2: 1,
    lineColor: [1, 1, 1, 0.25],
    lineWidth: 1,
  },
  {
    x1: -0.5,
    y1: -0.5,
    x2: 0.5,
    y2: 0.5,
    lineColor: [1, 1, 1, 0.25],
    lineWidth: 1,
  },
  {
    x1: -0.25,
    y1: -0.25,
    x2: 0.25,
    y2: 0.25,
    lineColor: [1, 1, 1, 0.25],
    lineWidth: 1,
  },
  {
    vertices: [
      [-0.66, -0.5],
      [-0.5, -0.33],
      [-0.33, -0.45],
      [-0.33, -0.6],
      [-0.5, -0.7],
      [-0.66, -0.5],
    ],
    lineColor: '#D55E00',
    lineWidth: 1,
  },
]);
