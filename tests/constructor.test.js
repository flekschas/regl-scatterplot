import '@babel/polyfill';
import { assert, expect, test } from 'vitest';
import { isFunction } from '@flekschas/utils';

import createScatterplot, {
  createRegl,
  createRenderer,
  createSpatialIndex,
  createTextureFromUrl,
} from '../src';

import {
  DEFAULT_CAMERA_IS_FIXED,
  DEFAULT_COLOR_ACTIVE,
  DEFAULT_COLOR_BG,
  DEFAULT_COLOR_HOVER,
  DEFAULT_COLOR_NORMAL,
  DEFAULT_GAMMA,
  DEFAULT_HEIGHT,
  DEFAULT_LASSO_BRUSH_SIZE,
  DEFAULT_LASSO_TYPE,
  DEFAULT_OPACITY,
  DEFAULT_OPACITY_INACTIVE_MAX,
  DEFAULT_OPACITY_INACTIVE_SCALE,
  DEFAULT_POINT_OUTLINE_WIDTH,
  DEFAULT_POINT_SIZE,
  DEFAULT_POINT_SIZE_SELECTED,
  DEFAULT_WIDTH,
  IMAGE_LOAD_ERROR,
} from '../src/constants';

import {
  createCanvas,
  flatArrayEqual,
} from './utils';

import imageUrl from './assets/image.jpg';

const EPS = 1e-7;

const floatEqual = (a, b) => Math.abs(a - b) <= EPS;

test('createRegl()', () => {
  const dim = 200;
  const canvas = createCanvas(dim, dim);
  const gl = canvas.getContext('webgl');

  expect(gl.drawingBufferWidth).toBe(dim);
  expect(gl.drawingBufferHeight).toBe(dim);

  const regl = createRegl(canvas);

  expect(regl).toBeDefined();

  regl.destroy();
});

test('createScatterplot()', () => {
  const canvas = createCanvas(null, null);
  const scatterplot = createScatterplot({ canvas });

  expect(scatterplot.get('canvas')).toBe(canvas);
  expect(scatterplot.get('backgroundColor')).toBe(DEFAULT_COLOR_BG);
  expect(scatterplot.get('pointColor')).toBe(DEFAULT_COLOR_NORMAL);
  expect(scatterplot.get('pointColorActive')).toBe(DEFAULT_COLOR_ACTIVE);
  expect(scatterplot.get('pointColorHover')).toBe(DEFAULT_COLOR_HOVER);
  expect(scatterplot.get('pointSize')).toBe(DEFAULT_POINT_SIZE);
  expect(scatterplot.get('pointSizeSelected')).toBe(DEFAULT_POINT_SIZE_SELECTED);
  expect(scatterplot.get('pointOutlineWidth')).toBe(DEFAULT_POINT_OUTLINE_WIDTH);
  expect(scatterplot.get('opacity')).toBe(DEFAULT_OPACITY);
  expect(scatterplot.get('opacityInactiveMax')).toBe(DEFAULT_OPACITY_INACTIVE_MAX);
  expect(scatterplot.get('opacityInactiveScale')).toBe(DEFAULT_OPACITY_INACTIVE_SCALE);
  expect(scatterplot.get('width')).toBe(DEFAULT_WIDTH);
  expect(scatterplot.get('height')).toBe(DEFAULT_HEIGHT);
  expect(scatterplot.get('opacityInactiveMax')).toBe(DEFAULT_OPACITY_INACTIVE_MAX);
  expect(scatterplot.get('opacityInactiveScale')).toBe(DEFAULT_OPACITY_INACTIVE_SCALE);
  expect(scatterplot.get('width')).toBe(DEFAULT_WIDTH);
  expect(scatterplot.get('height')).toBe(DEFAULT_HEIGHT);
  expect(scatterplot.get('cameraIsFixed')).toBe(DEFAULT_CAMERA_IS_FIXED);
  expect(scatterplot.get('lassoType')).toBe(DEFAULT_LASSO_TYPE);
  expect(scatterplot.get('lassoBrushSize')).toBe(DEFAULT_LASSO_BRUSH_SIZE);

  scatterplot.destroy();
});

test('createScatterplot({ cameraTarget, cameraDistance, cameraRotation, cameraView })', () => {
  const cameraTarget = [1, 1];
  const cameraDistance = 2;
  const cameraRotation = Math.PI / 4;
  const scatterplot = createScatterplot({
    cameraTarget,
    cameraDistance,
    cameraRotation,
  });

  expect(flatArrayEqual([1, 1], scatterplot.get('cameraTarget'), floatEqual)).toBe(true);
  expect(floatEqual(cameraDistance, scatterplot.get('cameraDistance'))).toBe(true);
  expect(floatEqual(cameraRotation, scatterplot.get('cameraRotation'))).toBe(true);

  // biome-ignore format: the array should not be formatted
  const cameraView = new Float32Array([
    0.5,   0,   0, 0.5,
    0,   0.5,   0, 0.5,
    0,     0, 0.5,   0,
    0,     0,   0,   1,
  ]);
  const scatterplot2 = createScatterplot({ cameraView });

  expect(cameraView).toEqual(scatterplot2.get('cameraView'));

  scatterplot.destroy();
  scatterplot2.destroy();
});

test('createTextureFromUrl()', async ({ skip }) => {
  const regl = createRegl(createCanvas());

  try {
    const texture = await createTextureFromUrl(regl, imageUrl);

    expect(texture._reglType).toBe('texture2d');
  } catch (e) {
    if (e.message === IMAGE_LOAD_ERROR) {
      skip('Skipping because image loading timed out');
    } else {
      assert.fail('Failed to load image from URL');
    }
  }

  regl.destroy();
});

test('createRenderer()', () => {
  const canvas = createCanvas();
  const regl = createRegl(canvas);
  const renderer = createRenderer({ canvas, regl });

  expect(!!renderer).toBe(true);
  expect(renderer.canvas).toBe(canvas);
  expect(renderer.regl).toBe(regl);
  expect(renderer.gamma).toBe(DEFAULT_GAMMA);
  expect(isFunction(renderer.render)).toBe(true);
  expect(isFunction(renderer.onFrame)).toBe(true);
  expect(isFunction(renderer.refresh)).toBe(true);
  expect(isFunction(renderer.destroy)).toBe(true);

  const sp1 = createScatterplot({ renderer });
  const sp2 = createScatterplot({ renderer });

  expect(sp1.get('renderer')).toBe(renderer);
  expect(sp2.get('renderer')).toBe(renderer);

  sp1.destroy();
  sp2.destroy();

  // Renderer should have not been destroyed
  expect(renderer.canvas).toBe(canvas);
  expect(renderer.regl).toBe(regl);

  const sp3 = createScatterplot({ renderer });
  expect(sp3.get('renderer')).toBe(renderer);

  renderer.gamma = 10;
  expect(renderer.gamma).toBe(10);

  sp3.destroy();
  renderer.destroy();

  // Now the renderer should have been destroyed
  expect(renderer.canvas).toBeUndefined();
  expect(renderer.regl).toBeUndefined();
});

test('createSpatialIndex', async () => {
  const points = {
    x: [-1, 1, 0, -1, 1],
    y: [1, 1, 0, -1, -1],
    z: [0.2, 0.4, 0.6, 0.8, 1],
  };

  const spatialIndex1 = await createSpatialIndex(points);
  const spatialIndex2 = await createSpatialIndex(points, {
    useWorker: true,
  });

  const scatterplot = createScatterplot({ canvas: createCanvas() });

  await scatterplot.draw(points, { spatialIndex: spatialIndex1 });

  await scatterplot.zoomToArea({ x: 0, y: 0, width: 1, height: 1 });

  expect(scatterplot.get('pointsInView')).toEqual([1, 2]);

  await scatterplot.draw(points, { spatialIndex: spatialIndex2 });

  await scatterplot.zoomToArea({ x: -1, y: -1, width: 1, height: 1 });

  expect(scatterplot.get('pointsInView')).toEqual([2, 3]);

  scatterplot.destroy();
});
