/* eslint no-console: 1, no-undef: 1, no-unused-vars: 1 */

import '@babel/polyfill';
import { test } from 'zora';
import { scaleLinear } from 'd3-scale';
import { mat4 } from 'gl-matrix';
import { isFunction, nextAnimationFrame } from '@flekschas/utils';

import { version } from '../package.json';

import createScatterplot, {
  createRegl,
  createRenderer,
  createSpatialIndex,
  createTextureFromUrl,
  checkSupport,
} from '../src';

import {
  DEFAULT_COLOR_NORMAL,
  DEFAULT_COLOR_ACTIVE,
  DEFAULT_COLOR_HOVER,
  DEFAULT_COLOR_BG,
  DEFAULT_HEIGHT,
  DEFAULT_LASSO_COLOR,
  DEFAULT_SHOW_RETICLE,
  DEFAULT_RETICLE_COLOR,
  DEFAULT_POINT_OUTLINE_WIDTH,
  DEFAULT_POINT_SIZE,
  DEFAULT_POINT_SIZE_SELECTED,
  DEFAULT_OPACITY_INACTIVE_MAX,
  DEFAULT_OPACITY_INACTIVE_SCALE,
  DEFAULT_WIDTH,
  DEFAULT_LASSO_MIN_DELAY,
  DEFAULT_LASSO_MIN_DIST,
  DEFAULT_LASSO_CLEAR_EVENT,
  DEFAULT_POINT_CONNECTION_OPACITY,
  DEFAULT_POINT_CONNECTION_OPACITY_ACTIVE,
  DEFAULT_POINT_CONNECTION_SIZE,
  DEFAULT_POINT_CONNECTION_SIZE_ACTIVE,
  DEFAULT_GAMMA,
  KEY_ACTION_LASSO,
  KEY_ACTION_ROTATE,
  SINGLE_CLICK_DELAY,
  DEFAULT_OPACITY,
  DEFAULT_IMAGE_LOAD_TIMEOUT,
  IMAGE_LOAD_ERROR,
  ERROR_POINTS_NOT_DRAWN,
  CONTINUOUS,
  CATEGORICAL,
} from '../src/constants';

import { toRgba, isNormFloatArray, isValidBBox } from '../src/utils';

import {
  asyncForEach,
  createCanvas,
  createMouseEvent,
  createKeyboardEvent,
  flatArrayEqual,
  wait,
  capitalize,
  catchError,
  isSameElements,
  getPixelSum,
} from './utils';

const EPS = 1e-7;

const floatEqual = (a, b) => Math.abs(a - b) <= EPS;

const valueVariants = {
  valueZ: ['category', 'value1', 'valueA', 'valueZ', 'z'],
  valueW: ['value', 'value2', 'valueB', 'valueW', 'w'],
};

/* ------------------------------ constructors ------------------------------ */

test('constructors', async (t2) => {
  await t2.test(
    'createRegl()',
    catchError((t) => {
      const dim = 200;
      const canvas = createCanvas(dim, dim);
      const gl = canvas.getContext('webgl');

      t.equal(gl.drawingBufferWidth, dim, `width should be ${dim}px`);
      t.equal(gl.drawingBufferHeight, dim, `height should be ${dim}px`);

      const regl = createRegl(canvas);

      t.ok(!!regl, 'regl should be instanciated');

      regl.destroy();
    })
  );

  await t2.test(
    'createScatterplot()',
    catchError((t) => {
      const canvas = createCanvas(null, null);
      const scatterplot = createScatterplot({ canvas });

      t.equal(scatterplot.get('canvas'), canvas, 'canvas object should equal');
      t.equal(
        scatterplot.get('backgroundColor'),
        DEFAULT_COLOR_BG,
        'scatterplot should have a default backgroundColor'
      );
      t.equal(
        scatterplot.get('pointColor'),
        DEFAULT_COLOR_NORMAL,
        'scatterplot should have a default pointColor'
      );
      t.equal(
        scatterplot.get('pointColorActive'),
        DEFAULT_COLOR_ACTIVE,
        'scatterplot should have a default pointColorActive'
      );
      t.equal(
        scatterplot.get('pointColorHover'),
        DEFAULT_COLOR_HOVER,
        'scatterplot should have a default pointColorHover'
      );
      t.equal(
        scatterplot.get('pointSize'),
        DEFAULT_POINT_SIZE,
        'scatterplot should have default point size'
      );
      t.equal(
        scatterplot.get('pointSizeSelected'),
        DEFAULT_POINT_SIZE_SELECTED,
        'scatterplot should have default selected point size'
      );
      t.equal(
        scatterplot.get('pointOutlineWidth'),
        DEFAULT_POINT_OUTLINE_WIDTH,
        'scatterplot should have default point outline width'
      );
      t.equal(
        scatterplot.get('opacity'),
        DEFAULT_OPACITY,
        'scatterplot should have default point opacity'
      );
      t.equal(
        scatterplot.get('opacityInactiveMax'),
        DEFAULT_OPACITY_INACTIVE_MAX,
        'scatterplot should have default inactive point max opacity'
      );
      t.equal(
        scatterplot.get('opacityInactiveScale'),
        DEFAULT_OPACITY_INACTIVE_SCALE,
        'scatterplot should have default inactive point opacity scaling'
      );
      t.equal(
        scatterplot.get('width'),
        DEFAULT_WIDTH,
        'scatterplot should have default width'
      );
      t.equal(
        scatterplot.get('height'),
        DEFAULT_HEIGHT,
        'scatterplot should have default height'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'createScatterplot({ cameraTarget, cameraDistance, cameraRotation, cameraView })',
    catchError((t) => {
      const cameraTarget = [1, 1];
      const cameraDistance = 2;
      const cameraRotation = Math.PI / 4;
      const scatterplot = createScatterplot({
        cameraTarget,
        cameraDistance,
        cameraRotation,
      });

      t.ok(
        flatArrayEqual([1, 1], scatterplot.get('cameraTarget'), floatEqual),
        `The camera target should be ${cameraTarget}`
      );

      t.ok(
        floatEqual(cameraDistance, scatterplot.get('cameraDistance')),
        `The camera distance should be ${cameraDistance}`
      );

      t.ok(
        floatEqual(cameraRotation, scatterplot.get('cameraRotation')),
        `The camera rotation should be ${cameraRotation}`
      );

      // prettier-ignore
      const cameraView = new Float32Array([
      0.5,   0,   0, 0.5,
      0,   0.5,   0, 0.5,
      0,     0, 0.5,   0,
      0,     0,   0,   1,
    ]);
      const scatterplot2 = createScatterplot({ cameraView });

      t.equal(
        cameraView,
        scatterplot2.get('cameraView'),
        `The camera view should be ${cameraView}`
      );

      scatterplot.destroy();
      scatterplot2.destroy();
    })
  );

  await t2.test(
    'createTextureFromUrl()',
    catchError(async (t) => {
      const regl = createRegl(createCanvas());

      try {
        const texture = await createTextureFromUrl(
          regl,
          'https://picsum.photos/300/200/'
        );

        t.equal(
          texture._reglType, // eslint-disable-line no-underscore-dangle
          'texture2d',
          'texture should be a Regl texture object'
        );
      } catch (e) {
        if (e.message === IMAGE_LOAD_ERROR) {
          t.skip('Skipping because image loading timed out');
        } else {
          t.fail('Failed to load image from URL');
        }
      }

      regl.destroy();
    })
  );

  await t2.test(
    'createRenderer()',
    catchError((t) => {
      const canvas = createCanvas();
      const regl = createRegl(canvas);
      const renderer = createRenderer({ canvas, regl });

      t.ok(!!renderer, 'renderer should be instanciated');
      t.equal(renderer.canvas, canvas, 'canvas should be a canvas element');
      t.equal(renderer.regl, regl, 'regl should be a regl instance');
      t.equal(
        renderer.gamma,
        DEFAULT_GAMMA,
        `renderer should have gamma set to ${DEFAULT_GAMMA}`
      );
      t.ok(isFunction(renderer.render), 'renderer should have render function');
      t.ok(
        isFunction(renderer.onFrame),
        'renderer should have onFrame function'
      );
      t.ok(
        isFunction(renderer.refresh),
        'renderer should have refresh function'
      );
      t.ok(
        isFunction(renderer.destroy),
        'renderer should have destroy function'
      );

      const sp1 = createScatterplot({ renderer });
      const sp2 = createScatterplot({ renderer });

      t.equal(sp1.get('renderer'), renderer, 'sp1.renderer should be renderer');
      t.equal(
        sp2.get('renderer'),
        sp1.get('renderer'),
        'sp1.renderer should be the same as sp1.renderer'
      );

      sp1.destroy();
      sp2.destroy();

      // Renderer should have not been destroyed
      t.equal(
        renderer.canvas,
        canvas,
        'canvas should still be a canvas element'
      );
      t.equal(renderer.regl, regl, 'regl should still  be a regl instance');

      const sp3 = createScatterplot({ renderer });
      t.equal(sp3.get('renderer'), renderer, 'sp3.renderer should be renderer');

      renderer.gamma = 10;
      t.equal(renderer.gamma, 10, 'gamma should be 10');

      sp3.destroy();
      renderer.destroy();

      // Now the renderer should have been destroyed
      t.equal(renderer.canvas, undefined, 'canvas should be undefined');
      t.equal(renderer.regl, undefined, 'regl should be undefined');
    })
  );

  await t2.test(
    'createSpatialIndex',
    catchError(async (t) => {
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

      t.equal(
        scatterplot.get('pointsInView'),
        [1, 2],
        'should have points #1 and #2 in the view'
      );

      await scatterplot.draw(points, { spatialIndex: spatialIndex2 });

      await scatterplot.zoomToArea({ x: -1, y: -1, width: 1, height: 1 });

      t.equal(
        scatterplot.get('pointsInView'),
        [2, 3],
        'should have points #2 and #3 in the view'
      );

      scatterplot.destroy();
    })
  );
});

/* ---------------------------- get() and set() ----------------------------- */

test('get() and set()', async (t2) => {
  await t2.test(
    'get("canvas"), get("regl"), and get("version")',
    catchError(async (t) => {
      const canvas = createCanvas();
      const regl = createRegl(canvas);
      const renderer = createRenderer({ regl });
      const scatterplot = createScatterplot({ canvas, renderer });

      t.equal(
        scatterplot.get('canvas'),
        canvas,
        'canvas should be a canvas element'
      );

      t.equal(scatterplot.get('regl'), regl, 'regl should be a regl instance');

      t.equal(
        scatterplot.get('version'),
        version,
        `version should be set to ${version}`
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ width, height })',
    catchError((t) => {
      const w1 = 200;
      const h1 = 200;

      const canvas = createCanvas(w1, h1);
      const gl = canvas.getContext('webgl');
      const scatterplot = createScatterplot({ canvas, width: w1, height: h1 });

      t.equal(
        gl.drawingBufferWidth,
        w1 * window.devicePixelRatio,
        `width should be ${w1 * window.devicePixelRatio}px`
      );
      t.equal(
        gl.drawingBufferHeight,
        h1 * window.devicePixelRatio,
        `height should be ${h1 * window.devicePixelRatio}px`
      );

      const w2 = 400;
      const h2 = 300;

      scatterplot.set({ width: w2, height: h2 });

      t.equal(scatterplot.get('width'), w2, `width should be set to ${w2}px`);
      t.equal(scatterplot.get('height'), h2, `height should be set to ${h2}px`);

      t.equal(
        gl.drawingBufferWidth,
        w2 * window.devicePixelRatio,
        `width should be set to ${w2 * window.devicePixelRatio}px`
      );
      t.equal(
        gl.drawingBufferHeight,
        h2 * window.devicePixelRatio,
        `height should be set to ${h2 * window.devicePixelRatio}px`
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ aspectRatio })',
    catchError((t) => {
      const canvas = createCanvas(400, 200);
      const scatterplot = createScatterplot({
        canvas,
        width: 400,
        height: 200,
      });

      const aspectRatio = 2;
      scatterplot.set({ aspectRatio });

      t.equal(
        scatterplot.get('aspectRatio'),
        aspectRatio,
        `aspectRatio should be set to ${aspectRatio}`
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ backgroundColor })',
    catchError((t) => {
      const scatterplot = createScatterplot({ canvas: createCanvas() });

      const backgroundHex = '#ff0000';
      const backgroundNrgba = [1, 0, 0, 1];
      scatterplot.set({ backgroundColor: backgroundHex });

      t.ok(
        scatterplot
          .get('backgroundColor')
          .every((v, i) => v === backgroundNrgba[i]),
        'background color should be red and and converted to normalized RGBA'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ backgroundImage })',
    catchError(async (t) => {
      const canvas = createCanvas();
      const regl = createRegl(canvas);
      const scatterplot = createScatterplot({ canvas, regl });

      try {
        const backgroundImage = await createTextureFromUrl(
          regl,
          'https://picsum.photos/300/200/'
        );

        scatterplot.set({ backgroundImage });

        t.equal(
          scatterplot.get('backgroundImage'),
          backgroundImage,
          'background image should be a Regl texture'
        );
      } catch (e) {
        if (e.message === IMAGE_LOAD_ERROR) {
          t.skip(`Failed to load image from URL: ${e.message}`);
        } else {
          t.fail('Could not create background image from URL');
        }
      }

      try {
        const backgroundImage = await scatterplot.createTextureFromUrl(
          'https://picsum.photos/300/200/'
        );

        scatterplot.set({ backgroundImage });

        t.equal(
          scatterplot.get('backgroundImage'),
          backgroundImage,
          'background image should be a Regl texture'
        );

        scatterplot.set({ backgroundImage: null });

        t.equal(
          scatterplot.get('backgroundImage'),
          null,
          'background image should be nullifyable'
        );
      } catch (e) {
        if (e.message === IMAGE_LOAD_ERROR) {
          t.skip(`Failed to load image from URL: ${e.message}`);
        } else {
          t.fail('Could not create background image from URL');
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

        t.equal(
          scatterplot.get('backgroundImage').width,
          300,
          'background image should be loaded by scatterplot'
        );
      } catch (e) {
        if (e.message === IMAGE_LOAD_ERROR) {
          t.skip(`Failed to load image from URL: ${e.message}`);
        } else {
          t.fail('Could not create background image from URL');
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

      t.equal(
        scatterplot.get('backgroundImage').width,
        16,
        'base64 background image should be supported'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ cameraTarget, cameraDistance, cameraRotation, cameraView })',
    catchError((t) => {
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

        t.ok(
          comparators[setting](value, scatterplot.get(setting)),
          `${setting} should be set to ${value}`
        );

        scatterplot.set({ [setting]: null });

        t.ok(
          comparators[setting](value, scatterplot.get(setting)),
          `${setting} should not be nullifyable`
        );
      });

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ colorBy, opacityBy, sizeBy, pointConnectionColorBy, pointConnectionOpacityBy, pointConnectionSizeBy })',
    catchError((t) => {
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

            t.equal(
              scatterplot.get(property),
              value,
              `${property}: ${variant} should be set to ${value}`
            );
          });
        });

        scatterplot.set({ [property]: null });

        t.equal(
          scatterplot.get(property),
          null,
          'colorBy should be nullifyable'
        );
      });

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ pointColor, pointColorActive, pointColorHover, pointConnectionColor, pointConnectionColorActive, pointConnectionColorHover }) single color',
    catchError((t) => {
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

      t.equal(
        scatterplot.get('pointColor'),
        rgbaPointColor,
        'should create normalized RGBA for point color'
      );

      t.equal(
        scatterplot.get('pointColorActive'),
        rgbaPointColorActive,
        'should create normalized RGBA for point color active'
      );

      t.equal(
        scatterplot.get('pointColorHover'),
        rgbaPointColorHover,
        'should create normalized RGBA for point color hover'
      );

      t.equal(
        scatterplot.get('pointConnectionColor'),
        rgbaPointColor,
        'pointConnectionColor should inherit from pointColor'
      );

      t.equal(
        scatterplot.get('pointConnectionColorActive'),
        rgbaPointColorActive,
        'pointConnectionColorActive should inherit from pointColorActive'
      );

      t.equal(
        scatterplot.get('pointConnectionColorHover'),
        rgbaPointColorHover,
        'pointConnectionColorHover should inherit from pointColorHover'
      );

      // Set custom point connection color
      scatterplot.set({
        pointConnectionColor: '#ff0000',
        pointConnectionColorActive: '#00ff00',
        pointConnectionColorHover: '#0000ff',
      });

      t.equal(
        scatterplot.get('pointConnectionColor'),
        [1, 0, 0, 1],
        'should create an RGBA value for pointConnectionColor'
      );

      t.equal(
        scatterplot.get('pointConnectionColorActive'),
        [0, 1, 0, 1],
        'should create an RGBA value for pointConnectionColorActive'
      );

      t.equal(
        scatterplot.get('pointConnectionColorHover'),
        [0, 0, 1, 1],
        'should create an RGBA value for pointConnectionColorHover'
      );

      // Set an invalid color, which should default to white
      scatterplot.set({
        pointColor: 'shouldnotwork',
      });

      t.ok(
        scatterplot.get('pointColor').every((component) => component === 1),
        'should default to white when setting an invalid color point color from before'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ pointColor, pointColorActive, pointColorHover }) multiple colors',
    catchError((t) => {
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

      t.ok(
        scatterplot
          .get('pointColor')
          .every((color, i) => color.every((c, j) => c === pointColor[i][j])),
        'should accepts multiple normalized RGBA for point color'
      );

      t.ok(
        scatterplot
          .get('pointColorActive')
          .every((color, i) =>
            color.every((c, j) => c === pointColorActive[i][j])
          ),
        'should accepts multiple normalized RGBA for point color active'
      );

      t.ok(
        scatterplot
          .get('pointColorHover')
          .every((color, i) =>
            color.every((c, j) => c === pointColorHover[i][j])
          ),
        'should accepts multiple normalized RGBA for point color hover'
      );

      t.ok(
        scatterplot
          .get('pointConnectionColor')
          .every((color, i) => color.every((c, j) => c === pointColor[i][j])),
        'pointConnectionColor should inherit multiple colors from pointColor'
      );

      t.ok(
        scatterplot
          .get('pointConnectionColorActive')
          .every((color, i) =>
            color.every((c, j) => c === pointColorActive[i][j])
          ),
        'pointConnectionColorActive should inherit multiple colors from pointColorActive'
      );

      t.ok(
        scatterplot
          .get('pointConnectionColorHover')
          .every((color, i) =>
            color.every((c, j) => c === pointColorHover[i][j])
          ),
        'pointConnectionColorHover should inherit multiple colors from pointColorHover'
      );

      scatterplot.set({
        pointConnectionColor: ['#ff0000', '#ff00ff'],
        pointConnectionColorActive: ['#ffff00', '#0000ff'],
        pointConnectionColorHover: ['#000000', '#ffffff'],
      });

      t.equal(
        scatterplot.get('pointConnectionColor'),
        [
          [1, 0, 0, 1],
          [1, 0, 1, 1],
        ],
        'should accepts multiple normalized RGBA for pointConnectionColor'
      );

      t.equal(
        scatterplot.get('pointConnectionColorActive'),
        [
          [1, 1, 0, 1],
          [0, 0, 1, 1],
        ],
        'should accepts multiple normalized RGBA for pointConnectionColorActive'
      );

      t.equal(
        scatterplot.get('pointConnectionColorHover'),
        [
          [0, 0, 0, 1],
          [1, 1, 1, 1],
        ],
        'should accepts multiple normalized RGBA for pointConnectionColorHover'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ opacity, pointConnectionOpacity, pointConnectionOpacityActive })',
    catchError(async (t) => {
      const scatterplot = createScatterplot({ canvas: createCanvas() });

      let opacity = 0.5;

      scatterplot.set({ opacity });

      t.equal(
        scatterplot.get('opacity'),
        opacity,
        `opacity should be set to ${opacity}`
      );

      t.equal(
        scatterplot.get('pointConnectionOpacity'),
        DEFAULT_POINT_CONNECTION_OPACITY,
        `pointConnectionOpacity should be set the default value (${DEFAULT_POINT_CONNECTION_OPACITY})`
      );

      t.equal(
        scatterplot.get('pointConnectionOpacityActive'),
        DEFAULT_POINT_CONNECTION_OPACITY_ACTIVE,
        `pointConnectionOpacityActive should be set the default value (${DEFAULT_POINT_CONNECTION_OPACITY_ACTIVE})`
      );

      scatterplot.set({
        opacity: 0,
        pointConnectionOpacity: opacity,
        pointConnectionOpacityActive: opacity,
      });

      t.equal(
        scatterplot.get('opacity'),
        opacity,
        'opacity should not be nullifyable'
      );

      t.equal(
        scatterplot.get('pointConnectionOpacity'),
        opacity,
        `pointConnectionOpacity should be set to ${opacity}`
      );

      t.equal(
        scatterplot.get('pointConnectionOpacityActive'),
        opacity,
        `pointConnectionOpacityActive should be set to ${opacity}`
      );

      opacity = [0.5, 0.75, 1];

      scatterplot.set({
        opacity,
        pointConnectionOpacity: opacity,
        pointConnectionOpacityActive: opacity,
      });

      t.equal(
        scatterplot.get('opacity'),
        opacity,
        'should accept multiple opacities'
      );

      t.equal(
        scatterplot.get('pointConnectionOpacity'),
        opacity,
        `pointConnectionOpacity should be set to ${opacity}`
      );

      t.equal(
        scatterplot.get('pointConnectionOpacityActive'),
        0.5,
        'pointConnectionOpacityActive should **STILL BE** 0.5'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ lassoColor, lassoMinDist, lassoMinDelay, lassoClearEvent })',
    catchError(async (t) => {
      const scatterplot = createScatterplot({ canvas: createCanvas() });

      // Check default lasso color, min distance, and min delay
      t.equal(
        scatterplot.get('lassoColor'),
        DEFAULT_LASSO_COLOR,
        `lassoColor should be set to ${DEFAULT_LASSO_COLOR}`
      );
      t.equal(
        scatterplot.get('lassoMinDist'),
        DEFAULT_LASSO_MIN_DIST,
        `lassoMinDist should be set to ${DEFAULT_LASSO_MIN_DIST}`
      );
      t.equal(
        scatterplot.get('lassoMinDelay'),
        DEFAULT_LASSO_MIN_DELAY,
        `lassoMinDelay should be set to ${DEFAULT_LASSO_MIN_DELAY}`
      );
      t.equal(
        scatterplot.get('lassoClearEvent'),
        DEFAULT_LASSO_CLEAR_EVENT,
        `lassoClearEvent should be set to ${DEFAULT_LASSO_CLEAR_EVENT}`
      );

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

      t.equal(
        scatterplot.get('lassoColor'),
        lassoColor,
        `lassoColor should be set to ${lassoColor}`
      );
      t.equal(
        scatterplot.get('lassoMinDist'),
        lassoMinDist,
        `lassoMinDist should be set to ${lassoMinDist}`
      );
      t.equal(
        scatterplot.get('lassoMinDelay'),
        lassoMinDelay,
        `lassoMinDelay should be set to ${lassoMinDelay}`
      );
      t.equal(
        scatterplot.get('lassoClearEvent'),
        lassoClearEvent,
        `lassoClearEvent should be set to ${lassoClearEvent}`
      );

      scatterplot.set({
        lassoColor: null,
        lassoMinDist: null,
        lassoMinDelay: null,
        lassoClearEvent: null,
      });

      t.equal(
        scatterplot.get('lassoColor'),
        lassoColor,
        'lassoColor should not be nullifyable'
      );
      t.equal(
        scatterplot.get('lassoMinDist'),
        lassoMinDist,
        'lassoMinDist should not be nullifyable'
      );
      t.equal(
        scatterplot.get('lassoMinDelay'),
        lassoMinDelay,
        'lassoMinDelay should not be nullifyable'
      );
      t.equal(
        scatterplot.get('lassoClearEvent'),
        lassoClearEvent,
        'lassoClearEvent should not be nullifyable'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ pointOutlineWidth })',
    catchError(async (t) => {
      const scatterplot = createScatterplot({ canvas: createCanvas() });

      const pointOutlineWidth = 42;

      scatterplot.set({ pointOutlineWidth });

      t.equal(
        scatterplot.get('pointOutlineWidth'),
        pointOutlineWidth,
        `pointOutlineWidth should be set to ${pointOutlineWidth}`
      );

      scatterplot.set({ pointOutlineWidth: 0 });

      t.equal(
        scatterplot.get('pointOutlineWidth'),
        pointOutlineWidth,
        'pointOutlineWidth should not be nullifyable'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ pointSize, pointConnectionSize, pointConnectionSizeActive })',
    catchError(async (t) => {
      const scatterplot = createScatterplot({ canvas: createCanvas() });

      const pointSize = 42;

      scatterplot.set({ pointSize });

      t.equal(
        scatterplot.get('pointSize'),
        pointSize,
        `pointSize should be set to ${pointSize}`
      );

      t.equal(
        scatterplot.get('pointConnectionSize'),
        DEFAULT_POINT_CONNECTION_SIZE,
        `pointConnectionSize should be set the default value (${DEFAULT_POINT_CONNECTION_SIZE})`
      );

      t.equal(
        scatterplot.get('pointConnectionSizeActive'),
        DEFAULT_POINT_CONNECTION_SIZE_ACTIVE,
        `pointConnectionSizeActive should be set the default value (${DEFAULT_POINT_CONNECTION_SIZE_ACTIVE})`
      );

      scatterplot.set({
        pointSize: 0,
        pointConnectionSize: pointSize,
        pointConnectionSizeActive: pointSize,
      });

      t.equal(
        scatterplot.get('pointSize'),
        pointSize,
        'pointSize should not be nullifyable'
      );

      t.equal(
        scatterplot.get('pointConnectionSize'),
        pointSize,
        `pointConnectionSize should be set to ${pointSize}`
      );

      t.equal(
        scatterplot.get('pointConnectionSizeActive'),
        pointSize,
        `pointConnectionSizeActive should be set to ${pointSize}`
      );

      scatterplot.set({
        pointSize: [2, 4, 6],
        pointConnectionSize: [2, 4, 6],
        pointConnectionSizeActive: [2, 4, 6],
      });

      t.equal(
        scatterplot.get('pointSize'),
        [2, 4, 6],
        'pointSize should accept multiple sizes'
      );

      t.equal(
        scatterplot.get('pointConnectionSize'),
        [2, 4, 6],
        'pointConnectionSize should accept multiple sizes'
      );

      t.equal(
        scatterplot.get('pointConnectionSizeActive'),
        pointSize,
        `pointConnectionSize should **STILL BE**  ${pointSize}`
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ pointSizeSelected })',
    catchError(async (t) => {
      const scatterplot = createScatterplot({ canvas: createCanvas() });

      const pointSizeSelected = 42;

      scatterplot.set({ pointSizeSelected });

      t.equal(
        scatterplot.get('pointSizeSelected'),
        pointSizeSelected,
        `pointSizeSelected should be set to ${pointSizeSelected}`
      );

      scatterplot.set({ pointSizeSelected: 0 });

      t.equal(
        scatterplot.get('pointSizeSelected'),
        pointSizeSelected,
        'pointSizeSelected should not be nullifyable'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'set({ showReticle, reticleColor })',
    catchError(async (t) => {
      const scatterplot = createScatterplot({ canvas: createCanvas() });

      t.equal(
        scatterplot.get('showReticle'),
        DEFAULT_SHOW_RETICLE,
        `showReticle should be set to ${JSON.stringify(
          DEFAULT_SHOW_RETICLE
        )} by default`
      );

      t.equal(
        scatterplot.get('reticleColor'),
        DEFAULT_RETICLE_COLOR,
        `reticleColor should be set to ${DEFAULT_RETICLE_COLOR} by default`
      );

      const showReticle = !DEFAULT_SHOW_RETICLE;
      const reticleColor = [1, 0, 0, 0.5];

      scatterplot.set({ showReticle, reticleColor });

      t.equal(
        scatterplot.get('showReticle'),
        showReticle,
        `showReticle should be set to ${showReticle}`
      );

      scatterplot.set({ showReticle: null });

      t.equal(
        scatterplot.get('showReticle'),
        showReticle,
        'showReticle should not be nullifyable'
      );

      t.equal(
        scatterplot.get('reticleColor'),
        reticleColor,
        `reticleColor should be set to ${reticleColor}`
      );

      scatterplot.set({ reticleColor: null });

      t.equal(
        scatterplot.get('reticleColor'),
        reticleColor,
        'reticleColor should not be nullifyable'
      );

      scatterplot.destroy();
    })
  );
});

/* ---------------------------------- events -------------------------------- */

test('events', async (t2) => {
  await t2.test(
    'init and destroy events',
    catchError(async (t) => {
      const canvas = createCanvas(200, 200);
      const scatterplot = createScatterplot({
        canvas,
        width: 200,
        height: 200,
      });

      const whenInit = new Promise((resolve) => {
        scatterplot.subscribe('init', resolve, 1);
      });
      const whenDestroy = new Promise((resolve) => {
        scatterplot.subscribe('destroy', resolve, 1);
      });

      await whenInit;

      scatterplot.destroy();

      await whenDestroy;

      t.equal(true, true, '"init" and "destroy" event fired');
    })
  );

  await t2.test(
    'throw an error when calling draw() after destroy()',
    catchError(async (t) => {
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
        t.fail(
          'should have thrown an error because the scatterplot instance is destroyed'
        );
      } catch (e) {
        t.eq(e.message, 'The instance was already destroyed');
      }
    })
  );

  await t2.test(
    'test that `isPointsDrawn` is set correctly',
    catchError(async (t) => {
      const canvas = createCanvas(200, 200);
      const scatterplot = createScatterplot({
        canvas,
        width: 200,
        height: 200,
      });

      t.equal(scatterplot.get('isPointsDrawn'), false);
      t.equal(scatterplot.get('isDestroyed'), false);

      await scatterplot.draw([[0, 0]]);

      t.equal(scatterplot.get('isPointsDrawn'), true);

      scatterplot.destroy();

      t.equal(scatterplot.get('isDestroyed'), true);
      t.equal(scatterplot.get('isPointsDrawn'), false);
    })
  );

  await t2.test(
    'do _not_ throw an error when calling draw() _before_ destroy()',
    catchError(async (t) => {
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

      t.equal(
        numDraws,
        0,
        'draw call should have been canceled due to the destroy call'
      );
    })
  );

  await t2.test(
    'test that draw() recognized the correct data type of z and w',
    catchError(async (t) => {
      const canvas = createCanvas(200, 200);
      const scatterplot = createScatterplot({
        canvas,
        width: 200,
        height: 200,
      });

      await scatterplot.draw([[0, 0]]);

      t.equal(
        scatterplot.get('zDataType'),
        CATEGORICAL,
        `Default z data type should be ${CATEGORICAL}`
      );

      t.equal(
        scatterplot.get('wDataType'),
        CATEGORICAL,
        `Default w data type should be ${CATEGORICAL}`
      );

      await scatterplot.draw([[0, 0, 1, 1]]);

      t.equal(
        scatterplot.get('zDataType'),
        CATEGORICAL,
        `Z data type should be ${CATEGORICAL} as there's only one value for z and it's an integer`
      );

      t.equal(
        scatterplot.get('wDataType'),
        CATEGORICAL,
        `W data type should be ${CATEGORICAL} as there's only one value for w and it's an integer`
      );

      await scatterplot.draw([
        [0, 0, 0, 0],
        [0, 0, 1, 1],
      ]);

      t.equal(
        scatterplot.get('zDataType'),
        CATEGORICAL,
        `Z data type should be ${CATEGORICAL} as the two z values are integers`
      );

      t.equal(
        scatterplot.get('wDataType'),
        CATEGORICAL,
        `W data type should be ${CATEGORICAL} as the two w values are integers`
      );

      await scatterplot.draw([
        [0, 0, 0, 0],
        [0, 0, 1, 1],
        [0, 0, 10, 10],
      ]);

      t.equal(
        scatterplot.get('zDataType'),
        CATEGORICAL,
        `Z data type should be ${CATEGORICAL} as all z values are integers`
      );

      t.equal(
        scatterplot.get('wDataType'),
        CATEGORICAL,
        `W data type should be ${CATEGORICAL} as all w values are integers`
      );

      await scatterplot.draw([[0, 0, 0.5, 0.5]]);

      t.equal(
        scatterplot.get('zDataType'),
        CONTINUOUS,
        `Z data type should be ${CONTINUOUS} as the z value is a float`
      );

      t.equal(
        scatterplot.get('wDataType'),
        CONTINUOUS,
        `W data type should be ${CONTINUOUS} as the w value is a float`
      );

      await scatterplot.draw([
        [0, 0, 0, 0],
        [0, 0, 0.5, 0.5],
        [0, 0, 1, 1],
      ]);

      t.equal(
        scatterplot.get('zDataType'),
        CONTINUOUS,
        `Z data type should be ${CONTINUOUS} as one z value is a float`
      );

      t.equal(
        scatterplot.get('wDataType'),
        CONTINUOUS,
        `W data type should be ${CONTINUOUS} as one w value is a float`
      );

      await scatterplot.draw(
        [
          [0, 0, 0, 0],
          [0, 0, 1, 1],
        ],
        { zDataType: CONTINUOUS, wDataType: CONTINUOUS }
      );

      t.equal(
        scatterplot.get('zDataType'),
        CONTINUOUS,
        `Z data type should be ${CONTINUOUS} as we manually specified the z data type`
      );

      t.equal(
        scatterplot.get('wDataType'),
        CONTINUOUS,
        `W data type should be ${CONTINUOUS} as we manually specified the w data type`
      );

      await scatterplot.draw([[0, 0, 0.5, 1]]);

      t.equal(
        scatterplot.get('zDataType'),
        CONTINUOUS,
        `Z data type should be ${CONTINUOUS} as the z value is a float`
      );

      t.equal(
        scatterplot.get('wDataType'),
        CATEGORICAL,
        `W data type should be ${CATEGORICAL} as the w value is an integer`
      );

      await scatterplot.draw([[0, 0, 1, 0.5]]);

      t.equal(
        scatterplot.get('zDataType'),
        CATEGORICAL,
        `Z data type should be ${CATEGORICAL} as the z value is an integer`
      );

      t.equal(
        scatterplot.get('wDataType'),
        CONTINUOUS,
        `W data type should be ${CONTINUOUS} as the w value is a float`
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'test drawing point connections via `showLineConnections`',
    catchError(async (t) => {
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
          .map((_, i) => [-1 + (i / 6) * 2, -1 + Math.random() * 2, i, 1, 0])
      );
      await wait(0);

      t.equal(numConnectionsDraws, 1, 'should have drawn the connections once');

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

      t.equal(numConnectionsDraws, 2, 'should have drawn the connections once');

      scatterplot.destroy();
    })
  );
});

test('tests involving mouse events', async (t2) => {
  await t2.test(
    'draw(), clear(), publish("select")',
    catchError(async (t) => {
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

      t.equal(selectedPoints.length, 1, 'should have selected one point');
      t.equal(selectedPoints[0], 0, 'should have selected the first point');

      // Test deselection
      canvas.dispatchEvent(createMouseEvent('dblclick', hdim, hdim));

      await wait(0);

      t.equal(selectedPoints.length, 0, 'should have deselected one point');

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

      t.equal(selectedPoints.length, 0, 'should *not* have selected one point');

      // Test that clearing the points works. The selection that worked previously
      // should not work anymore
      scatterplot.clear();
      window.dispatchEvent(
        createMouseEvent('mousedown', hdim, hdim, { buttons: 1 })
      );
      canvas.dispatchEvent(createMouseEvent('click', hdim, hdim));

      await wait(0);

      t.equal(selectedPoints.length, 0, 'should *not* have selected one point');

      scatterplot.destroy();
    })
  );

  await t2.test(
    'lasso selection (with events: select, lassoStart, lassoExtend, and lassoEnd)',
    catchError(async (t) => {
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

      const [lassoKey] = Object.entries(scatterplot.get('keyMap')).find(
        (mapping) => mapping[1] === KEY_ACTION_LASSO
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

      t.equal(selectedPoints.length, 3, 'should have selected 3 points');
      t.deepEqual(
        selectedPoints,
        [0, 2, 4],
        'should have selected the first, third, and fifth point'
      );

      t.equal(lassoStartCount, 1, 'should have triggered lassoStart once');
      t.equal(
        lassoExtendCount,
        mousePositions.length,
        'should have triggered lassoExtend once'
      );
      t.equal(
        lassoEndCoordinates.length,
        mousePositions.length,
        `should have created a lasso with ${mousePositions.length} points`
      );
      t.equal(lassoEndCount, 1, 'should have triggered lassoEnd once');

      scatterplot.destroy();
    })
  );

  await t2.test(
    'disable lasso selection',
    catchError(async (t) => {
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

      t.equal(
        0,
        Object.entries(scatterplot.get('keyMap')).length,
        'KeyMap should be unset'
      );

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

      t.equal(
        lassoStartCount,
        0,
        'should have not triggered lassoStart at all'
      );

      t.equal(selectedPoints.length, 0, 'should have not selected any points');

      scatterplot.destroy();
    })
  );

  await t2.test(
    'test lasso selection via the initiator',
    catchError(async (t) => {
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

      t.ok(
        scatterplot.get('lassoInitiator') === false,
        'lasso initiator should be inactive'
      );
      t.ok(
        lassoIniatorElement.id.startsWith('lasso-initiator'),
        'lasso initiator element should exist'
      );
      t.equal(
        scatterplot.get('lassoInitiatorParentElement'),
        document.body,
        'lasso initiator parent element should be the document body'
      );

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

      t.deepEqual(selectedPoints, [], 'should have not selected anything');

      scatterplot.set({ lassoInitiator: true });

      await wait(0);

      t.ok(
        scatterplot.get('lassoInitiator'),
        'lasso initiator should be active'
      );

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

      t.deepEqual(
        selectedPoints,
        [0, 2, 4],
        'should have selected the first, third, and fifth point'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'test rotation',
    catchError(async (t) => {
      const dim = 200;
      const hdim = dim / 2;
      const canvas = createCanvas(dim, dim);
      const scatterplot = createScatterplot({
        canvas,
        width: dim,
        height: dim,
      });

      await scatterplot.draw([[0, 0]]);

      const initialRotation = scatterplot.get('cameraRotation');
      t.equal(initialRotation, 0, 'view should not be rotated on init');

      let rotation;
      const viewHandler = ({ camera }) => {
        rotation = camera.rotation;
      };
      scatterplot.subscribe('view', viewHandler);

      let [rotateKey] = Object.entries(scatterplot.get('keyMap')).find(
        (mapping) => mapping[1] === KEY_ACTION_ROTATE
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

      t.ok(
        initialRotation !== rotation && Number.isFinite(rotation),
        'view should have been rotated'
      );

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

      t.equal(
        lastRotation,
        rotation,
        'view should have not been rotated via the old modifier key'
      );

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

      t.ok(
        lastRotation !== rotation,
        'view should have been rotated via the new modifier key'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'point hover with publish("pointover") and publish("pointout")',
    catchError(async (t) => {
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

      t.equal(hoveredPoint, 0, 'should be hovering point 0 (in the middle)');

      // Test deselection
      window.dispatchEvent(createMouseEvent('mousemove', hdim / 2, hdim));

      await wait(0);

      t.equal(hoveredPoint, null, 'should not be hovering any point');

      scatterplot.destroy();
    })
  );

  await t2.test(
    'publish("view")',
    catchError(async (t) => {
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

      t.deepEqual(
        Array.from(currentView),
        predictedView,
        'should have published the translated view'
      );

      t.ok(currentCamera, 'should have published the camera');

      t.deepEqual(xScale.domain(), [0, 10], 'should have updated the xScale');

      t.deepEqual(yScale.domain(), [0, 0.5], 'should have updated the yScale');

      scatterplot.destroy();
    })
  );
});

/* ----------------------------- Other Methods ------------------------------ */

test('other methods', async (t2) => {
  await t2.test(
    'draw() with transition',
    catchError(async (t) => {
      const scatterplot = createScatterplot({ canvas: createCanvas() });

      let numDrawCalls = 0;
      let numTransitionStartCalls = 0;
      let numTransitionEndCalls = 0;

      scatterplot.subscribe('draw', () => numDrawCalls++);
      scatterplot.subscribe('transitionStart', () => numTransitionStartCalls++);
      scatterplot.subscribe('transitionEnd', () => numTransitionEndCalls++);

      await scatterplot.draw([[0, 0]]);

      t.equal(numDrawCalls, 1, 'should have one draw call');

      const t0 = performance.now();
      const transitionDuration = 250;

      await scatterplot.draw([[1, 1]], {
        transition: true,
        transitionDuration,
      });

      t.equal(
        numTransitionStartCalls,
        1,
        'transition should have started once'
      );
      t.equal(numTransitionEndCalls, 1, 'transition should have ended once');
      t.ok(
        performance.now() - t0 >= transitionDuration,
        `transition should have taken ${transitionDuration}msec or a bit longer`
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'draw() with preventFilterReset',
    catchError(async (t) => {
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

      t.ok(
        isSameElements(scatterplot.get('filteredPoints'), filteredPoints),
        `only points ${filteredPoints} should be filtered in`
      );

      let img = scatterplot.export();

      t.equal(
        getPixelSum(img, 0, Math.ceil(img.width / 3), 0, img.height),
        0,
        'The left side of the image should be empty as points #3 and #4 are filtered out'
      );

      t.ok(
        getPixelSum(img, Math.ceil(img.width / 3), img.width, 0, img.height) >
          0,
        'The right side of the image should *not* be empty as points #0 to #2 are filtered in'
      );

      await scatterplot.draw([...points], { preventFilterReset: true });

      t.equal(
        scatterplot.get('isPointsFiltered'),
        true,
        '`isPointsFiltered` should be `true` as draw has been invoked with preventFilterReset'
      );

      t.ok(
        isSameElements(scatterplot.get('filteredPoints'), filteredPoints),
        'the filtered points should be the same as before'
      );

      img = scatterplot.export();

      t.equal(
        getPixelSum(img, 0, Math.ceil(img.width / 3), 0, img.height),
        0,
        'The left side of the image should be empty as points #3 and #4 are filtered out'
      );

      t.ok(
        getPixelSum(img, Math.ceil(img.width / 3), img.width, 0, img.height) >
          0,
        'The right side of the image should *not* be empty as points #0 to #2 are filtered in'
      );

      await scatterplot.draw([...points, [0.5, 0.5]], {
        preventFilterReset: true,
      });

      t.equal(
        scatterplot.get('isPointsFiltered'),
        false,
        '`isPointsFiltered` should be `false` as draw has been invoked with different number of points'
      );

      t.equal(
        scatterplot.get('filteredPoints').length,
        points.length + 1,
        'the filtered points should be reset as draw has been invoked with different number of points'
      );

      img = scatterplot.export();

      t.ok(
        getPixelSum(img, 0, Math.ceil(img.width / 3), 0, img.height) > 0,
        'The left side of the image should *not* be empty as the filter was reset'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'select()',
    catchError(async (t) => {
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

      t.deepEqual(
        selectedPoints,
        [0, 2, 4],
        'should have selected point 0, 2, and 4'
      );

      t.deepEqual(
        scatterplot.get('selectedPoints'),
        [0, 2, 4],
        'should be able to retrieve the selected points'
      );

      scatterplot.deselect();

      await wait(0);

      t.equal(selectedPoints.length, 0, 'should have deselected all points');

      scatterplot.select([0, 2, 4]);

      await wait(0);

      t.deepEqual(
        scatterplot.get('selectedPoints'),
        [0, 2, 4],
        'should have selected three points again'
      );

      scatterplot.select([]);

      await wait(0);

      t.equal(
        selectedPoints.length,
        0,
        'should have deselected all points via `select([])`'
      );

      scatterplot.select([0, 2, 4], { preventEvent: true });

      await wait(0);

      t.equal(
        selectedPoints.length + scatterplot.get('selectedPoints').length,
        3,
        'should have silently selected three points'
      );

      scatterplot.deselect();
      scatterplot.select([0, 2, 4]);
      scatterplot.deselect({ preventEvent: true });

      await wait(0);

      t.deepEqual(
        selectedPoints,
        [0, 2, 4],
        'should have silently deselected points'
      );

      scatterplot.select(2);

      await wait(0);

      t.deepEqual(
        selectedPoints,
        [2],
        'should allow single point index selection'
      );

      scatterplot.select(-1);

      await wait(0);

      t.deepEqual(
        selectedPoints,
        [],
        'should have not selected any point because -1 is invalid'
      );

      scatterplot.select([0, -1, 2, 4, 6]);

      await wait(0);

      t.deepEqual(
        selectedPoints,
        [0, 2, 4],
        'should have filtered out invalid point selections'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'hover() with columnar data',
    catchError(async (t) => {
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

      t.equal(hovering, 0, 'should be hovering point 0');

      scatterplot.hover();

      await wait(0);

      t.equal(hovering, undefined, 'should have stopped hovering point 0');

      scatterplot.hover(2, { preventEvent: true });

      await wait(0);

      t.equal(hovering, undefined, 'should be silently hovering point 2');

      scatterplot.hover(4);
      scatterplot.hover(undefined, { preventEvent: true });

      await wait(0);

      t.deepEqual(hovering, 4, 'should have silently stopped hovering point 4');

      scatterplot.hover(-1);

      await wait(0);

      // Point 4 should still be registered as being hovered
      t.deepEqual(hovering, 4, 'should not be hovering an invalid point');

      scatterplot.hover(6);

      await wait(0);

      // Point 4 should still be registered as being hovered
      t.deepEqual(hovering, 4, 'should not be hovering an invalid point');

      scatterplot.destroy();
    })
  );

  await t2.test(
    'filter()',
    catchError(async (t) => {
      const scatterplot = createScatterplot({ canvas: createCanvas() });

      const points = [
        [0, 0],
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
      ];

      await scatterplot.draw(points);

      t.deepEqual(
        scatterplot.get('isPointsFiltered'),
        false,
        '`isPointsFiltered` should be `false` as points have not been filtered'
      );

      t.ok(
        isSameElements(scatterplot.get('filteredPoints'), [0, 1, 2, 3, 4]),
        'all points should be filtered in'
      );

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

      t.ok(
        isSameElements(filteredPoints, [1, 3]),
        'should have filtered down to points 1 and 3'
      );

      t.deepEqual(
        scatterplot.get('isPointsFiltered'),
        true,
        '`isPointsFiltered` should be `true` as points have been filtered'
      );

      t.ok(
        isSameElements(scatterplot.get('pointsInView'), [1, 3]),
        'should have two points (1 and 3) in view'
      );

      t.ok(
        isSameElements(scatterplot.get('filteredPoints'), [1, 3]),
        'should be able to retrieve the filtered points'
      );

      scatterplot.hover(1);
      await wait(0);

      t.equal(
        hoveredPoint,
        1,
        'should be able to hover a point that is filtered in'
      );

      scatterplot.hover(2);
      await wait(0);

      t.equal(
        hoveredPoint,
        undefined,
        'should not be able to hover a point that is filtered out'
      );

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

      t.equal(
        selectedPoints.length,
        0,
        'should not have selected points 0, 2, and 4 because they are filtered out'
      );

      await scatterplot.filter([]);

      await wait(0);

      t.deepEqual(filteredPoints, [], 'should have filtered out all points');

      t.equal(
        scatterplot.get('filteredPoints').length,
        0,
        'should retrieve an empty array of filtered points'
      );

      scatterplot.select([0, 1, 2, 3, 4]);

      await wait(0);

      t.equal(
        selectedPoints.length,
        0,
        'should not be able to selected any points because all are filtered out'
      );

      await scatterplot.unfilter();
      await wait(0);

      t.ok(
        isSameElements(filteredPoints, [0, 1, 2, 3, 4]),
        'should have unfiltered the points'
      );

      t.ok(
        isSameElements(scatterplot.get('filteredPoints'), [0, 1, 2, 3, 4]),
        'should be able to retrieve the filtered points'
      );

      t.deepEqual(
        scatterplot.get('isPointsFiltered'),
        false,
        '`isPointsFiltered` should be `false` as we reset the point filter'
      );

      scatterplot.select([0, 2, 4]);

      await wait(0);

      t.deepEqual(
        selectedPoints,
        [0, 2, 4],
        'should have selected points 0, 2, and 4 because we unfiltered points first'
      );

      await scatterplot.filter([1, 3], { preventEvent: true });
      await wait(0);

      t.ok(
        filteredPoints.length === 5 &&
          scatterplot.get('pointsInView').length === 2,
        'should have silently filtered down to two points'
      );

      await scatterplot.filter([0, 1, 3]);
      await scatterplot.unfilter({ preventEvent: true });
      await wait(0);

      t.ok(
        filteredPoints.length === 3 &&
          scatterplot.get('pointsInView').length === 5,
        'should have silently unfiltered points'
      );

      await scatterplot.filter(2);
      await wait(0);

      t.ok(
        filteredPoints.length === 1 &&
          filteredPoints[0] === 2 &&
          scatterplot.get('pointsInView').length === 1,
        'should allow filtering down to a single point'
      );

      await scatterplot.filter(-1);
      await wait(0);

      t.equal(
        filteredPoints.length,
        0,
        'should have not filter down to any point because -1 is an invalid point index'
      );

      await scatterplot.filter([0, -1, 2, 4, 6]);
      await wait(0);

      t.ok(
        isSameElements(filteredPoints, [0, 2, 4]),
        'should have filtered down to valid points (0, 2, and 4) only'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'test hover, select, and filter options of `draw()`',
    catchError(async (t) => {
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

      t.equal(
        scatterplot.get('hoveredPoint'),
        0,
        'should be hovering the first point'
      );

      t.equal(
        scatterplot.get('selectedPoints'),
        [2],
        'should have selected the third point'
      );

      t.ok(
        isSameElements(scatterplot.get('filteredPoints'), [0, 2, 3]),
        'should have filtered down to points 0, 2, and 3'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'zooming with transition',
    catchError(async (t) => {
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

      t.equal(numDrawCalls, 1, 'should have one draw call');

      const t0 = performance.now();
      const transitionDuration = 50;

      await scatterplot.zoomToPoints([1, 2], {
        transition: true,
        transitionDuration,
      });

      t.equal(
        numTransitionStartCalls,
        1,
        'transition should have started once'
      );
      t.equal(numTransitionEndCalls, 1, 'transition should have ended once');
      t.ok(
        performance.now() - t0 >= transitionDuration,
        `transition should have taken ${transitionDuration}msec or a bit longer`
      );
      t.ok(
        camera.target[0] - 0.5 <= 1e-8,
        'camera should target the top-right corner'
      );
      t.ok(
        camera.target[1] - 0.5 <= 1e-8,
        'camera should target the top-right corner'
      );

      await scatterplot.zoomToOrigin({ transition: true, transitionDuration });

      t.equal(
        numTransitionStartCalls,
        2,
        'transition should have started twice'
      );
      t.equal(numTransitionEndCalls, 2, 'transition should have ended twice');
      t.ok(camera.target[0] <= 1e-8, 'camera should target the origin');
      t.ok(camera.target[1] <= 1e-8, 'camera should target the origin');

      await scatterplot.zoomToLocation([-0.5, -0.5], 0.1, {
        transition: true,
        transitionDuration,
      });

      t.equal(
        numTransitionStartCalls,
        3,
        'transition should have started three times'
      );
      t.equal(
        numTransitionEndCalls,
        3,
        'transition should have ended three times'
      );
      t.ok(
        camera.target[0] + 0.1 <= 1e-8,
        'camera should target the bottom-left corner'
      );
      t.ok(
        camera.target[1] + 0.1 <= 1e-8,
        'camera should target the bottom-left corner'
      );
      t.ok(
        camera.distance[0] - 0.1 <= 1e-8,
        'camera distance should be close to 0.1'
      );

      await scatterplot.zoomToArea(
        { x: 0, y: -1, width: 1, height: 1 },
        { transition: true, transitionDuration }
      );

      t.equal(
        numTransitionStartCalls,
        4,
        'transition should have started four times'
      );
      t.equal(
        numTransitionEndCalls,
        4,
        'transition should have ended four times'
      );
      t.ok(
        camera.target[0] - 0.5 <= 1e-8,
        'camera should target the bottom-right corner'
      );
      t.ok(
        camera.target[1] + 0.5 <= 1e-8,
        'camera should target the bottom-right corner'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'zoomToPoints() before point were drawn should fail',
    catchError(async (t) => {
      const scatterplot = createScatterplot({ canvas: createCanvas() });
      try {
        await scatterplot.zoomToPoints([1, 2]);
        t.fail('zoomToPoints() should have thrown an error');
      } catch (e) {
        t.equal(e.message, ERROR_POINTS_NOT_DRAWN);
      }
      scatterplot.destroy();
    })
  );

  await t2.test(
    'zoomToArea() with non-standard aspect ratio',
    catchError(async (t) => {
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

          t.equal(
            scatterplot.get('pointsInView').length,
            500,
            'should show all points'
          );

          t.ok(
            Math.abs(scatterplot.getScreenPosition(0)[0]) < 0.01,
            'first point should be close to zero'
          );

          t.ok(
            Math.abs(scatterplot.getScreenPosition(499)[0] - width) < 0.01,
            `last point should be close to ${width}`
          );

          scatterplot.destroy();
        }
      }
    })
  );

  await t2.test(
    'getScreenPosition()',
    catchError(async (t) => {
      const scatterplot = createScatterplot({
        canvas: createCanvas(100, 100),
        width: 100,
        height: 100,
      });

      try {
        scatterplot.getScreenPosition(0);
        t.fail('getScreenPosition() should have thrown an error');
      } catch (e) {
        t.equal(e.message, ERROR_POINTS_NOT_DRAWN);
      }

      await scatterplot.draw([
        [-1, -1],
        [0, 0],
        [1, 1],
      ]);

      t.equal(
        scatterplot.getScreenPosition(0),
        [0, 100],
        'First point should be drawn at [0, 100]'
      );
      t.equal(
        scatterplot.getScreenPosition(1),
        [50, 50],
        'Second point should be drawn at [50, 50]'
      );
      t.equal(
        scatterplot.getScreenPosition(2),
        [100, 0],
        'Third point should be drawn at [100, 0]'
      );

      // A forth point does not exist as we only drew three
      t.equal(
        scatterplot.getScreenPosition(3),
        undefined,
        'Forth point does not exist'
      );

      await scatterplot.zoomToPoints([0]);
      t.equal(
        scatterplot.getScreenPosition(0),
        [50, 50],
        'After zooming, the first point should be drawn at [50, 50]'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'isSupported',
    catchError((t) => {
      const scatterplot = createScatterplot({ canvas: createCanvas() });
      const renderer = scatterplot.get('renderer');

      t.ok(
        Object.prototype.hasOwnProperty.call(scatterplot, 'isSupported'),
        'scatter plot instance should have `isSupported` property'
      );

      t.ok(
        Object.prototype.hasOwnProperty.call(renderer, 'isSupported'),
        'renderer instance should have `isSupported` property'
      );

      t.ok(
        scatterplot.isSupported === true || scatterplot.isSupported === false,
        '`isSupported` should return a Boolean value'
      );

      t.ok(
        renderer.isSupported === true || renderer.isSupported === false,
        '`isSupported` should return a Boolean value'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'test "drawing" event',
    catchError(async (t) => {
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

      t.equal(numDrawCalls, 0, 'should not have registered any "draw" event');
      t.equal(numDrawingCalls, 1, 'should have registered one "drawing" event');

      await isDrawn;

      t.equal(numDrawCalls, 1, 'should have registered one "draw" event');

      scatterplot.destroy();
    })
  );

  await t2.test(
    'spatial index',
    catchError(async (t) => {
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

      t.equal(
        scatterplot.get('pointsInView'),
        [1, 2],
        'should have points #1 and #2 in the view'
      );

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
      t.equal(
        scatterplot.get('pointsInView'),
        [2, 3],
        'should have points #2 and #3 in the view'
      );

      scatterplot.destroy();
    })
  );

  await t2.test(
    'drawAnnotations()',
    catchError(async (t) => {
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

      t.ok(
        getPixelSum(img, 0, w, 0, hp) > 0,
        'The horizontal line should be drawn'
      );

      t.ok(
        getPixelSum(img, w - wp, w, 0, h) > 0,
        'The vertical line should be drawn'
      );

      t.ok(
        getPixelSum(img, wp, 2 * wp, h - hp * 2, h - hp) > 0,
        'The bottom left rectangle should be drawn'
      );

      t.ok(
        getPixelSum(img, wp, 2 * wp, hp, 2 * hp) > 0,
        'The top left rectangle should be drawn'
      );

      t.ok(
        getPixelSum(img, wp - 2 * wp, w - wp, hp, 2 * hp) > 0,
        'The top right polygon should be drawn'
      );

      await scatterplot.clearAnnotations();

      img = scatterplot.export();
      w = img.width;
      h = img.height;
      t.ok(getPixelSum(img, 0, w, 0, h) === 0, 'Annotations should be cleared');

      scatterplot.destroy();
    })
  );
});

/* --------------------------------- Utils ---------------------------------- */

test(
  'isValidBBox()',
  catchError(async (t) => {
    t.equal(
      isValidBBox([1, 2, 3, 4]),
      true,
      'should recognize valid bounding box'
    );
    t.equal(
      isValidBBox([1, 2, 1, 4]),
      false,
      'should recognize invalid bounding box (x range is zero)'
    );
    t.equal(
      isValidBBox([1, 2, 3, 2]),
      false,
      'should recognize invalid bounding box (y range is zero)'
    );
    t.equal(
      isValidBBox([1, Infinity, 3, 2]),
      false,
      'should recognize invalid bounding box (infinity is not allowed)'
    );
    t.equal(
      isValidBBox([1, -Infinity, 3, 2]),
      false,
      'should recognize invalid bounding box (-infinity is not allowed)'
    );
    t.equal(
      isValidBBox([1, Number.NaN, 3, 2]),
      false,
      'should recognize invalid bounding box (NaN is not allowed)'
    );
  })
);

test(
  'isNormFloatArray()',
  catchError(async (t) => {
    t.ok(
      !isNormFloatArray([255, 0, 0, 255]),
      'should not be a normalized RGBA value'
    );
    t.ok(
      !isNormFloatArray([1, 2, 3, 4]),
      'should not be a normalized RGBA value'
    );

    t.ok(isNormFloatArray([0, 0, 0, 0.5]), 'should be a normalized RGBA value');
    t.ok(
      isNormFloatArray([0.5, 1, 0.005, 1]),
      'should be a normalized RGBA value'
    );

    // Inconclusive
    // [0, 0, 0, 1] could be [0, 0, 0, 1] or [0, 0, 0, 1/255]
    t.ok(
      isNormFloatArray([0, 0, 0, 1]),
      'should treat inconclusive RGBA value as a normalized RGBA value'
    );

    // [1, 1, 1, 1] could be [1, 1, 1, 1] or [1/255, 1/255, 1/255, 1/255]
    t.ok(
      isNormFloatArray([1, 1, 1, 1]),
      'should treat inconclusive RGBA value as a normalized RGBA value'
    );
  })
);

test(
  'toRgba()',
  catchError(async (t) => {
    t.equal(toRgba('#ff0000'), [255, 0, 0, 255], 'should convert HEX to RGBA');

    t.equal(
      toRgba('#ff0000', true),
      [1, 0, 0, 1],
      'should convert HEX to normalized RGBA'
    );

    t.equal(
      toRgba([255, 0, 0]),
      [255, 0, 0, 255],
      'should convert RGB to RGBA'
    );

    t.equal(
      toRgba([255, 0, 0], true),
      [1, 0, 0, 1],
      'should convert RGB to normalized RGBA'
    );

    t.equal(
      toRgba([1, 0, 0]),
      [255, 0, 0, 255],
      'should convert normalized RGB to RGBA'
    );

    t.equal(
      toRgba([1, 0, 0], true),
      [1, 0, 0, 1],
      'should convert normalized RGB to normalized RGBA'
    );

    t.equal(
      toRgba([255, 0, 0, 153]),
      [255, 0, 0, 153],
      'should convert RGBA to RGBA'
    );

    t.equal(
      toRgba([153, 0, 0, 153], true),
      [0.6, 0, 0, 0.6],
      'should convert RGBA to normalized RGBA'
    );

    t.equal(
      toRgba([1, 0, 0, 0.6]),
      [255, 0, 0, 153],
      'should convert normalized RGBA to RGBA'
    );

    t.equal(
      toRgba([0, 0, 0, 0.1], true),
      [0, 0, 0, 0.1],
      'should leave normalized RGBA unchanged'
    );
  })
);

test(
  'checkSupport()',
  catchError((t) => {
    t.ok(
      checkSupport() === true || checkSupport() === false,
      'should return a Boolean value'
    );
  })
);
