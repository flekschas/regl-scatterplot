import '@babel/polyfill';
import { assert, expect, test } from 'vitest';
import { scaleLinear } from 'd3-scale';
import { mat4 } from 'gl-matrix';
import { nextAnimationFrame } from '@flekschas/utils';

import createScatterplot from '../src';

import {
  DEFAULT_LASSO_MIN_DELAY,
  DEFAULT_LASSO_MIN_DIST,
  KEY_ACTION_LASSO,
  KEY_ACTION_ROTATE,
  SINGLE_CLICK_DELAY,
  CONTINUOUS,
  CATEGORICAL,
} from '../src/constants';

import {
  asyncForEach,
  createCanvas,
  createMouseEvent,
  createKeyboardEvent,
  wait,
  capitalize,
} from './utils';

test('init and destroy events', async () => {
  const canvas = createCanvas(200, 200);
  const scatterplot = createScatterplot({
    canvas,
    width: 200,
    height: 200,
  });

  const whenInit = new Promise((resolve) => {
    scatterplot.subscribe('init', () => resolve(true), 1);
  });
  const whenDestroy = new Promise((resolve) => {
    scatterplot.subscribe('destroy', () => resolve(true), 1);
  });

  await expect(whenInit).resolves.toBe(true);

  scatterplot.destroy();

  await expect(whenDestroy).resolves.toBe(true);
});

test('throw an error when calling draw() after destroy()', async () => {
  const canvas = createCanvas(200, 200);
  const scatterplot = createScatterplot({
    canvas,
    width: 200,
    height: 200,
  });

  await scatterplot.draw([[0, 0]]);

  scatterplot.destroy();

  try {
    await scatterplot.draw([[0, 0]]);
    assert.fail(
      'should have thrown an error because the scatterplot instance is destroyed'
    );
  } catch (e) {
    expect(e.message).toBe('The instance was already destroyed');
  }
});

test('test that `isPointsDrawn` is set correctly', async () => {
  const canvas = createCanvas(200, 200);
  const scatterplot = createScatterplot({
    canvas,
    width: 200,
    height: 200,
  });

  expect(scatterplot.get('isPointsDrawn')).toBe(false);
  expect(scatterplot.get('isDestroyed')).toBe(false);

  await scatterplot.draw([[0, 0]]);

  expect(scatterplot.get('isPointsDrawn')).toBe(true);

  scatterplot.destroy();

  expect(scatterplot.get('isDestroyed')).toBe(true);
  expect(scatterplot.get('isPointsDrawn')).toBe(false);
});

test('do _not_ throw an error when calling draw() _before_ destroy()', async () => {
  const canvas = createCanvas(200, 200);
  const scatterplot = createScatterplot({
    canvas,
    width: 200,
    height: 200,
  });

  let numDraws = 0;
  scatterplot.subscribe('draw', () => ++numDraws);

  scatterplot.draw([[0, 0]]);
  scatterplot.destroy();

  // draw call should have been canceled due to the destroy call
  expect(numDraws).toBe(0);
});

test('test that draw() recognized the correct data type of z and w', async () => {
  const canvas = createCanvas(200, 200);
  const scatterplot = createScatterplot({
    canvas,
    width: 200,
    height: 200,
  });

  await scatterplot.draw([[0, 0]]);

  expect(scatterplot.get('zDataType')).toBe(CATEGORICAL);
  expect(scatterplot.get('wDataType')).toBe(CATEGORICAL);

  await scatterplot.draw([[0, 0, 1, 1]]);

  expect(scatterplot.get('zDataType')).toBe(CATEGORICAL);
  expect(scatterplot.get('wDataType')).toBe(CATEGORICAL);

  await scatterplot.draw([
    [0, 0, 0, 0],
    [0, 0, 1, 1],
  ]);

  expect(scatterplot.get('zDataType')).toBe(CATEGORICAL);
  expect(scatterplot.get('wDataType')).toBe(CATEGORICAL);

  await scatterplot.draw([
    [0, 0, 0, 0],
    [0, 0, 1, 1],
    [0, 0, 10, 10],
  ]);

  expect(scatterplot.get('zDataType')).toBe(CATEGORICAL);
  expect(scatterplot.get('wDataType')).toBe(CATEGORICAL);

  await scatterplot.draw([[0, 0, 0.5, 0.5]]);

  expect(scatterplot.get('zDataType')).toBe(CONTINUOUS);
  expect(scatterplot.get('wDataType')).toBe(CONTINUOUS);

  await scatterplot.draw([
    [0, 0, 0, 0],
    [0, 0, 0.5, 0.5],
    [0, 0, 1, 1],
  ]);

  expect(scatterplot.get('zDataType')).toBe(CONTINUOUS);
  expect(scatterplot.get('wDataType')).toBe(CONTINUOUS);

  await scatterplot.draw(
    [
      [0, 0, 0, 0],
      [0, 0, 1, 1],
    ],
    { zDataType: CONTINUOUS, wDataType: CONTINUOUS }
  );

  expect(scatterplot.get('zDataType')).toBe(CONTINUOUS);
  expect(scatterplot.get('wDataType')).toBe(CONTINUOUS);

  await scatterplot.draw([[0, 0, 0.5, 1]]);

  expect(scatterplot.get('zDataType')).toBe(CONTINUOUS);
  expect(scatterplot.get('wDataType')).toBe(CATEGORICAL);

  await scatterplot.draw([[0, 0, 1, 0.5]]);

  expect(scatterplot.get('zDataType')).toBe(CATEGORICAL);
  expect(scatterplot.get('wDataType')).toBe(CONTINUOUS);

  scatterplot.destroy();
});

test('test drawing point connections via `showLineConnections`', async () => {
  const scatterplot = createScatterplot({
    canvas: createCanvas(200, 200),
    width: 200,
    height: 200,
    showPointConnections: true,
  });

  let numConnectionsDraws = 0;
  scatterplot.subscribe('pointConnectionsDraw', () => {
    ++numConnectionsDraws;
  });

  await scatterplot.draw(
    new Array(10)
      .fill()
      .map((_, i) => [
        -1 + (i / 6) * 2, // x
        -1 + Math.random() * 2, // y
        i, // category
        1, // group
        0, // line group
      ])
  );
  await wait(0);

  expect(numConnectionsDraws).toBe(1);

  await scatterplot.draw(
    new Array(10)
      .fill()
      .map((e, i) => [
        -1 + (i / 6) * 2,
        -1 + Math.random() * 2,
        i,
        1,
        i % 5,
      ])
  );
  await wait(0);

  expect(numConnectionsDraws).toBe(2);

  scatterplot.destroy();
});

test('draw(), clear(), publish("select")', async () => {
  const dim = 200;
  const hdim = dim / 2;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({
    canvas,
    width: dim,
    height: dim,
  });

  const points = [
    [0, 0],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];
  await scatterplot.draw(points);
  // The second draw call should not block the drawing of the points!
  // This test is related to a previous issue caused by `drawRaf` as `withRaf`
  // overwrites previous arguments. While that is normally expected, this
  // should not overwrite the points from above
  await scatterplot.draw();

  let selectedPoints = [];
  const selectHandler = ({ points: newSelectedPoints }) => {
    selectedPoints = [...newSelectedPoints];
  };
  const deselectHandler = () => {
    selectedPoints = [];
  };
  // Event names should be case insensitive. Let's test it
  scatterplot.subscribe('sElEcT', selectHandler);
  scatterplot.subscribe('deselect', deselectHandler);

  // Test single selection via mouse clicks
  canvas.dispatchEvent(
    createMouseEvent('mousedown', hdim, hdim, { buttons: 1 })
  );
  canvas.dispatchEvent(createMouseEvent('click', hdim, hdim));

  await wait(0);

  expect(selectedPoints.length).toBe(1);
  expect(selectedPoints[0]).toBe(0);

  // Test deselection
  canvas.dispatchEvent(createMouseEvent('dblclick', hdim, hdim));

  await wait(0);

  expect(selectedPoints.length).toBe(0);

  // Test that mousedown + mousemove + click is not interpreted as a click when
  // the cursor moved more than `DEFAULT_LASSO_MIN_DIST` in between mousedown and
  // mouseup
  canvas.dispatchEvent(
    createMouseEvent('mousedown', hdim - DEFAULT_LASSO_MIN_DIST, hdim, {
      buttons: 1,
    })
  );
  canvas.dispatchEvent(createMouseEvent('click', hdim, hdim));

  await wait(0);

  expect(selectedPoints.length).toBe(0);

  // Test that clearing the points works. The selection that worked previously
  // should not work anymore
  scatterplot.clear();
  window.dispatchEvent(
    createMouseEvent('mousedown', hdim, hdim, { buttons: 1 })
  );
  canvas.dispatchEvent(createMouseEvent('click', hdim, hdim));

  await wait(0);

  expect(selectedPoints.length).toBe(0);

  scatterplot.destroy();
});

test(
  'lasso selection (with events: select, lassoStart, lassoExtend, and lassoEnd)',
  async () => {
    const dim = 200;
    const hdim = dim / 2;
    const canvas = createCanvas(dim, dim);
    const scatterplot = createScatterplot({
      canvas,
      width: dim,
      height: dim,
    });

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

    let lassoStartCount = 0;
    let lassoExtendCount = 0;
    let lassoEndCount = 0;
    let lassoEndCoordinates = [];
    scatterplot.subscribe('lassoStart', () => ++lassoStartCount);
    scatterplot.subscribe('lassoExtend', () => ++lassoExtendCount);
    scatterplot.subscribe('lassoEnd', ({ coordinates }) => {
      ++lassoEndCount;
      lassoEndCoordinates = coordinates;
    });

    const [_, lassoKey] = Object.entries(scatterplot.get('keyMap')).find(
      ([action]) => action === KEY_ACTION_LASSO
    );

    // Test multi selections via mousedown + mousemove
    canvas.dispatchEvent(
      createMouseEvent('mousedown', dim * 1.125, hdim, {
        [`${lassoKey}Key`]: true,
        buttons: 1,
      })
    );

    // Needed to first digest the mousedown event
    await wait(0);

    const mousePositions = [
      [dim * 1.125, hdim],
      [hdim, -dim * 0.125],
      [-dim * 0.125, -dim * 0.125],
      [-dim * 0.125, dim * 0.125],
      [0, dim * 0.9],
      [dim * 0.1, dim * 0.9],
      [dim * 0.1, dim * 1.125],
      [dim * 1.125, dim * 1.125],
    ];

    await asyncForEach(mousePositions, async (mousePosition) => {
      window.dispatchEvent(createMouseEvent('mousemove', ...mousePosition));
      await wait(DEFAULT_LASSO_MIN_DELAY + 5);
    });

    window.dispatchEvent(createMouseEvent('mouseup'));

    await wait(0);

    expect(selectedPoints.length).toBe(3);
    expect(selectedPoints).toEqual([0, 2, 4]);

    expect(lassoStartCount).toBe(1);
    expect(lassoExtendCount).toBe(mousePositions.length);
    expect(lassoEndCoordinates.length).toBe(mousePositions.length);
    expect(lassoEndCount).toBe(1);

    scatterplot.destroy();
  }
);

test('disable lasso selection', async () => {
  const dim = 200;
  const hdim = dim / 2;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({
    canvas,
    width: dim,
    height: dim,
    keyMap: {},
  });

  await scatterplot.draw([[0, 0]]);

  let selectedPoints = [];
  scatterplot.subscribe('select', ({ points: newSelectedPoints }) => {
    selectedPoints = [...newSelectedPoints];
  });

  let lassoStartCount = 0;
  scatterplot.subscribe('lassoStart', () => ++lassoStartCount);

  expect(Object.entries(scatterplot.get('actionKeyMap')).length).toBe(0);

  // Test multi selections via mousedown + mousemove
  canvas.dispatchEvent(
    createMouseEvent('mousedown', dim * 1.125, hdim, {
      buttons: 1,
      altKey: true,
      ctrlKey: true,
      metaKey: true,
      shiftKey: true,
    })
  );

  // Needed to first digest the mousedown event
  await wait(0);

  const mousePositions = [
    [dim * 1.125, hdim],
    [hdim, -dim * 0.125],
    [-dim * 0.125, -dim * 0.125],
    [-dim * 0.125, dim * 0.125],
    [0, dim * 0.9],
    [dim * 0.1, dim * 0.9],
    [dim * 0.1, dim * 1.125],
    [dim * 1.125, dim * 1.125],
  ];

  await asyncForEach(mousePositions, async (mousePosition) => {
    window.dispatchEvent(createMouseEvent('mousemove', ...mousePosition));
    await wait(DEFAULT_LASSO_MIN_DELAY + 5);
  });

  window.dispatchEvent(createMouseEvent('mouseup'));

  await wait(0);

  expect(lassoStartCount).toBe(0);
  expect(selectedPoints.length).toBe(0);

  scatterplot.destroy();
});

test('test lasso selection via the initiator', async () => {
  const dim = 200;
  const hdim = dim / 2;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({
    canvas,
    width: dim,
    height: dim,
    lassoInitiator: false,
  });

  await scatterplot.draw([
    [0, 0],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ]);

  let selectedPoints = [];
  scatterplot.subscribe('select', ({ points: newSelectedPoints }) => {
    selectedPoints = [...newSelectedPoints];
  });

  const lassoIniatorElement = scatterplot.get('lassoInitiatorElement');

  expect(scatterplot.get('lassoInitiator')).toBe(false);
  expect(lassoIniatorElement.id.startsWith('lasso-initiator')).toBe(true);
  expect(scatterplot.get('lassoInitiatorParentElement')).toBe(document.body);

  canvas.dispatchEvent(createMouseEvent('click', dim * 1.125, hdim));

  // We need to wait for the click delay and some extra milliseconds for
  // the circle to appear
  await wait(SINGLE_CLICK_DELAY + 50);

  lassoIniatorElement.dispatchEvent(
    createMouseEvent('mousedown', dim * 1.125, hdim, { buttons: 1 })
  );
  await wait(0);

  const mousePositions = [
    [dim * 1.125, hdim],
    [hdim, -dim * 0.125],
    [-dim * 0.125, -dim * 0.125],
    [-dim * 0.125, dim * 0.125],
    [0, dim * 0.9],
    [dim * 0.1, dim * 0.9],
    [dim * 0.1, dim * 1.125],
    [dim * 1.125, dim * 1.125],
  ];

  await asyncForEach(mousePositions, async (mousePosition) => {
    window.dispatchEvent(createMouseEvent('mousemove', ...mousePosition));
    await wait(DEFAULT_LASSO_MIN_DELAY + 5);
  });

  window.dispatchEvent(createMouseEvent('mouseup'));

  await wait(0);

  expect(selectedPoints.length).toBe(0);

  scatterplot.set({ lassoInitiator: true });

  await wait(0);

  expect(scatterplot.get('lassoInitiator')).toBe(true);

  canvas.dispatchEvent(
    createMouseEvent('mousedown', dim * 1.125, hdim, { buttons: 1 })
  );
  await wait(0);
  canvas.dispatchEvent(createMouseEvent('click', dim * 1.125, hdim));

  // We need to wait for the click delay and some extra milliseconds for
  // the circle to appear
  await wait(SINGLE_CLICK_DELAY + 50);

  lassoIniatorElement.dispatchEvent(
    createMouseEvent('mousedown', dim * 1.125, hdim, { buttons: 1 })
  );
  await wait(0);

  await asyncForEach(mousePositions, async (mousePosition) => {
    window.dispatchEvent(createMouseEvent('mousemove', ...mousePosition));
    await wait(DEFAULT_LASSO_MIN_DELAY + 5);
  });

  window.dispatchEvent(createMouseEvent('mouseup'));

  await wait(0);

  expect(selectedPoints).toEqual([0, 2, 4]);

  scatterplot.destroy();
});

test('test brush lasso selection', async () => {
  const dim = 200;
  const hdim = dim / 2;
  const qdim = dim / 4;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({
    canvas,
    width: dim,
    height: dim,
    lassoInitiator: true,
    lassoType: 'brush',
  });

  await scatterplot.draw([
    [0, 0],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
    [0, 0.5],
    [0.5, 0],
    [0, -0.5],
    [-0.5, 0],
  ]);

  const lassoIniatorElement = scatterplot.get('lassoInitiatorElement');

  let selectedPoints = [];
  scatterplot.subscribe('select', ({ points: newSelectedPoints }) => {
    selectedPoints = [...newSelectedPoints];
  });

  canvas.dispatchEvent(createMouseEvent('click', qdim, qdim));

  // We need to wait for the click delay and some extra milliseconds for
  // the circle to appear
  await wait(SINGLE_CLICK_DELAY + 50);

  lassoIniatorElement.dispatchEvent(
    createMouseEvent('mousedown', qdim, qdim, { buttons: 1 })
  );
  await wait(0);

  const mousePositions = [
    [qdim, qdim],
    [hdim + qdim, qdim],
    [hdim + qdim, hdim + qdim],
    [qdim, hdim + qdim],
    [qdim, qdim],
  ];

  for (const mousePosition of mousePositions) {
    window.dispatchEvent(createMouseEvent('mousemove', ...mousePosition));
    await wait(DEFAULT_LASSO_MIN_DELAY + 5);
  }

  window.dispatchEvent(createMouseEvent('mouseup'));

  await wait(0);

  expect(selectedPoints).toEqual([5, 6, 7, 8]);

  scatterplot.destroy();
});

test('test rectangle lasso selection', async () => {
  const dim = 200;
  const hdim = dim / 2;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({
    canvas,
    width: dim,
    height: dim,
    lassoInitiator: true,
    lassoType: 'rectangle',
  });

  await scatterplot.draw([
    [0, 0],
    [1, 1],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 1],
  ]);

  const lassoIniatorElement = scatterplot.get('lassoInitiatorElement');

  let selectedPoints = [];
  scatterplot.subscribe('select', ({ points: newSelectedPoints }) => {
    selectedPoints = [...newSelectedPoints];
  });

  canvas.dispatchEvent(createMouseEvent('click', hdim - 10, hdim - 10));

  // We need to wait for the click delay and some extra milliseconds for
  // the circle to appear
  await wait(SINGLE_CLICK_DELAY + 50);

  lassoIniatorElement.dispatchEvent(
    createMouseEvent('mousedown', hdim - 10, hdim - 10, { buttons: 1 })
  );
  await wait(0);

  const mousePositions = [
    [hdim - 10, hdim - 10],
    [dim + 10, dim + 10],
  ];

  for (const mousePosition of mousePositions) {
    window.dispatchEvent(createMouseEvent('mousemove', ...mousePosition));
    await wait(DEFAULT_LASSO_MIN_DELAY + 5);
  }

  window.dispatchEvent(createMouseEvent('mouseup'));

  await wait(0);

  expect(selectedPoints).toEqual([0, 2, 3]);

  scatterplot.destroy();
});

test('test rotation', async () => {
  const dim = 200;
  const hdim = dim / 2;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({
    canvas,
    width: dim,
    height: dim,
    // keyMap: { alt: 'rotate', shift: 'lasso', cmd: 'merge' }
  });

  await scatterplot.draw([[0, 0]]);

  const initialRotation = scatterplot.get('cameraRotation');
  expect(initialRotation).toBe(0);

  let rotation;
  const viewHandler = ({ camera }) => {
    rotation = camera.rotation;
  };
  scatterplot.subscribe('view', viewHandler);

  let [_, rotateKey] = Object.entries(scatterplot.get('actionKeyMap')).find(
    ([action]) => action === KEY_ACTION_ROTATE
  );

  // Test rotation via keydown + mousedown + mousemove + keydown
  window.dispatchEvent(createMouseEvent('mousemove', dim * 0.75, hdim));
  await nextAnimationFrame();
  await wait(0);

  window.dispatchEvent(
    createKeyboardEvent('keydown', capitalize(rotateKey), {
      [`${rotateKey}Key`]: true,
    })
  );
  await wait(0);

  canvas.dispatchEvent(
    createMouseEvent('mousedown', dim * 0.75, hdim, {
      [`${rotateKey}Key`]: true,
      buttons: 1,
    })
  );

  await wait(0);

  const mousePositions = [
    [dim * 0.75, hdim],
    [dim * 0.75, hdim * 0.5],
  ];

  let whenDrawn = new Promise((resolve) => {
    scatterplot.subscribe('draw', resolve, 1);
  });

  await asyncForEach(mousePositions, async (mousePosition) => {
    window.dispatchEvent(createMouseEvent('mousemove', ...mousePosition));
    await wait(DEFAULT_LASSO_MIN_DELAY + 5);
  });

  // We need to ensure that the camera's tick() function was called before
  // we release the mouse via the mouseup event
  await nextAnimationFrame();
  await wait(0);

  window.dispatchEvent(createMouseEvent('mouseup'));
  window.dispatchEvent(
    createKeyboardEvent('keyup', capitalize(rotateKey), {
      [`${rotateKey}Key`]: true,
    })
  );

  await whenDrawn;
  await wait(10);

  expect(initialRotation !== rotation && Number.isFinite(rotation)).toBe(true);

  const lastRotation = rotation;
  const oldRotateKey = rotateKey;

  rotateKey = 'shift';
  scatterplot.set({ keyMap: { [rotateKey]: 'rotate' } });

  // Needed to first digest the keyMap change
  await wait(10);

  // Test rotation via mousedown + mousemove + keydown
  window.dispatchEvent(createMouseEvent('mousemove', dim * 0.75, hdim));
  await nextAnimationFrame();
  await wait(0);

  window.dispatchEvent(
    createKeyboardEvent('keydown', capitalize(oldRotateKey), {
      [`${oldRotateKey}Key`]: true,
    })
  );
  await wait(0);

  canvas.dispatchEvent(
    createMouseEvent('mousedown', dim * 0.75, hdim, {
      [`${oldRotateKey}Key`]: true,
      buttons: 1,
    })
  );

  // Needed to first digest the mousedown event
  await wait(10);

  whenDrawn = new Promise((resolve) => {
    scatterplot.subscribe('draw', resolve, 1);
  });

  await asyncForEach(mousePositions, async (mousePosition) => {
    window.dispatchEvent(createMouseEvent('mousemove', ...mousePosition));
    await wait(DEFAULT_LASSO_MIN_DELAY + 5);
  });

  // We need to ensure that the camera's tick() function was called before
  // we release the mouse via the mouseup event
  await nextAnimationFrame();
  await wait(0);

  window.dispatchEvent(createMouseEvent('mouseup'));
  window.dispatchEvent(
    createKeyboardEvent('keyup', capitalize(oldRotateKey), {
      [`${oldRotateKey}Key`]: true,
    })
  );

  await whenDrawn;
  await wait(10);

  expect(lastRotation).toBe(rotation);

  // Test rotation via mousedown + mousemove + keydown
  window.dispatchEvent(createMouseEvent('mousemove', dim * 0.75, hdim));
  await nextAnimationFrame();
  await wait(0);

  window.dispatchEvent(
    createKeyboardEvent('keydown', capitalize(rotateKey), {
      [`${rotateKey}Key`]: true,
    })
  );
  await wait(0);

  canvas.dispatchEvent(
    createMouseEvent('mousedown', dim * 0.75, hdim, {
      [`${rotateKey}Key`]: true,
      buttons: 1,
    })
  );

  // Needed to first digest the mousedown event
  await wait(10);

  whenDrawn = new Promise((resolve) => {
    scatterplot.subscribe('draw', resolve, 1);
  });

  await asyncForEach(mousePositions, async (mousePosition) => {
    window.dispatchEvent(createMouseEvent('mousemove', ...mousePosition));
    await wait(DEFAULT_LASSO_MIN_DELAY + 5);
  });

  // We need to ensure that the camera's tick() function was called before
  // we release the mouse via the mouseup event
  await nextAnimationFrame();
  await wait(0);

  window.dispatchEvent(createMouseEvent('mouseup'));
  window.dispatchEvent(
    createKeyboardEvent('keyup', capitalize(rotateKey), {
      [`${rotateKey}Key`]: true,
    })
  );

  await whenDrawn;
  await wait(10);

  expect(lastRotation !== rotation).toBe(true);

  scatterplot.destroy();
});

test('point hover with publish("pointover") and publish("pointout")', async () => {
  const dim = 200;
  const hdim = dim / 2;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({
    canvas,
    width: dim,
    height: dim,
  });

  const points = [
    [0, 0],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];
  await scatterplot.draw(points);

  let hoveredPoint = null;
  const pointoverHandler = (point) => {
    hoveredPoint = point;
  };
  const pointoutHandler = () => {
    hoveredPoint = null;
  };
  scatterplot.subscribe('pointover', pointoverHandler);
  scatterplot.subscribe('pointout', pointoutHandler);

  // Test single selection via mouse clicks
  canvas.dispatchEvent(createMouseEvent('mouseenter', hdim, hdim));
  await wait(250);
  window.dispatchEvent(createMouseEvent('mousemove', hdim, hdim));
  await wait(250);

  expect(hoveredPoint).toBe(0);

  // Test deselection
  window.dispatchEvent(createMouseEvent('mousemove', hdim / 2, hdim));

  await wait(0);

  expect(hoveredPoint).toBe(null);

  scatterplot.destroy();
});

test('publish("view")', async () => {
  const dim = 200;
  const hdim = dim / 2;
  const canvas = createCanvas(dim, dim);
  const xScale = scaleLinear().domain([-5, 5]);
  const yScale = scaleLinear().domain([0, 0.5]);

  const scatterplot = createScatterplot({
    canvas,
    width: dim,
    height: dim,
    xScale,
    yScale,
  });
  await scatterplot.draw([[0, 0]]);

  const predictedView = mat4.fromTranslation([], [-1, 0, 0]);

  let currentView;
  let currentCamera;
  const viewHandler = ({ camera, view }) => {
    currentCamera = camera;
    currentView = view;
  };
  scatterplot.subscribe('view', viewHandler);

  window.dispatchEvent(createMouseEvent('mouseup', hdim, hdim));
  window.dispatchEvent(createMouseEvent('mousemove', hdim, hdim));
  await nextAnimationFrame();
  await wait(50);

  canvas.dispatchEvent(
    createMouseEvent('mousedown', hdim, hdim, { buttons: 1 })
  );
  await nextAnimationFrame();
  await wait(50);
  window.dispatchEvent(createMouseEvent('mousemove', 0, hdim));
  await nextAnimationFrame();
  await wait(50);

  expect(Array.from(currentView)).toEqual(predictedView);
  expect(currentCamera).toBeDefined();
  expect(xScale.domain()).toEqual([0, 10]);
  expect(yScale.domain()).toEqual([0, 0.5]);

  scatterplot.destroy();
});
