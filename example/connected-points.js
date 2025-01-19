import createScatterplot from '../src';
import createMenu from './menu';
import { checkSupport } from './utils';

const canvas = document.querySelector('#canvas');

let points = [];
let numPoints = 9000;
let pointSize = 1;
let opacity = 0.33;
let selection = [];

const pointSizeMax = 10;
const lassoMinDelay = 10;
const lassoMinDist = 2;
const showReticle = true;
const reticleColor = [1, 1, 0.878431373, 0.33];
const showPointConnections = true;
const pointConnectionColor = [1, 1, 1, 0.15];
const pointConnectionSize = 2;

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
  showPointConnections,
  pointConnectionColor,
  pointConnectionSize,
  lassoInitiator: true,
});

checkSupport(scatterplot);

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);

const generatePoints = (num) => {
  const numPointsPerGroup = Math.round(num / 3); // 9.000 / 3 => 3000
  const numPointsPerStep = Math.round(numPointsPerGroup / 5); // 3000 / 5 => 600
  // 600 * 3 => 1800 (lines)

  const outPoints = [];

  for (let g = 0; g < 3; g++) {
    for (let i = 0; i < numPointsPerStep; i++) {
      for (let s = 0; s < 5; s++) {
        outPoints.push([
          -0.6 + g * 0.6 + (Math.random() * 0.3 - 0.15), // x
          -0.9 + s * 0.45, // y
          g, // category
          Math.random(), // value
          g * numPointsPerStep + i, // to identify connected points
          // (s + 2) % 5, // specifies the order of the connected points
        ]);
      }
    }
  }

  return outPoints;
};

const setNumPoints = (newNumPoints) => {
  points = generatePoints(newNumPoints);
  scatterplot.draw(points);
};

const getPointSizeRange = (basePointSize) =>
  Array.from(
    { length: 100 },
    (_, i) => 1 + (i / 99) * (basePointSize * pointSizeMax - 1)
  );

const setPointSize = (newPointSize) => {
  scatterplot.set({ pointSize: getPointSizeRange(newPointSize) });
};

createMenu({ scatterplot, setNumPoints, setPointSize });

scatterplot.set({
  colorBy: 'valueZ',
  sizeBy: 'valueW',
  pointColor: [
    [255, 128, 203, 128],
    [87, 199, 255, 128],
    [238, 228, 98, 128],
  ],
  pointConnectionColorBy: 'valueZ',
  pointConnectionColor: [
    [255, 128, 203, 6],
    [87, 199, 255, 6],
    [238, 228, 98, 6],
  ],
  pointConnectionColorActive: [
    [255, 128, 203, 128],
    [87, 199, 255, 128],
    [238, 228, 98, 128],
  ],
  pointConnectionColorHover: [
    [255, 128, 203, 99],
    [87, 199, 255, 99],
    [238, 228, 98, 99],
  ],
  pointConnectionOpacityBy: 'valueW',
  pointConnectionOpacity: Array(10)
    .fill()
    .map((v, i) => (i + 1) / 100),
  pointConnectionSizeBy: 'valueW',
  pointConnectionSize: Array(18)
    .fill()
    .map((v, i) => (i + 1) / 2),
});

setPointSize(pointSize);
setNumPoints(numPoints);
