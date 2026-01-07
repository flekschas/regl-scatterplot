import { axisBottom, axisRight } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';

import createScatterplot from '../src';
import createMenu from './menu';
import { checkSupport } from './utils';

const parentWrapper = document.querySelector('#parent-wrapper');
const canvasWrapper = document.querySelector('#canvas-wrapper');
const canvas = document.querySelector('#canvas');

// Create button container with grid layout
const buttonContainer = document.createElement('div');
buttonContainer.style.cssText = `
  position: absolute;
  top: 10px;
  left: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  max-width: 400px;
  max-height: calc(100vh - 20px);
  overflow-y: auto;
  z-index: 1000;
`;
parentWrapper.appendChild(buttonContainer);

const xDomain = [0, 100];
const yDomain = [0, 100];
const xScale = scaleLinear().domain(xDomain);
const yScale = scaleLinear().domain(yDomain);
const xAxis = axisBottom(xScale);
const yAxis = axisRight(yScale);
const axisContainer = select(parentWrapper).append('svg');
const xAxisContainer = axisContainer.append('g');
const yAxisContainer = axisContainer.append('g');
const xAxisPadding = 20;
const yAxisPadding = 40;

axisContainer.node().style.position = 'absolute';
axisContainer.node().style.top = 0;
axisContainer.node().style.left = 0;
axisContainer.node().style.width = '100%';
axisContainer.node().style.height = '100%';
axisContainer.node().style.pointerEvents = 'none';

canvasWrapper.style.right = `${yAxisPadding}px`;
canvasWrapper.style.bottom = `${xAxisPadding}px`;

let { width, height } = canvasWrapper.getBoundingClientRect();

xAxisContainer.attr('transform', `translate(0, ${height})`).call(xAxis);
yAxisContainer.attr('transform', `translate(${width}, 0)`).call(yAxis);

// Render grid
xAxis.tickSizeInner(-height);
yAxis.tickSizeInner(-width);

let points = [];
let numPoints = 5000;
let pointSize = 4;
let opacity = 0.66;
let selection = [];

const selectHandler = ({ points: selectedPoints }) => {
  console.log('Selected:', selectedPoints.length, 'points');
  selection = selectedPoints;
};

const deselectHandler = () => {
  console.log('Deselected');
  selection = [];
};

const scatterplot = createScatterplot({
  canvas,
  pointSize,
  opacity,
  xScale,
  yScale,
  showReticle: true,
  lassoInitiator: true,
  pointColor: [0.33, 0.5, 1, 1],
  pointColorActive: [1, 0.5, 0, 1],
});

checkSupport(scatterplot);

console.log(`Scatterplot v${scatterplot.get('version')}`);

scatterplot.subscribe('select', selectHandler);
scatterplot.subscribe('deselect', deselectHandler);
scatterplot.subscribe('view', (event) => {
  xAxisContainer.call(xAxis.scale(event.xScale));
  yAxisContainer.call(yAxis.scale(event.yScale));
});

scatterplot.subscribe(
  'init',
  () => {
    xAxisContainer.call(xAxis.scale(scatterplot.get('xScale')));
    yAxisContainer.call(yAxis.scale(scatterplot.get('yScale')));
  },
  1
);

const resizeHandler = () => {
  ({ width, height } = canvasWrapper.getBoundingClientRect());

  xAxisContainer.attr('transform', `translate(0, ${height})`).call(xAxis);
  yAxisContainer.attr('transform', `translate(${width}, 0)`).call(yAxis);

  // Render grid
  xAxis.tickSizeInner(-height);
  yAxis.tickSizeInner(-width);
};

window.addEventListener('resize', resizeHandler);
window.addEventListener('orientationchange', resizeHandler);

// Generate points in DATA SPACE (not NDC)
const generatePoints = (num) => {
  const pts = [];
  for (let i = 0; i < num; i++) {
    const x = Math.random() * 100; // 0 to 100 (data space)
    const y = Math.random() * 100; // 0 to 100 (data space)

    // Convert to NDC for scatterplot
    const xNdc = (x / 100) * 2 - 1;
    const yNdc = (y / 100) * 2 - 1;

    pts.push([
      xNdc,
      yNdc,
      Math.round(Math.random() * 4), // category
      Math.random(), // value
      x, // store original x for reference
      y, // store original y for reference
    ]);
  }
  return pts;
};

const setNumPoints = (newNumPoints) => {
  points = generatePoints(newNumPoints);
  scatterplot.draw(points);
};

createMenu({ scatterplot, setNumPoints });

scatterplot.set({
  colorBy: 'category',
  pointColor: [
    '#3a84cc',
    '#56bf92',
    '#eecb62',
    '#c76526',
    '#d192b7',
  ],
});

// Helper function to create a button
const createButton = (label, onClick, wide = false) => {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.style.cssText = `
    padding: 6px 10px;
    background: #3a84cc;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    white-space: nowrap;
    text-align: center;
    ${wide ? 'grid-column: 1 / -1;' : ''}
  `;
  btn.addEventListener('mouseenter', () => {
    btn.style.background = '#2a6cb0';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = '#3a84cc';
  });
  btn.addEventListener('click', onClick);
  return btn;
};

// Button 1: Select bottom-left triangle
buttonContainer.appendChild(
  createButton('△ Bottom-Left', () => {
    scatterplot.lassoSelect([
      [10, 10],
      [40, 10],
      [10, 40],
    ]);
  })
);

// Button 2: Select top-right circle (approximated by polygon)
buttonContainer.appendChild(
  createButton('○ Top-Right', () => {
    const cx = 75;
    const cy = 75;
    const radius = 20;
    const sides = 16;
    const polygon = [];

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      polygon.push([
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius,
      ]);
    }

    scatterplot.lassoSelect(polygon);
  })
);

// Button 3: Select center rectangle
buttonContainer.appendChild(
  createButton('▭ Center', () => {
    scatterplot.lassoSelect([
      [30, 30],
      [70, 30],
      [70, 70],
      [30, 70],
    ]);
  })
);

// Button 4: Add diagonal stripe (merge)
buttonContainer.appendChild(
  createButton('+ Diagonal (Merge)', () => {
    scatterplot.lassoSelect(
      [
        [0, 40],
        [60, 100],
        [70, 100],
        [10, 40],
      ],
      { merge: true }
    );
  })
);

// Button 5: Remove center square
buttonContainer.appendChild(
  createButton('− Center (Remove)', () => {
    scatterplot.lassoSelect(
      [
        [40, 40],
        [60, 40],
        [60, 60],
        [40, 60],
      ],
      { remove: true }
    );
  })
);

// Button 6: Star shape
buttonContainer.appendChild(
  createButton('★ Star', () => {
    const cx = 50;
    const cy = 50;
    const outerRadius = 30;
    const innerRadius = 15;
    const points = 5;
    const polygon = [];

    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      polygon.push([
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius,
      ]);
    }

    scatterplot.lassoSelect(polygon);
  })
);

// Button 7: Deselect all (wide button)
buttonContainer.appendChild(
  createButton('✕ Deselect All', () => {
    scatterplot.deselect();
  }, true)
);

setNumPoints(numPoints);
