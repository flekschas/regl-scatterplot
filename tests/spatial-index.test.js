import '@babel/polyfill';

import { expect, test } from 'vitest';

import createScatterplot, { createSpatialIndex } from '../src';

import { createCanvas } from './utils';

test('spatial index', async () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const x = [-1, 1, 0, -1, 1];
  const y = [1, 1, 0, -1, -1];
  const z1 = [0.2, 0.4, 0.6, 0.8, 1];
  const z2 = [1, 0.8, 0.6, 0.4, 0.2];

  await scatterplot.draw({ x, y, z: z1 });

  await scatterplot.zoomToArea({ x: 0, y: 0, width: 1, height: 1 });

  expect(scatterplot.get('pointsInView')).toEqual([1, 2]);

  const spatialIndex = scatterplot.get('spatialIndex');

  // Because `x` and `y` remain unchanged, we can reuse the spatial index
  // from the previous draw call.
  await scatterplot.draw({ x, y, z: z2 }, { spatialIndex });

  await scatterplot.zoomToArea({ x: -1, y: -1, width: 1, height: 1 });

  // The reused spatial index should work as before
  expect(scatterplot.get('pointsInView')).toEqual([2, 3]);

  scatterplot.destroy();
});

test('create spatial index', async () => {
  const points = {
    x: [-1, 1, 0, -1, 1],
    y: [1, 1, 0, -1, -1],
    z: [0.2, 0.4, 0.6, 0.8, 1],
  };

  const spatialIndex1 = await createSpatialIndex(points);
  const spatialIndex2 = await createSpatialIndex(points, { useWorker: true });

  const scatterplot = createScatterplot({ canvas: createCanvas() });

  await scatterplot.draw(points, { spatialIndex: spatialIndex1 });

  await scatterplot.zoomToArea({ x: 0, y: 0, width: 1, height: 1 });

  expect(scatterplot.get('pointsInView')).toEqual([1, 2]);

  await scatterplot.draw(points, { spatialIndex: spatialIndex2 });

  await scatterplot.zoomToArea({ x: -1, y: -1, width: 1, height: 1 });

  expect(scatterplot.get('pointsInView')).toEqual([2, 3]);

  scatterplot.destroy();
});
