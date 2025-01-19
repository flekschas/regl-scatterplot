import { tableFromIPC } from 'apache-arrow';

import createScatterplot from '../src';
import createMenu from './menu';
import { checkSupport, showModal, closeModal } from './utils';

const CLASS_COLORS = [
  '#FFFF00', // bright yellow
  '#1CFFD9', // turrtoise
  '#FF34FF', // pink/purple
  '#FF4A46', // pale red
  '#008941', // forrest green
  '#1966FF', // dark blue
  '#C00069', // violette
  '#FFDBE5', // almost white
  '#FF9900', // yellow
  '#8148D5', // grass green
];

/**
 * Load Embedding Example
 */
const whenData = fetch(
  'https://storage.googleapis.com/flekschas/regl-scatterplot/cities.arrow'
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
<p><a href="https://www.geonames.org/about.html" target="_blank">GeoNames – Cities Dataset</a> visualized in three: by the cities' geographic location, by the total population across contintents, and by the citie's latitude distribution.</p>
`;

const canvas = document.querySelector('#canvas');

let pointSize = 1.5;

const scatterplot = createScatterplot({
  canvas,
  pointSize,
  lassoOnLongPress: true,
});

checkSupport(scatterplot);

console.log(`Scatterplot v${scatterplot.get('version')}`);

createMenu({ scatterplot, opacityChangesDisabled: true });

whenData
  .then((data) => tableFromIPC(data))
  .then((table) => {
    closeModal();
    const columnValues = table.data[0].children.map((data) => data.values);

    const population = columnValues[columnValues.length - 2];
    const continents = columnValues[columnValues.length - 1];

    const staticOpacity = new Float32Array(population.length);
    for (let i = 0; i < population.length; i++) {
      staticOpacity[i] = 1;
    }

    scatterplot.draw({
      x: columnValues[0],
      y: columnValues[1],
      z: continents,
      w: population,
    });
    scatterplot.set({
      colorBy: 'z',
      pointColor: CLASS_COLORS,
      opacityBy: 'w',
      opacity: Array.from({ length: 10 }, (_, i) => 0.33 + (i / 9) * 0.33),
    });

    let i = 0;
    const transitionPoints = () => {
      i++;

      const startCol = (i % 3) * 2;

      scatterplot
        .draw(
          {
            x: columnValues[startCol],
            y: columnValues[startCol + 1],
            z: continents,
            w: [population, staticOpacity, staticOpacity][i % 3],
          },
          {
            transition: true,
            transitionDuration: 750,
            transitionEasing: 'quadInOut',
          }
        )
        .then(() => {
          setTimeout(transitionPoints, 2500);
        });
    };

    setTimeout(transitionPoints, 2500);
  });
