/* eslint no-console: 0 */
import { tableFromIPC } from 'apache-arrow';
import createScatterplot, { createRenderer } from '../src';
import createMenu from './menu';
import { showModal, closeModal } from './utils';

/**
 * General configuration
 */
const NUM_COLUMNS = 2;
const NUM_ROWS = 2;
const POINT_SIZE = 3;
const OPACITY = 0.66;
const FASHION_MNIST_CLASS_LABELS = [
  'T-shirt/top',
  'Trouser',
  'Pullover',
  'Dress',
  'Coat',
  'Sandal',
  'Shirt',
  'Sneaker',
  'Bag',
  'Ankle boot',
];
const CLASS_COLORS = [
  '#FFFF00',
  '#1CE6FF',
  '#FF34FF',
  '#FF4A46',
  '#008941',
  '#006FA6',
  '#A30059',
  '#FFDBE5',
  '#7A4900',
  '#0000A6',
];

/**
 * Load Embedding Example
 */
const whenData = fetch(
  'https://storage.googleapis.com/flekschas/regl-scatterplot/fashion-mnist-embeddings.arrow'
);

/**
 * Modal
 */
showModal('Loading...');

/**
 * Add info to footer
 */
const footer = document.querySelector('#footer');
footer.classList.remove('hidden');
const infoContent = document.querySelector('#info-content');
infoContent.innerHTML = `
<p><a href="https://github.com/zalandoresearch/fashion-mnist" target="_blank">Fashion MNIST</a> embedding using four different techniques: PCA, t-SNE, UMAP, and a convolutional autoencoder.</p>
<p> Select a point so see the corresponding image.</p>
`;

/**
 * Note
 */
const parentWrapper = document.querySelector('#parent-wrapper');
const noteEl = document.createElement('div');
noteEl.id = 'note';
noteEl.style.opacity = 0;
parentWrapper.appendChild(noteEl);

const showNote = (text, color) => {
  noteEl.style.opacity = 1;
  noteEl.style.background = color;
  noteEl.textContent = text;
};

const hideNote = () => {
  noteEl.style.opacity = 0;
};

/**
 * Image
 */
const centerNoteEl = document.createElement('div');
centerNoteEl.id = 'center-note';
centerNoteEl.style.opacity = 0;
const imgEl = document.createElement('div');
imgEl.style.width = '56px';
imgEl.style.height = '56px';
imgEl.style.backgroundColor = 'black';
imgEl.style.backgroundSize = 'cover';
imgEl.style.backgroundRepeat = 'no-repeat';
centerNoteEl.appendChild(imgEl);
parentWrapper.appendChild(centerNoteEl);

const zeroPad = (num, places) => String(num).padStart(places, '0');

const showImg = (pointId, classId) => {
  const img = new Image();
  const imgId = zeroPad(pointId, 5);
  const src = `https://storage.googleapis.com/flekschas/regl-scatterplot/fashion-mnist-images/${imgId}.png`;
  img.onload = () => {
    centerNoteEl.style.opacity = 1;
    centerNoteEl.style.transform = 'translate(-50%, -50%) scale(1)';
    imgEl.style.backgroundImage = `url("${src}")`;
    centerNoteEl.style.background = CLASS_COLORS[classId];
  };
  img.src = src;
};

const hideImg = () => {
  centerNoteEl.style.opacity = 0;
  centerNoteEl.style.transform = 'translate(-50%, -50%) scale(0)';
};

/**
 * Set up the HTML template
 */
parentWrapper.style.display = 'grid';
parentWrapper.style.gridTemplateColumns = `repeat(${NUM_COLUMNS}, minmax(0, 1fr))`;
parentWrapper.style.gridTemplateRows = `repeat(2, minmax(0, 1fr))`;
parentWrapper.style.gap = '1rem';

const baseCanvas = document.querySelector('#canvas');
const baseCanvasWrapper = document.querySelector('#canvas-wrapper');
baseCanvasWrapper.style.position = 'relative';

const canvases = [baseCanvas];

for (let i = 0; i < NUM_COLUMNS * NUM_ROWS - 1; i++) {
  const newCanvas = baseCanvas.cloneNode();
  const newCanvasWrapper = baseCanvasWrapper.cloneNode();
  newCanvasWrapper.appendChild(newCanvas);
  parentWrapper.appendChild(newCanvasWrapper);
  canvases.push(newCanvas);
}

/**
 * Create a reusable renderer
 */
const renderer = createRenderer();

if (!renderer.isSupported) {
  showModal(
    'Unfortunately, your browser does not support all WebGL extensions required by regl-scatterplot',
    true
  );
}

/**
 * Create a scatter plot instances
 */

const scatterplots = canvases.map((canvas) =>
  createScatterplot({
    renderer,
    canvas,
    pointSize: POINT_SIZE,
    opacity: OPACITY,
    lassoOnLongPress: true,
  })
);

console.log(`Scatterplot v${scatterplots[0].get('version')}`);

createMenu({ scatterplot: scatterplots });

/**
 * Link scatter plots
 */
const syncSelection = (source, selectedPoints, classIds) => {
  scatterplots
    .filter((sp) => sp !== source)
    .forEach((sp) => {
      sp.select(selectedPoints, { preventEvent: true });
    });

  scatterplots.forEach((sp) => {
    sp.zoomToPoints(selectedPoints, {
      padding: 0.2,
      transition: true,
      transitionDuration: 1500,
    });
  });

  const pointId =
    selectedPoints[Math.floor(Math.random() * (selectedPoints.length - 1))];
  showImg(pointId, classIds[pointId]);
};

const syncDeselection = (source) => {
  scatterplots
    .filter((sp) => sp !== source)
    .forEach((sp) => {
      sp.deselect({ preventEvent: true });
    });

  scatterplots.forEach((sp) => {
    sp.zoomToOrigin({
      transition: true,
      transitionDuration: 1500,
    });
  });

  hideImg();
};

/**
 * Finally, draw points 🎉
 */

whenData
  .then((data) => tableFromIPC(data))
  .then((table) => {
    closeModal();
    const columnValues = table.data[0].children.map((data) => data.values);
    const classIds = columnValues[columnValues.length - 1];

    scatterplots.forEach((sp, i) => {
      sp.draw({
        x: columnValues[i * 2],
        y: columnValues[i * 2 + 1],
        z: classIds,
      });
      sp.set({
        colorBy: 'z',
        pointColor: CLASS_COLORS,
      });
      sp.subscribe('pointover', (pointId) => {
        showNote(
          FASHION_MNIST_CLASS_LABELS[classIds[pointId]],
          CLASS_COLORS[classIds[pointId]]
        );
      });
      sp.subscribe('pointout', hideNote);
      sp.subscribe('select', ({ points }) =>
        syncSelection(sp, points, classIds)
      );
      sp.subscribe('deselect', () => syncDeselection(sp));
    });
  })
  .catch((error) => {
    showModal('Could not load embedding... Damn...', true);
    console.error(error);
  });
