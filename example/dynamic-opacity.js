import createScatterplot from '../src';
import createMenu from './menu';
import { checkSupport } from './utils';

const canvas = document.querySelector('#canvas');

let points = [];
let numPoints = 1000000;
let pointSize = 2;
let opacityByDensityFill = 0.15;
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
  pointColor: '#fff',
  opacityBy: 'density',
  showReticle,
  reticleColor,
  lassoInitiator: true,
});

checkSupport(scatterplot);

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);

const generatePoints = (num) => {
  const newPoints = [];

  let xn = 2.644838333129883;
  let yn = 4.060488700866699;
  let zn = 2.8982460498809814;
  let xn1;
  let yn1;
  let zn1;
  const a = 0.2;
  const b = 0.2;
  const c = 5.7;
  const dt = 0.006;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i <= num; i++) {
    let dx = -yn - zn;
    let dy = xn + a * yn;
    let dz = b + zn * (xn - c);

    const xh = xn + 0.5 * dt * dx;
    const yh = yn + 0.5 * dt * dy;
    const zh = zn + 0.5 * dt * dz;

    dx = -yh - zh;
    dy = xh + a * yh;
    dz = b + zh * (xh - c);

    xn1 = xn + dt * dx;
    yn1 = yn + dt * dy;
    zn1 = zn + dt * dz;

    newPoints.push([xn1, yn1, 0, 0]);

    minX = xn1 < minX ? xn1 : minX;
    maxX = xn1 > maxX ? xn1 : maxX;
    minY = yn1 < minY ? yn1 : minY;
    maxY = yn1 > maxY ? yn1 : maxY;

    xn = xn1;
    yn = yn1;
    zn = zn1;
  }

  const dX = maxX - minX;
  const dY = maxY - minY;

  for (let i = 0; i <= num; i++) {
    newPoints[i][0] -= minX;
    newPoints[i][0] /= dX / 2;
    newPoints[i][0] -= 1;
    newPoints[i][1] -= minY;
    newPoints[i][1] /= dY / 2;
    newPoints[i][1] -= 1;
  }

  return newPoints;
};

const setNumPoints = (newNumPoints) => {
  points = generatePoints(newNumPoints);
  scatterplot.draw(points);
};

createMenu({ scatterplot, setNumPoints });

setNumPoints(numPoints);
