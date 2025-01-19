import createScatterplot from '../src';
import createMenu from './menu';
import { checkSupport } from './utils';

const canvas = document.querySelector('#canvas');

const { width, height } = canvas.getBoundingClientRect();

let points = [];
let numPoints = 100000;
let pointSize = 3;
let opacity = 1;
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
  opacity,
  showReticle: true,
  backgroundImage: `https://picsum.photos/${Math.min(640, width)}/${Math.min(
    640,
    height
  )}/?random`,
  lassoInitiator: true,
});

checkSupport(scatterplot);

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

const setNumPoints = (newNumPoints) => {
  points = generatePoints(newNumPoints);
  scatterplot.draw(points);
};

createMenu({ scatterplot, setNumPoints });

scatterplot.set({ colorBy: 'category', pointColor: ['#3a78aa', '#aa3a99'] });

setNumPoints(numPoints);
