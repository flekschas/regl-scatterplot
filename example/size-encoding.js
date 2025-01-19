import { scaleLog } from 'd3-scale';
import { randomExponential } from 'd3-random';

import createScatterplot from '../src';
import createMenu from './menu';
import { checkSupport } from './utils';

const canvas = document.querySelector('#canvas');

let points = [];
let numPoints = 100000;
let pointSize = 2;
let opacity = 1.0;
let selection = [];

const lassoMinDelay = 10;
const lassoMinDist = 2;
const showReticle = true;
const reticleColor = [1, 1, 0.878431373, 0.33];

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
  opacity,
  showReticle,
  reticleColor,
  lassoInitiator: true,
  opacityInactiveScale: 0.66,
});

checkSupport(scatterplot);

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);

const rndA = randomExponential(2);
const rndB = randomExponential(4);
const rndC = randomExponential(5);

const generatePoints = (num) => {
  const newPoints = [
    ...new Array(Math.round((num * 2) / 12)).fill().map(() => [
      -1 + (Math.random() * 2 * 1) / 3, // x
      -1 + Math.random() * 2, // y
      0, // category
      rndA(), // value
    ]),
    ...new Array(Math.round((num * 4) / 12)).fill().map(() => [
      -1 + 2 / 3 + (Math.random() * 2 * 1) / 3, // x
      -1 + Math.random() * 2, // y
      1, // category
      rndB(), // value
    ]),
    ...new Array(Math.round((num * 6) / 12)).fill().map(() => [
      -1 + 4 / 3 + (Math.random() * 2 * 1) / 3, // x
      -1 + Math.random() * 2, // y
      2, // category
      rndC(), // value
    ]),
  ];

  const [minVal, maxVal] = newPoints.reduce(
    ([min, max], point) => [Math.min(min, point[3]), Math.max(max, point[3])],
    [Infinity, -Infinity]
  );

  const valRange = maxVal - minVal;

  newPoints.forEach((point) => {
    point[3] = (point[3] - minVal) / valRange;
  });

  return newPoints;
};

const setNumPoints = (newNumPoints) => {
  points = generatePoints(newNumPoints);
  scatterplot.draw(points);
};

const getPointSizeRange = (basePointSize) => {
  const pointSizeScale = scaleLog()
    .domain([1, 10])
    .range([basePointSize, basePointSize * 10]);

  return Array.from(
    { length: 100 }, (_, i) => pointSizeScale(1 + (i / 99) * 9)
  );
};

const setPointSize = (newPointSize) => {
  scatterplot.set({ pointSize: getPointSizeRange(newPointSize) });
};

const getOpacityRange = (baseOpacity) =>
  Array.from({ length: 10 }, (_, i) => ((i + 1) / 10) * baseOpacity);

const setOpacity = (newOpacity) => {
  scatterplot.set({ opacity: getOpacityRange(newOpacity) });
};

createMenu({ scatterplot, setNumPoints, setPointSize, setOpacity });

scatterplot.set({
  colorBy: 'category',
  pointColor: ['#ff80cb', '#57c7ff', '#eee462'],
  sizeBy: 'w',
  opacityBy: 'w',
});

setPointSize(pointSize);
setOpacity(opacity);
setNumPoints(numPoints);
