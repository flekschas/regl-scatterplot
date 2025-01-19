import '@babel/polyfill';
import { assert, expect, test } from 'vitest';
import { nextAnimationFrame, hasSameElements } from '@flekschas/utils';

import createScatterplot from '../src';

import {
  DEFAULT_POINT_SCALE_MODE,
  ERROR_INSTANCE_IS_DESTROYED,
  ERROR_IS_DRAWING,
  ERROR_POINTS_NOT_DRAWN,
} from '../src/constants';

import { createCanvas, wait, getPixelSum } from './utils';

const EPS = 1e-7;

test('draw() with transition', async () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  let numDrawCalls = 0;
  let numTransitionStartCalls = 0;
  let numTransitionEndCalls = 0;

  scatterplot.subscribe('draw', () => numDrawCalls++);
  scatterplot.subscribe('transitionStart', () => numTransitionStartCalls++);
  scatterplot.subscribe('transitionEnd', () => numTransitionEndCalls++);

  await scatterplot.draw([[0, 0]]);

  expect(numDrawCalls).toBe(1);

  const t0 = performance.now();
  const transitionDuration = 250;

  await scatterplot.draw([[1, 1]], {
    transition: true,
    transitionDuration,
  });

  expect(numTransitionStartCalls).toBe(1);
  expect(numTransitionEndCalls).toBe(1);
  expect(performance.now() - t0 >= transitionDuration).toBe(true);

  scatterplot.destroy();
});

test('draw() with preventFilterReset', async () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const filteredPoints = [0, 1, 2];

  const points = [
    [0, 0],
    [0.9, 0.9],
    [0.9, -0.9],
    [-0.9, -0.9],
    [-0.9, 0.9],
  ];

  await scatterplot.draw(points);

  await scatterplot.filter(filteredPoints);
  await wait(0);

  expect(
    hasSameElements(scatterplot.get('filteredPoints'), filteredPoints)
  ).toBe(true);

  let img = scatterplot.export();

  // The left side of the image should be empty as points #3 and #4 are filtered out
  expect(
    getPixelSum(img, 0, Math.ceil(img.width / 3), 0, img.height)
  ).toBe(0);

  // The right side of the image should *not* be empty as points #0 to #2 are filtered in
  expect(
    getPixelSum(img, Math.ceil(img.width / 3), img.width, 0, img.height) > 0
  ).toBe(true);

  await scatterplot.draw([...points], { preventFilterReset: true });

  // `isPointsFiltered` should be `true` as draw has been invoked with preventFilterReset
  expect(scatterplot.get('isPointsFiltered')).toBe(true);

  // the filtered points should be the same as before
  expect(
    hasSameElements(scatterplot.get('filteredPoints'), filteredPoints)
  ).toBe(true);

  img = scatterplot.export();

  // The left side of the image should be empty as points #3 and #4 are filtered out
  expect(
    getPixelSum(img, 0, Math.ceil(img.width / 3), 0, img.height)
  ).toBe(0);

  // The right side of the image should *not* be empty as points #0 to #2 are filtered in
  expect(
    getPixelSum(img, Math.ceil(img.width / 3), img.width, 0, img.height) > 0
  ).toBe(true);

  await scatterplot.draw([...points, [0.5, 0.5]], {
    preventFilterReset: true,
  });

  // `isPointsFiltered` should be `false` as draw has been invoked with different number of points
  expect(scatterplot.get('isPointsFiltered')).toBe(false);

  // the filtered points should be reset as draw has been invoked with different number of points
  expect(scatterplot.get('filteredPoints').length).toBe(points.length + 1);

  img = scatterplot.export();

  // The left side of the image should *not* be empty as the filter was reset
  expect(
    getPixelSum(img, 0, Math.ceil(img.width / 3), 0, img.height) > 0
  ).toBe(true);

  scatterplot.destroy();
});

test('draw() prematurely', async () => {
  const canvas = createCanvas();
  const scatterplot = createScatterplot({ canvas });

  const whenDrawn1 = scatterplot.draw([[-1, 1], [0, 0], [1, -1]]);
  const whenDrawn2 = scatterplot.draw([[-1, 1], [0, 0], [1, -1]]);
  await expect(whenDrawn2).rejects.toThrow(ERROR_IS_DRAWING);

  await expect(whenDrawn1).resolves.toBe(undefined);

  const whenDrawn3 = scatterplot.draw([[-1, 1], [0, 0], [1, -1]]);

  await expect(whenDrawn3).resolves.toBe(undefined);

  scatterplot.destroy();
});

test('draw() after destroy', async () => {
  const canvas = createCanvas();
  const scatterplot = createScatterplot({ canvas });

  scatterplot.destroy();

  const whenDrawn = scatterplot.draw([[-1, 1], [0, 0], [1, -1]]);

  await expect(whenDrawn).rejects.toThrow(ERROR_INSTANCE_IS_DESTROYED);
});

test('select()', async () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const points = [
    [0, 0],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];

  await scatterplot.draw(points);

  let selectedPoints = [];
  const selectHandler = ({ points: newSelectedPoints }) => {
    selectedPoints = [...newSelectedPoints];
  };
  const deselectHandler = () => {
    selectedPoints = [];
  };
  scatterplot.subscribe('select', selectHandler);
  scatterplot.subscribe('deselect', deselectHandler);

  scatterplot.select([0, 2, 4]);

  await wait(0);

  expect(selectedPoints).toEqual([0, 2, 4]);
  expect(scatterplot.get('selectedPoints')).toEqual([0, 2, 4]);

  scatterplot.deselect();

  await wait(0);

  expect(selectedPoints.length).toBe(0);

  scatterplot.select([0, 2, 4]);

  await wait(0);

  expect(scatterplot.get('selectedPoints')).toEqual([0, 2, 4]);

  scatterplot.select([]);

  await wait(0);

  expect(selectedPoints.length).toBe(0);

  scatterplot.select([0, 2, 4], { preventEvent: true });

  await wait(0);

  expect(selectedPoints.length + scatterplot.get('selectedPoints').length).toBe(3);

  scatterplot.deselect();
  scatterplot.select([0, 2, 4]);
  scatterplot.deselect({ preventEvent: true });

  await wait(0);

  expect(selectedPoints).toEqual([0, 2, 4]);

  scatterplot.select(2);

  await wait(0);

  expect(selectedPoints).toEqual([2]);

  scatterplot.select(-1);

  await wait(0);

  expect(selectedPoints).toEqual([]);

  scatterplot.select([0, -1, 2, 4, 6]);

  await wait(0);

  expect(selectedPoints).toEqual([0, 2, 4]);

  scatterplot.destroy();
});

test('hover() with columnar data', async () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const data = {
    x: [0, 1, 1, -1, -1],
    y: [0, 1, -1, -1, 1],
  };

  await scatterplot.draw(data);

  let hovering;
  const pointoverHandler = (newHovering) => {
    hovering = newHovering;
  };
  const pointoutHandler = () => {
    hovering = undefined;
  };
  scatterplot.subscribe('pointover', pointoverHandler);
  scatterplot.subscribe('pointout', pointoutHandler);

  scatterplot.hover(0);

  await wait(0);

  expect(hovering).toBe(0);

  scatterplot.hover();

  await wait(0);

  expect(hovering).toBe(undefined);

  scatterplot.hover(2, { preventEvent: true });

  await wait(0);

  // should be silently hovering point 2
  expect(hovering).toBe(undefined);

  scatterplot.hover(4);
  scatterplot.hover(undefined, { preventEvent: true });

  await wait(0);

  // should have silently stopped hovering point 4
  expect(hovering).toBe(4);

  scatterplot.hover(-1);

  await wait(0);

  // Point 4 should still be registered as being hovered because -1 is invalid
  expect(hovering).toBe(4);

  scatterplot.hover(6);

  await wait(0);

  // Point 4 should still be registered as being hovered because 6 is invalid
  expect(hovering).toBe(4);

  scatterplot.destroy();
});

test('filter()', async () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const points = [
    [0, 0],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];

  await scatterplot.draw(points);

  expect(scatterplot.get('isPointsFiltered')).toBe(false);

  expect(
    hasSameElements(scatterplot.get('filteredPoints'), [0, 1, 2, 3, 4])
  ).toBe(true);

  let filteredPoints = [];
  const filterHandler = ({ points: newFilteredPoints }) => {
    filteredPoints = [...newFilteredPoints];
  };
  const unfilterHandler = () => {
    filteredPoints = scatterplot.get('filteredPoints');
  };
  scatterplot.subscribe('filter', filterHandler);
  scatterplot.subscribe('unfilter', unfilterHandler);

  let hoveredPoint;
  const pointOverHandler = (pointIdx) => {
    hoveredPoint = pointIdx;
  };
  const pointOutHandler = () => {
    hoveredPoint = undefined;
  };
  scatterplot.subscribe('pointover', pointOverHandler);
  scatterplot.subscribe('pointout', pointOutHandler);

  await scatterplot.filter([1, 3]);
  await wait(0);

  expect(
    hasSameElements(filteredPoints, [1, 3])
  ).toBe(true);

  expect(scatterplot.get('isPointsFiltered')).toBe(true);

  expect(
    hasSameElements(scatterplot.get('pointsInView'), [1, 3])
  ).toBe(true);

  expect(
    hasSameElements(scatterplot.get('filteredPoints'), [1, 3])
  ).toBe(true);

  scatterplot.hover(1);
  await wait(0);

  expect(hoveredPoint).toBe(1);

  scatterplot.hover(2);
  await wait(0);

  // should not be able to hover a point that is filtered out
  expect(hoveredPoint).toBe(undefined);

  let selectedPoints = [];
  const selectHandler = ({ points: newSelectedPoints }) => {
    selectedPoints = [...newSelectedPoints];
  };
  const deselectHandler = () => {
    selectedPoints = [];
  };
  scatterplot.subscribe('select', selectHandler);
  scatterplot.subscribe('deselect', deselectHandler);

  scatterplot.select([0, 2, 4]);

  await wait(0);

  // should not have selected points 0, 2, and 4 because they are filtered out
  expect(selectedPoints.length).toBe(0);

  await scatterplot.filter([]);

  await wait(0);

  expect(filteredPoints.length).toBe(0);
  expect(scatterplot.get('filteredPoints').length).toBe(0);

  scatterplot.select([0, 1, 2, 3, 4]);

  await wait(0);

  // should not be able to selected any points because all are filtered out
  expect(selectedPoints.length).toBe(0);

  await scatterplot.unfilter();
  await wait(0);

  // should have unfiltered the points
  expect(
    hasSameElements(filteredPoints, [0, 1, 2, 3, 4])
  ).toBe(true);

  expect(
    hasSameElements(scatterplot.get('filteredPoints'), [0, 1, 2, 3, 4])
  ).toBe(true);

  expect(
    scatterplot.get('isPointsFiltered'),
  ).toBe(false);

  scatterplot.select([0, 2, 4]);

  await wait(0);

  expect(selectedPoints).toEqual([0, 2, 4]);

  await scatterplot.filter([1, 3], { preventEvent: true });
  await wait(0);

  // should have silently filtered down to two points. I.e., the filter
  // argument should not have been altered
  expect(filteredPoints.length).toBe(5);
  expect(scatterplot.get('pointsInView').length).toBe(2);

  await scatterplot.filter([0, 1, 3]);
  await scatterplot.unfilter({ preventEvent: true });
  await wait(0);

  // should have silently unfiltered points. I.e., the unfilter argument
  // should not have been altered
  expect(filteredPoints.length).toBe(3);
  expect(scatterplot.get('pointsInView').length).toBe(5);

  await scatterplot.filter(2);
  await wait(0);

  expect(filteredPoints.length).toBe(1);
  expect(filteredPoints[0]).toBe(2);
  expect(scatterplot.get('pointsInView').length).toBe(1);

  await scatterplot.filter(-1);
  await wait(0);

  // should have not filtered down to any point because -1 is an invalid point index
  expect(filteredPoints.length).toBe(0);

  const pointsToBeFiltered = [0, -1, 2, 4, 6];

  await scatterplot.filter(pointsToBeFiltered);
  await wait(0);

  // should have filtered down to valid points (0, 2, and 4) only
  expect(
    hasSameElements(filteredPoints, [0, 2, 4])
  ).toBe(true);

  // We're testing this due to the following bug where we accidentically
  // spliced of from the input argument, which we should never do.
  // @see https://github.com/flekschas/regl-scatterplot/issues/197
  expect(pointsToBeFiltered.length).toBe(5);

  scatterplot.destroy();
});

test('`filter() point order consistency`', async () => {
  const scatterplot = createScatterplot({
  canvas: createCanvas(50, 50),
    width: 50,
    height: 50,
    pointColor: ['#FF0000', '#00FF00', '#0000FF'],
    pointSize: 50,
    opacity: 1,
    colorBy: "valueA"
  });

  const dpr = window.devicePixelRatio;
  const middlePixel = (50 * dpr * 25 * dpr + 25 * dpr) * 4;

  await scatterplot.draw({
    x: [0, 0, 0],
    y: [0, 0, 0],
    valueA: [0, 1, 2]
  });

  await wait(25);

  let image = scatterplot.export();

  // the center pixel should be blue
  expect(
    Array.from(image.data.slice(middlePixel, middlePixel + 4))
  ).toEqual([0, 0, 255, 255]);

  await scatterplot.filter([1, 0]);

  await wait(25);

  image = scatterplot.export();

  // the center pixel should be green
  expect(
    Array.from(image.data.slice(middlePixel, middlePixel + 4))
  ).toEqual([0, 255, 0, 255]);

  await scatterplot.unfilter();
  await scatterplot.filter([0, 1]);

  await wait(25);

  image = scatterplot.export();

  // the center pixel should still be green
  expect(
    Array.from(image.data.slice(middlePixel, middlePixel + 4))
  ).toEqual([0, 255, 0, 255]);
});

test('test hover, select, and filter options of `draw()`', async () => {
  const scatterplot = createScatterplot({
    canvas: createCanvas(200, 200),
    width: 200,
    height: 200,
  });

  const points = [
    [0, 0],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];

  await scatterplot.draw(points, {
    hover: 0,
    select: [1, 2],
    filter: [0, 2, 3],
  });

  await wait(50);

  expect(scatterplot.get('hoveredPoint')).toBe(0);
  expect(scatterplot.get('selectedPoints')).toEqual([2]);
  expect(
    hasSameElements(scatterplot.get('filteredPoints'), [0, 2, 3])
  ).toBe(true);

  scatterplot.destroy();
});

test('zooming with transition', async () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });
  const camera = scatterplot.get('camera');

  let numDrawCalls = 0;
  let numTransitionStartCalls = 0;
  let numTransitionEndCalls = 0;

  scatterplot.subscribe('draw', () => numDrawCalls++);
  scatterplot.subscribe('transitionStart', () => numTransitionStartCalls++);
  scatterplot.subscribe('transitionEnd', () => numTransitionEndCalls++);

  await scatterplot.draw([
    [-1, 1],
    [1, 1],
    [0, 0],
    [-1, -1],
    [1, -1],
  ]);

  expect(numDrawCalls).toBe(1);

  const t0 = performance.now();
  const transitionDuration = 50;

  await scatterplot.zoomToPoints([1, 2], {
    transition: true,
    transitionDuration,
  });

  expect(numTransitionStartCalls).toBe(1);
  expect(numTransitionEndCalls).toBe(1);
  expect(performance.now() - t0).toBeGreaterThanOrEqual(transitionDuration);
  expect(camera.target[0] - 0.5).toBeLessThanOrEqual(1e-8);
  expect(camera.target[1] - 0.5).toBeLessThanOrEqual(1e-8);

  await scatterplot.zoomToOrigin({ transition: true, transitionDuration });

  expect(numTransitionStartCalls).toBe(2);
  expect(numTransitionEndCalls).toBe(2);
  expect(camera.target[0]).toBeLessThanOrEqual(1e-8);
  expect(camera.target[1]).toBeLessThanOrEqual(1e-8);

  await scatterplot.zoomToLocation([-0.5, -0.5], 0.1, {
    transition: true,
    transitionDuration,
  });

  expect(numTransitionStartCalls).toBe(3);
  expect(numTransitionEndCalls).toBe(3);
  expect(camera.target[0] + 0.1).toBeLessThanOrEqual(1e-8);
  expect(camera.target[1] + 0.1).toBeLessThanOrEqual(1e-8);
  expect(camera.distance[0] - 0.1).toBeLessThanOrEqual(1e-8);

  await scatterplot.zoomToArea(
    { x: 0, y: -1, width: 1, height: 1 },
    { transition: true, transitionDuration }
  );

  expect(numTransitionStartCalls).toBe(4);
  expect(numTransitionEndCalls).toBe(4);
  expect(camera.target[0] - 0.5).toBeLessThanOrEqual(1e-8);
  expect(camera.target[1] + 0.5).toBeLessThanOrEqual(1e-8);

  scatterplot.destroy();
});

test('zoomToPoints() before point were drawn should fail', async () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });
  try {
    await scatterplot.zoomToPoints([1, 2]);
    assert.fail('zoomToPoints() should have thrown an error');
  } catch (e) {
    expect(e.message).toBe(ERROR_POINTS_NOT_DRAWN);
  }
  scatterplot.destroy();
});

test('zoomToArea() with non-standard aspect ratio', async () => {
  const dims = [
    [200, 200],
    [200, 100],
    [100, 200],
    [333, 123],
  ];
  const aspectRatios = [1, 2, 0.3, 5 / 3];

  const xStart = -8 / 6;
  const xWidth = 5 + 8 / 6;
  const yStart = -1 / 3;
  const yWidth = 2 / 3;

  const points = {
    x: Array.from({ length: 500 }, (_, i) => xStart + (i / 499) * xWidth),
    y: Array.from({ length: 500 }, (_, i) => yStart + (i / 499) * yWidth),
  };

  const rect = {
    x: xStart - EPS,
    width: xWidth + EPS * 2,
    y: yStart - EPS,
    height: yWidth + EPS * 2,
  };

  for (const [width, height] of dims) {
    for (const aspectRatio of aspectRatios) {
      const scatterplot = createScatterplot({
        canvas: createCanvas(width, height),
        aspectRatio,
      });

      // eslint-disable-next-line no-await-in-loop
      await scatterplot.draw(points);
      // eslint-disable-next-line no-await-in-loop
      await scatterplot.zoomToArea(rect);

      expect(
        scatterplot.get('pointsInView').length
      ).toBe(500);
      expect(Math.abs(scatterplot.getScreenPosition(0)[0])).toBeLessThan(0.01);
      expect(
        Math.abs(scatterplot.getScreenPosition(499)[0] - width)
      ).toBeLessThan(0.01);

      scatterplot.destroy();
    }
  }
});

test('getScreenPosition()', async () => {
  const scatterplot = createScatterplot({
    canvas: createCanvas(100, 100),
    width: 100,
    height: 100,
  });

  try {
    scatterplot.getScreenPosition(0);
    assert.fail('getScreenPosition() should have thrown an error');
  } catch (e) {
    expect(e.message).toBe(ERROR_POINTS_NOT_DRAWN);
  }

  await scatterplot.draw([
    [-1, -1],
    [0, 0],
    [1, 1],
  ]);

  expect(scatterplot.getScreenPosition(0)).toEqual([0, 100]);
  expect(scatterplot.getScreenPosition(1)).toEqual([50, 50]);
  expect(scatterplot.getScreenPosition(2)).toEqual([100, 0]);

  // A forth point does not exist as we only drew three
  expect(scatterplot.getScreenPosition(3)).toBeUndefined();

  await scatterplot.zoomToPoints([0]);
  expect(scatterplot.getScreenPosition(0)).toEqual([50, 50]);

  scatterplot.destroy();
});

test('isSupported', () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });
  const renderer = scatterplot.get('renderer');

  expect(
    Object.prototype.hasOwnProperty.call(scatterplot, 'isSupported')
  ).toBe(true);

  expect(
    Object.prototype.hasOwnProperty.call(renderer, 'isSupported')
  ).toBe(true);

  expect(
    scatterplot.isSupported === true || scatterplot.isSupported === false
  ).toBe(true);

  expect(
    renderer.isSupported === true || renderer.isSupported === false
  ).toBe(true);

  scatterplot.destroy();
});

test('test "drawing" event', async () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  let numDrawCalls = 0;
  let numDrawingCalls = 0;

  scatterplot.subscribe('draw', () => ++numDrawCalls);
  scatterplot.subscribe('drawing', () => ++numDrawingCalls);

  await new Promise((resolve) => {
    scatterplot.subscribe('init', resolve);
  });

  const isDrawn = scatterplot.draw([[-1, 1]]);
  await nextAnimationFrame();

  expect(numDrawCalls).toBe(0);
  expect(numDrawingCalls).toBe(1);

  await isDrawn;

  expect(numDrawCalls).toBe(1);

  scatterplot.destroy();
});

test('spatial index', async () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const x = [-1, 1, 0, -1, 1];
  const y = [1, 1, 0, -1, -1];
  const z1 = [0.2, 0.4, 0.6, 0.8, 1];
  const z2 = [1, 0.8, 0.6, 0.4, 0.2];

  await scatterplot.draw({ x, y, z: z1 });

  await scatterplot.zoomToArea(
    {
      x: -EPS,
      y: -EPS,
      width: 1 + 2 * EPS,
      height: 1 + 2 * EPS,
    },
    { log: true }
  );

  expect(scatterplot.get('pointsInView')).toEqual([1, 2]);

  const spatialIndex = scatterplot.get('spatialIndex');

  // Because `x` and `y` remain unchanged, we can reuse the spatial index
  // from the previous draw call.
  await scatterplot.draw({ x, y, z: z2 }, { spatialIndex });

  await scatterplot.zoomToArea({
    x: -1 - EPS,
    y: -1 - EPS,
    width: 1 + 2 * EPS,
    height: 1 + 2 * EPS,
  });

  // The reused spatial index should work as before
  expect(scatterplot.get('pointsInView')).toEqual([2, 3]);

  scatterplot.destroy();
});

test('drawAnnotations()', async () => {
  const scatterplot = createScatterplot({
    canvas: createCanvas(100, 100),
    width: 100,
    height: 100,
  });

  await scatterplot.drawAnnotations([
    { x: 0.9, lineColor: [1, 1, 1, 0.1], lineWidth: 1 },
    { y: 0.9, lineColor: [1, 1, 1, 0.1], lineWidth: 1 },
    {
      x1: -0.8,
      y1: -0.8,
      x2: -0.6,
      y2: -0.6,
      lineColor: [1, 1, 1, 0.25],
      lineWidth: 1,
    },
    {
      x: -0.8,
      y: 0.6,
      width: 0.2,
      height: 0.2,
      lineColor: [1, 1, 1, 0.25],
      lineWidth: 1,
    },
    {
      vertices: [
        [0.6, 0.8],
        [0.8, 0.8],
        [0.8, 0.6],
        [0.6, 0.6],
        [0.6, 0.8],
      ],
      lineColor: '#D55E00',
      lineWidth: 2,
    },
  ]);

  let img = scatterplot.export();
  let w = img.width;
  let h = img.height;
  const wp = w * 0.1;
  const hp = w * 0.1;

  expect(getPixelSum(img, 0, w, 0, hp)).toBeGreaterThan(0);
  expect(getPixelSum(img, w - wp, w, 0, h)).toBeGreaterThan(0);
  expect(getPixelSum(img, wp, 2 * wp, h - hp * 2, h - hp)).toBeGreaterThan(0);
  expect(getPixelSum(img, wp, 2 * wp, hp, 2 * hp)).toBeGreaterThan(0);
  expect(getPixelSum(img, wp - 2 * wp, w - wp, hp, 2 * hp)).toBeGreaterThan(0);

  await scatterplot.clearAnnotations();

  img = scatterplot.export();
  w = img.width;
  h = img.height;
  expect(getPixelSum(img, 0, w, 0, h)).toBe(0);

  scatterplot.destroy();
});

test('pointScaleMode', async () => {
  const dim = 100;
  const scatterplot = createScatterplot({
    canvas: createCanvas(dim, dim),
    width: dim,
    height: dim,
    pointSize: 10,
  });

  expect(scatterplot.get('pointScaleMode')).toBe(DEFAULT_POINT_SCALE_MODE);

  await scatterplot.draw([[0, 0]]);

  const initialImage = scatterplot.export();
  const initialPixelSum = getPixelSum(initialImage, 0, dim, 0, dim);

  expect(initialPixelSum).toBeGreaterThan(0);

  // Zoom in a bit
  await scatterplot.zoomToLocation([0, 0], 0.5);

  const asinhImage = scatterplot.export();
  const asinhPixelSum = getPixelSum(asinhImage, 0, dim, 0, dim);

  expect(asinhPixelSum).toBeGreaterThan(initialPixelSum);

  // Zoom back to the origin
  await scatterplot.zoomToLocation([0, 0], 1);

  scatterplot.set({ pointScaleMode: 'constant' });
  expect(scatterplot.get('pointScaleMode')).toBe('constant');

  // Zoom in a bit
  await scatterplot.zoomToLocation([0, 0], 0.5);

  const constantImage = scatterplot.export();
  const constantPixelSum = getPixelSum(constantImage, 0, dim, 0, dim);

  expect(constantPixelSum).toBe(initialPixelSum);

  // Zoom back to the origin
  await scatterplot.zoomToLocation([0, 0], 1);

  scatterplot.set({ pointScaleMode: 'linear' });
  expect(scatterplot.get('pointScaleMode')).toBe('linear');

  // Zoom in a bit
  await scatterplot.zoomToLocation([0, 0], 0.5);

  const linearImage = scatterplot.export();
  const linearPixelSum = getPixelSum(linearImage, 0, dim, 0, dim);

  expect(linearPixelSum).toBeGreaterThan(asinhPixelSum);

  scatterplot.set({ pointScaleMode: 'nonsense' });
  expect(scatterplot.get('pointScaleMode')).toBe('asinh');

  scatterplot.destroy();
});

test('export()', async () => {
  const dim = 10;
  const scatterplot = createScatterplot({
    canvas: createCanvas(dim, dim),
    width: dim,
    height: dim,
    pointSize: 4,
  });

  await scatterplot.draw([[0.01, 0.01]]);

  const initialImage = scatterplot.export();
  const initialPixelSum = getPixelSum(initialImage, 0, dim, 0, dim);

  expect(initialPixelSum).toBeGreaterThan(0);

  // Export at two scale
  const upscaledImage = await scatterplot.export({ scale: 2 });
  const upscaledPixelSum = getPixelSum(upscaledImage, 0, dim * 2, 0, dim * 2);
  expect(upscaledPixelSum).toBeGreaterThan(initialPixelSum);

  // Align point with pixel grid
  const pixelAlignedImage = await scatterplot.export({ pixelAligned: true });
  expect(pixelAlignedImage.data).not.toEqual(initialImage.data);

  // Increase anti aliasing
  const antiAliasingImage = await scatterplot.export({ antiAliasing: 2 });
  const antiAliasingPixelSum = getPixelSum(antiAliasingImage, 0, dim, 0, dim);

  expect(antiAliasingPixelSum).toBeLessThan(initialPixelSum);
});
