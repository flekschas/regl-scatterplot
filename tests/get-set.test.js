import '@babel/polyfill';
import { nextAnimationFrame } from '@flekschas/utils';
import { assert, expect, test } from 'vitest';

import { version } from '../package.json';

import createScatterplot, {
  createRegl,
  createRenderer,
  createTextureFromUrl,
} from '../src';

import {
  DEFAULT_LASSO_COLOR,
  DEFAULT_SHOW_RETICLE,
  DEFAULT_RETICLE_COLOR,
  DEFAULT_LASSO_MIN_DELAY,
  DEFAULT_LASSO_MIN_DIST,
  DEFAULT_LASSO_CLEAR_EVENT,
  DEFAULT_POINT_CONNECTION_OPACITY,
  DEFAULT_POINT_CONNECTION_OPACITY_ACTIVE,
  DEFAULT_POINT_CONNECTION_SIZE,
  DEFAULT_POINT_CONNECTION_SIZE_ACTIVE,
  DEFAULT_IMAGE_LOAD_TIMEOUT,
  ERROR_INSTANCE_IS_DESTROYED,
  IMAGE_LOAD_ERROR,
} from '../src/constants';

import {
  createCanvas,
  flatArrayEqual,
} from './utils';

import imageUrl from './assets/image.jpg';

const EPS = 1e-7;

const floatEqual = (a, b) => Math.abs(a - b) <= EPS;

const valueVariants = {
  valueZ: ['category', 'value1', 'valueA', 'valueZ', 'z'],
  valueW: ['value', 'value2', 'valueB', 'valueW', 'w'],
};

test('get("canvas"), get("regl"), and get("version")', () => {
  const canvas = createCanvas();
  const regl = createRegl(canvas);
  const renderer = createRenderer({ regl });
  const scatterplot = createScatterplot({ canvas, renderer });

  expect(scatterplot.get('canvas')).toBe(canvas);
  expect(scatterplot.get('regl')).toBe(regl);
  expect(scatterplot.get('version')).toBe(version);

  scatterplot.destroy();
});

test('set({ width, height })', () => {
  const w1 = 200;
  const h1 = 200;

  const canvas = createCanvas(w1, h1);
  const gl = canvas.getContext('webgl');
  const scatterplot = createScatterplot({ canvas, width: w1, height: h1 });

  expect(gl.drawingBufferWidth).toBe(w1 * window.devicePixelRatio);
  expect(gl.drawingBufferHeight).toBe(h1 * window.devicePixelRatio);

  const w2 = 400;
  const h2 = 300;

  scatterplot.set({ width: w2, height: h2 });

  expect(scatterplot.get('width')).toBe(w2);
  expect(scatterplot.get('height')).toBe(h2);

  expect(gl.drawingBufferWidth).toBe(w2 * window.devicePixelRatio);
  expect(gl.drawingBufferHeight).toBe(h2 * window.devicePixelRatio);

  scatterplot.destroy();
});

test('set({ aspectRatio })', (t) => {
  const canvas = createCanvas(400, 200);
  const scatterplot = createScatterplot({
    canvas,
    width: 400,
    height: 200,
  });

  const aspectRatio = 2;
  scatterplot.set({ aspectRatio });

  expect(scatterplot.get('aspectRatio')).toBe(aspectRatio);

  scatterplot.destroy();
});

test('set({ backgroundColor })', () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const backgroundHex = '#ff0000';
  const backgroundNrgba = [1, 0, 0, 1];
  scatterplot.set({ backgroundColor: backgroundHex });

  expect(
    scatterplot
      .get('backgroundColor')
      .every((v, i) => v === backgroundNrgba[i])
  ).toBe(true);

  scatterplot.destroy();
});

test('set({ backgroundImage })', async ({ skip }) => {
  const canvas = createCanvas();
  const regl = createRegl(canvas);
  const scatterplot = createScatterplot({ canvas, regl });

  try {
    const backgroundImage = await createTextureFromUrl(regl, imageUrl);

    scatterplot.set({ backgroundImage });

    expect(scatterplot.get('backgroundImage')).toBe(backgroundImage);
  } catch (e) {
    if (e.message === IMAGE_LOAD_ERROR) {
      skip(`Failed to load image from URL: ${e.message}`);
    } else {
      assert.fail('Could not create background image from URL');
    }
  }

  try {
    const backgroundImage = await scatterplot.createTextureFromUrl(
      'https://picsum.photos/300/200/'
    );

    scatterplot.set({ backgroundImage });

    expect(scatterplot.get('backgroundImage')).toBe(backgroundImage);

    scatterplot.set({ backgroundImage: null });

    expect(scatterplot.get('backgroundImage')).toBe(null);
  } catch (e) {
    if (e.message === IMAGE_LOAD_ERROR) {
      skip(`Failed to load image from URL: ${e.message}`);
    } else {
      assert.fail('Could not create background image from URL');
    }
  }

  try {
    await new Promise((resolve, reject) => {
      scatterplot.subscribe('backgroundImageReady', resolve, 1);
      scatterplot.set({
        backgroundImage: 'https://picsum.photos/300/200/',
      });
      setTimeout(() => {
        reject(new Error(IMAGE_LOAD_ERROR));
      }, DEFAULT_IMAGE_LOAD_TIMEOUT);
    });

    expect(scatterplot.get('backgroundImage').width).toBe(300);
  } catch (e) {
    if (e.message === IMAGE_LOAD_ERROR) {
      skip(`Failed to load image from URL: ${e.message}`);
    } else {
      assert.fail('Could not create background image from URL');
    }
  }

  // Base64 image
  scatterplot.set({
    backgroundImage:
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4QDeRXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAAA4YwAA6AMAADhjAADoAwAABwAAkAcABAAAADAyMTABkQcABAAAAAECAwCGkgcAFQAAAMAAAAAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAABAAAAADoAQAAQAAABAAAAAAAAAAQVNDSUkAAABQaWNzdW0gSUQ6IDM1AP/bAEMACAYGBwYFCAcHBwkJCAoMFA0MCwsMGRITDxQdGh8eHRocHCAkLicgIiwjHBwoNyksMDE0NDQfJzk9ODI8LjM0Mv/bAEMBCQkJDAsMGA0NGDIhHCEyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/CABEIABAAEAMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAEBf/EABQBAQAAAAAAAAAAAAAAAAAAAAT/2gAMAwEAAhADEAAAAXqhhMj/xAAZEAADAAMAAAAAAAAAAAAAAAABAgMFERP/2gAIAQEAAQUClkNit1EkQol3PT//xAAYEQACAwAAAAAAAAAAAAAAAAABAwACIf/aAAgBAwEBPwFa6jTP/8QAGBEAAgMAAAAAAAAAAAAAAAAAAAIBAyH/2gAIAQIBAT8Be12yD//EABsQAAIDAAMAAAAAAAAAAAAAAAABAhExIzKR/9oACAEBAAY/AuSHhJraOo1Wo//EABkQAAMBAQEAAAAAAAAAAAAAAAABESFBUf/aAAgBAQABPyHK09GZVWkzrMZfGL//2gAMAwEAAgADAAAAEG//xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAgBAwEBPxCsP//EABURAQEAAAAAAAAAAAAAAAAAAABR/9oACAECAQE/EJG//8QAGxABAAMAAwEAAAAAAAAAAAAAAQARITFBcZH/2gAIAQEAAT8QLFXq/H7McnD32o87LUuUMEBVpM48n//Z',
  });

  await new Promise((resolve) => {
    scatterplot.subscribe('backgroundImageReady', resolve, 1);
  });

  expect(scatterplot.get('backgroundImage').width).toBe(16);

  scatterplot.destroy();
});

test('set({ cameraTarget, cameraDistance, cameraRotation, cameraView })', (t) => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const settings = {
    cameraTarget: [1.337, 1.337],
    cameraDistance: 1.337,
    cameraRotation: Math.PI / 1.337,
  };

  const comparators = {
    cameraTarget: (a, b) => flatArrayEqual(a, b, floatEqual),
    cameraDistance: (a, b) => floatEqual(a, b),
    cameraRotation: (a, b) => floatEqual(a, b),
  };

  Object.entries(settings).forEach(([setting, value]) => {
    scatterplot.set({ [setting]: value });

    expect(
      comparators[setting](value, scatterplot.get(setting))
    ).toBe(true);

    scatterplot.set({ [setting]: null });

    expect(
      comparators[setting](value, scatterplot.get(setting))
    ).toBe(true);
  });

  scatterplot.destroy();
});

test('set({ mouseMode })', () => {
  const canvas = createCanvas();

  let scatterplot = createScatterplot({ canvas });
  expect(scatterplot.get('mouseMode')).toBe('panZoom');
  scatterplot.destroy();

  scatterplot = createScatterplot({ canvas, mouseMode: 'panZoom' });
  expect(scatterplot.get('mouseMode')).toBe('panZoom');
  scatterplot.destroy();

  scatterplot = createScatterplot({ canvas, mouseMode: 'lasso' });
  expect(scatterplot.get('mouseMode')).toBe('lasso');
  scatterplot.destroy();

  scatterplot = createScatterplot({ canvas, mouseMode: 'rotate' });
  expect(scatterplot.get('mouseMode')).toBe('rotate');
  scatterplot.destroy();

  scatterplot = createScatterplot({ canvas, mouseMode: 'invalid' });
  expect(scatterplot.get('mouseMode')).toBe('panZoom');

  scatterplot.set({ mouseMode: 'lasso' });
  expect(scatterplot.get('mouseMode')).toBe('lasso');

  scatterplot.set({ mouseMode: 'panZoom' });
  expect(scatterplot.get('mouseMode')).toBe('panZoom');

  scatterplot.set({ mouseMode: 'rotate' });
  expect(scatterplot.get('mouseMode')).toBe('rotate');

  scatterplot.set({ mouseMode: 'invalid' });
  expect(scatterplot.get('mouseMode')).toBe('panZoom');

  scatterplot.destroy();
});

test(
  'set({ colorBy, opacityBy, sizeBy, pointConnectionColorBy, pointConnectionOpacityBy, pointConnectionSizeBy })',
  () => {
    const scatterplot = createScatterplot({ canvas: createCanvas() });

    [
      'colorBy',
      'opacityBy',
      'sizeBy',
      'pointConnectionColorBy',
      'pointConnectionOpacityBy',
      'pointConnectionSizeBy',
    ].forEach((property) => {
      Object.entries(valueVariants).forEach(([value, variants]) => {
        variants.forEach((variant) => {
          scatterplot.set({ [property]: variant });

          expect(scatterplot.get(property)).toBe(value);
        });
      });

      scatterplot.set({ [property]: null });

      expect(scatterplot.get(property)).toBe(null);
    });

    scatterplot.destroy();
  }
);

test(
  'set({ pointColor, pointColorActive, pointColorHover, pointConnectionColor, pointConnectionColorActive, pointConnectionColorHover }) single color',
  () => {
    const canvas = createCanvas();
    const scatterplot = createScatterplot({ canvas });

    const rgbaPointColor = [
      0.22745098039215686, 0.47058823529411764, 0.6666666666666666, 1,
    ];
    const rgbaPointColorActive = [0, 0.5529411764705883, 1, 1];
    const rgbaPointColorHover = [0, 0.5529411764705883, 1, 1];

    // Set a single color
    scatterplot.set({
      pointColor: '#3a78aa',
      pointColorActive: '#008dff',
      pointColorHover: '#008dff',
      pointConnectionColor: 'inherit',
      pointConnectionColorActive: 'inherit',
      pointConnectionColorHover: 'inherit',
    });

    expect(scatterplot.get('pointColor')).toEqual(rgbaPointColor);
    expect(scatterplot.get('pointColorActive')).toEqual(rgbaPointColorActive);
    expect(scatterplot.get('pointColorHover')).toEqual(rgbaPointColorHover);
    expect(scatterplot.get('pointConnectionColor')).toEqual(rgbaPointColor);
    expect(scatterplot.get('pointConnectionColorActive')).toEqual(rgbaPointColorActive);
    expect(scatterplot.get('pointConnectionColorHover')).toEqual(rgbaPointColorHover);

    // Set custom point connection color
    scatterplot.set({
      pointConnectionColor: '#ff0000',
      pointConnectionColorActive: '#00ff00',
      pointConnectionColorHover: '#0000ff',
    });

    expect(scatterplot.get('pointConnectionColor')).toEqual([1, 0, 0, 1]);
    expect(scatterplot.get('pointConnectionColorActive')).toEqual([0, 1, 0, 1]);
    expect(scatterplot.get('pointConnectionColorHover')).toEqual([0, 0, 1, 1]);

    // Set an invalid color, which should default to white
    scatterplot.set({
      pointColor: 'shouldnotwork',
    });

    expect(
      scatterplot.get('pointColor').every((component) => component === 1)
    ).toBe(true);

    scatterplot.destroy();
  }
);

test(
  'set({ pointColor, pointColorActive, pointColorHover }) multiple colors',
  () => {
    const canvas = createCanvas();
    const scatterplot = createScatterplot({ canvas });

    const pointColor = [
      [0, 0.5, 1, 0.5],
      [1, 0.5, 0, 0.5],
    ];
    const pointColorActive = [
      [0.5, 0, 1, 0.5],
      [1, 0, 0.5, 0.5],
    ];
    const pointColorHover = [
      [1, 0.5, 0, 0.5],
      [0, 0.5, 1, 0.5],
    ];

    // Set a single color
    scatterplot.set({
      pointColor,
      pointColorActive,
      pointColorHover,
      pointConnectionColor: 'inherit',
      pointConnectionColorActive: 'inherit',
      pointConnectionColorHover: 'inherit',
    });

    expect(
      scatterplot
        .get('pointColor')
        .every((color, i) => color.every((c, j) => c === pointColor[i][j]))
    ).toBe(true);

    expect(
      scatterplot
        .get('pointColorActive')
        .every((color, i) =>
          color.every((c, j) => c === pointColorActive[i][j])
        )
    ).toBe(true);

    expect(
      scatterplot
        .get('pointColorHover')
        .every((color, i) =>
          color.every((c, j) => c === pointColorHover[i][j])
        )
    ).toBe(true);

    expect(
      scatterplot
        .get('pointConnectionColor')
        .every((color, i) => color.every((c, j) => c === pointColor[i][j]))
    ).toBe(true);

    expect(
      scatterplot
        .get('pointConnectionColorActive')
        .every((color, i) =>
          color.every((c, j) => c === pointColorActive[i][j])
        )
    ).toBe(true);

    expect(
      scatterplot
        .get('pointConnectionColorHover')
        .every((color, i) =>
          color.every((c, j) => c === pointColorHover[i][j])
        )
    ).toBe(true);

    // Add another point color to the existing point colors
    const newPointColors = [...pointColor, [1, 0, 1, 1]];
    scatterplot.set({
      pointColor: newPointColors,
    });

    expect(
      scatterplot
        .get('pointColor')
        .every((color, i) => color.every((c, j) => c === newPointColors[i][j]))
    ).toBe(true);

    scatterplot.set({
      pointConnectionColor: ['#ff0000', '#ff00ff'],
      pointConnectionColorActive: ['#ffff00', '#0000ff'],
      pointConnectionColorHover: ['#000000', '#ffffff'],
    });

    expect(scatterplot.get('pointConnectionColor')).toEqual([
        [1, 0, 0, 1],
        [1, 0, 1, 1],
      ],
    );

    expect(scatterplot.get('pointConnectionColorActive')).toEqual([
      [1, 1, 0, 1],
      [0, 0, 1, 1],
    ]);

    expect(scatterplot.get('pointConnectionColorHover')).toEqual([
      [0, 0, 0, 1],
      [1, 1, 1, 1],
    ]);

    scatterplot.destroy();
  }
);

test(
  'set({ opacity, pointConnectionOpacity, pointConnectionOpacityActive })',
  () => {
    const scatterplot = createScatterplot({ canvas: createCanvas() });

    let opacity = 0.5;

    scatterplot.set({ opacity });

    expect(scatterplot.get('opacity')).toBe(opacity);

    expect(scatterplot.get('pointConnectionOpacity')).toBe(
      DEFAULT_POINT_CONNECTION_OPACITY
    );

    expect(scatterplot.get('pointConnectionOpacityActive')).toBe(
      DEFAULT_POINT_CONNECTION_OPACITY_ACTIVE,
    );

    scatterplot.set({
      opacity: 0,
      pointConnectionOpacity: opacity,
      pointConnectionOpacityActive: opacity,
    });

    expect(scatterplot.get('opacity')).toBe(opacity);
    expect(scatterplot.get('pointConnectionOpacity')).toBe(opacity);
    expect(scatterplot.get('pointConnectionOpacityActive')).toBe(opacity);

    opacity = [0.5, 0.75, 1];

    scatterplot.set({
      opacity,
      pointConnectionOpacity: opacity,
      pointConnectionOpacityActive: opacity,
    });

    expect(scatterplot.get('opacity')).toEqual(opacity);
    expect(scatterplot.get('pointConnectionOpacity')).toEqual(opacity);
    expect(scatterplot.get('pointConnectionOpacityActive')).toEqual(0.5);

    scatterplot.destroy();
  }
);

test(
  'set({ lassoColor, lassoMinDist, lassoMinDelay, lassoClearEvent })',
  () => {
    const scatterplot = createScatterplot({ canvas: createCanvas() });

    // Check default lasso color, min distance, and min delay
    expect(scatterplot.get('lassoColor')).toEqual(DEFAULT_LASSO_COLOR);
    expect(scatterplot.get('lassoMinDist')).toEqual(DEFAULT_LASSO_MIN_DIST);
    expect(scatterplot.get('lassoMinDelay')).toEqual(DEFAULT_LASSO_MIN_DELAY);
    expect(scatterplot.get('lassoClearEvent')).toEqual(DEFAULT_LASSO_CLEAR_EVENT);

    const lassoColor = [1, 0, 0, 1];
    const lassoMinDist = 10;
    const lassoMinDelay = 150;
    const lassoClearEvent = 'deselect';

    scatterplot.set({
      lassoColor,
      lassoMinDist,
      lassoMinDelay,
      lassoClearEvent,
    });

    expect(scatterplot.get('lassoColor')).toEqual(lassoColor);
    expect(scatterplot.get('lassoMinDist')).toEqual(lassoMinDist);
    expect(scatterplot.get('lassoMinDelay')).toEqual(lassoMinDelay);
    expect(scatterplot.get('lassoClearEvent')).toEqual(lassoClearEvent);

    scatterplot.set({
      lassoColor: null,
      lassoMinDist: null,
      lassoMinDelay: null,
      lassoClearEvent: null,
    });

    expect(scatterplot.get('lassoColor')).toEqual(lassoColor);
    expect(scatterplot.get('lassoMinDist')).toEqual(lassoMinDist);
    expect(scatterplot.get('lassoMinDelay')).toEqual(lassoMinDelay);
    expect(scatterplot.get('lassoClearEvent')).toEqual(lassoClearEvent);

    scatterplot.destroy();
  }
);

test(
  'set({ pointOutlineWidth })',
  () => {
    const scatterplot = createScatterplot({ canvas: createCanvas() });

    const pointOutlineWidth = 42;

    scatterplot.set({ pointOutlineWidth });

    expect(scatterplot.get('pointOutlineWidth')).toEqual(pointOutlineWidth);

    scatterplot.set({ pointOutlineWidth: 0 });

    expect(scatterplot.get('pointOutlineWidth')).toEqual(pointOutlineWidth);

    scatterplot.destroy();
  }
);

test(
  'set({ pointSize, pointConnectionSize, pointConnectionSizeActive })',
  () => {
    const scatterplot = createScatterplot({ canvas: createCanvas() });

    const pointSize = 42;

    scatterplot.set({ pointSize });

    expect(scatterplot.get('pointSize')).toEqual(pointSize);
    expect(scatterplot.get('pointConnectionSize')).toEqual(
      DEFAULT_POINT_CONNECTION_SIZE
    );
    expect(scatterplot.get('pointConnectionSizeActive')).toEqual(
      DEFAULT_POINT_CONNECTION_SIZE_ACTIVE
    );

    scatterplot.set({
      pointSize: 0,
      pointConnectionSize: pointSize,
      pointConnectionSizeActive: pointSize,
    });

    expect(scatterplot.get('pointSize')).toEqual(pointSize);
    expect(scatterplot.get('pointConnectionSize')).toEqual(pointSize);
    expect(scatterplot.get('pointConnectionSizeActive')).toEqual(pointSize);

    scatterplot.set({
      pointSize: [2, 4, 6],
      pointConnectionSize: [2, 4, 6],
      pointConnectionSizeActive: [2, 4, 6],
    });

    expect(scatterplot.get('pointSize')).toEqual([2, 4, 6]);
    expect(scatterplot.get('pointConnectionSize')).toEqual([2, 4, 6]);
    expect(scatterplot.get('pointConnectionSizeActive')).toBe(pointSize);

    scatterplot.destroy();
  }
);

test(
  'set({ pointSizeSelected })',
  () => {
    const scatterplot = createScatterplot({ canvas: createCanvas() });

    const pointSizeSelected = 42;

    scatterplot.set({ pointSizeSelected });

    expect(scatterplot.get('pointSizeSelected')).toEqual(pointSizeSelected);

    scatterplot.set({ pointSizeSelected: 0 });

    expect(scatterplot.get('pointSizeSelected')).toEqual(pointSizeSelected);

    scatterplot.destroy();
  }
);

test(
  'set({ showReticle, reticleColor })',
  () => {
    const scatterplot = createScatterplot({ canvas: createCanvas() });

    expect(scatterplot.get('showReticle')).toEqual(DEFAULT_SHOW_RETICLE);
    expect(scatterplot.get('reticleColor')).toEqual(DEFAULT_RETICLE_COLOR);

    const showReticle = !DEFAULT_SHOW_RETICLE;
    const reticleColor = [1, 0, 0, 0.5];

    scatterplot.set({ showReticle, reticleColor });

    expect(scatterplot.get('showReticle')).toEqual(showReticle);
    expect(scatterplot.get('reticleColor')).toEqual(reticleColor);

    scatterplot.set({ showReticle: null });

    expect(scatterplot.get('showReticle')).toEqual(showReticle);

    scatterplot.set({ reticleColor: null });

    expect(scatterplot.get('reticleColor')).toEqual(reticleColor);

    scatterplot.destroy();
  }
);

test('set({ cameraIsFixed })', async () => {
  const canvas = createCanvas();
  const scatterplot = createScatterplot({ canvas });

  await scatterplot.draw([
    [-1, 1],
    [1, 1],
    [0, 0],
    [-1, -1],
    [1, -1],
  ]);

  canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }));

  await nextAnimationFrame();

  // We expect the distance to be less than one because we zoomed into the plot
  // via wheeling
  expect(scatterplot.get('camera').distance[0]).toBeLessThan(1);

  await scatterplot.zoomToOrigin();

  expect(scatterplot.get('camera').distance[0]).toBe(1);

  scatterplot.set({ cameraIsFixed: true });
  expect(scatterplot.get('cameraIsFixed')).toBe(true);

  // Adding this here to triple check that the programmatic zoom does not unset
  // the camera fixed state
  await scatterplot.zoomToOrigin();

  canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }));

  await nextAnimationFrame();

  // We expect the distance to be one because we fixed the camera
  expect(scatterplot.get('camera').distance[0]).toBe(1);

  scatterplot.set({ cameraIsFixed: false });
  expect(scatterplot.get('cameraIsFixed')).toBe(false);

  canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }));

  await nextAnimationFrame();

  // We expect the distance to be less than one because we unfixed the camera
  expect(scatterplot.get('camera').distance[0]).toBeLessThan(1);

  await scatterplot.zoomToOrigin();
  expect(scatterplot.get('camera').distance[0]).toBe(1);

  scatterplot.set({ cameraIsFixed: true });
  await scatterplot.zoomToPoints([2]);

  // Even though the camera is fixed, programmatic zooming still works. Only
  // mouse wheel interactions are prevented
  expect(scatterplot.get('cameraIsFixed')).toBe(true);
  expect(scatterplot.get('camera').distance[0]).toBeLessThan(1);

  scatterplot.destroy();
});

test('get("isDestroyed")', async () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  expect(scatterplot.get('isDestroyed')).toBe(false);

  scatterplot.destroy();

  expect(scatterplot.get('isDestroyed')).toBe(true);
});

test('get("isDrawing")', async () => {
  const canvas = createCanvas();
  const scatterplot = createScatterplot({ canvas });

  expect(scatterplot.get('isDrawing')).toBe(false);

  const whenDrawn = scatterplot.draw([
    [-1, 1],
    [1, 1],
    [0, 0],
    [-1, -1],
    [1, -1],
  ]);

  expect(scatterplot.get('isDrawing')).toBe(true);

  await expect(whenDrawn).resolves.toBe(undefined);

  expect(scatterplot.get('isDrawing')).toBe(false);

  scatterplot.destroy();
});

test('set() after destroy', async () => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  scatterplot.destroy();

  const whenSet = scatterplot.set({ mouseMode: 'lasso' });

  await expect(whenSet).rejects.toThrow(ERROR_INSTANCE_IS_DESTROYED);
});

test('get() and set() performance properties', async () => {
  const scatterplotA = createScatterplot({ canvas: createCanvas() });

  expect(scatterplotA.get('performanceMode')).toBe(false);
  expect(scatterplotA.get('renderPointsAsSquares')).toBe(false);
  expect(scatterplotA.get('disableAlphaBlending')).toBe(false);

  scatterplotA.set({
    'performanceMode': true,
    'renderPointsAsSquares': true,
    'disableAlphaBlending': true,
  });

  expect(scatterplotA.get('performanceMode')).toBe(false);
  expect(scatterplotA.get('renderPointsAsSquares')).toBe(false);
  expect(scatterplotA.get('disableAlphaBlending')).toBe(false);

  scatterplotA.destroy();

  const scatterplotB = createScatterplot({
    canvas: createCanvas(),
    performanceMode: true,
  });

  expect(scatterplotB.get('performanceMode')).toBe(true);
  expect(scatterplotB.get('renderPointsAsSquares')).toBe(true);
  expect(scatterplotB.get('disableAlphaBlending')).toBe(true);

  scatterplotB.destroy();

  const scatterplotC = createScatterplot({
    canvas: createCanvas(),
    renderPointsAsSquares: true,
  });

  expect(scatterplotC.get('performanceMode')).toBe(false);
  expect(scatterplotC.get('renderPointsAsSquares')).toBe(true);
  expect(scatterplotC.get('disableAlphaBlending')).toBe(false);

  scatterplotC.destroy();

  const scatterplotD = createScatterplot({
    canvas: createCanvas(),
    disableAlphaBlending: true,
  });

  expect(scatterplotD.get('performanceMode')).toBe(false);
  expect(scatterplotD.get('renderPointsAsSquares')).toBe(false);
  expect(scatterplotD.get('disableAlphaBlending')).toBe(true);

  scatterplotD.destroy();
});

test('get() and set() lasso types', async () => {
  const scatterplot = createScatterplot({
    canvas: createCanvas(),
    lassoType: 'rectangle',
    lassoBrushSize: 32,
  });

  expect(scatterplot.get('lassoType')).toBe('rectangle');
  expect(scatterplot.get('lassoBrushSize')).toBe(32);

  scatterplot.set({ lassoType: 'brush', lassoBrushSize: 18 });

  expect(scatterplot.get('lassoType')).toBe('brush');
  expect(scatterplot.get('lassoBrushSize')).toBe(18);

  scatterplot.set({ lassoType: 'freeform' });

  expect(scatterplot.get('lassoType')).toBe('freeform');

  scatterplot.set({ lassoType: 'rectangle' });

  expect(scatterplot.get('lassoType')).toBe('rectangle');

  scatterplot.set({ lassoType: 'invalid' });

  expect(scatterplot.get('lassoType')).toBe('freeform');
});
