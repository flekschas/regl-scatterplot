# WebGl 2D Scatterplot with Regl

[![npm version](https://img.shields.io/npm/v/regl-scatterplot.svg)](https://www.npmjs.com/package/regl-scatterplot)
[![node stability](https://img.shields.io/badge/stability-experimental-EC5314.svg)](https://nodejs.org/api/documentation.html#documentation_stability_index)
[![build status](https://travis-ci.org/flekschas/regl-scatterplot.svg?branch=master)](https://travis-ci.org/flekschas/regl-scatterplot)
[![code style prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![regl-scatterplot demo](https://img.shields.io/badge/demo-online-6ae3c7.svg)](https://flekschas.github.io/regl-scatterplot/)

> A highly scalable scatterplot rendered with WebGL using [Regl](https://github.com/regl-project/regl)

<p>
  <img src="https://user-images.githubusercontent.com/932103/62905669-7679f380-bd39-11e9-9528-86ee56d6dfba.gif" />
</p>

**Demo:** https://flekschas.github.io/regl-scatterplot/

**Interactions:**

- **Pan**: Click and drag your mouse.
- **Zoom**: Scroll vertically.
- **Rotate**: While pressing <kbd>ALT</kbd>, click and drag your mouse.
- **Select a single dot**: Click on a dot with your mouse.
- **Select multiple dots**: While pressing <kbd>SHIFT</kbd>, click and drag your mouse. All items within the lasso will be selected.
- **Deselect**: Click outside a dot.

## Install

```
npm -i regl-scatterplot
```

## Getting started

```javascript
import createScatterplot from 'regl-scatterplot';

const canvas = document.querySelector('#canvas');

const { width, height } = canvas.getBoundingClientRect();

const scatterplot = createScatterplot({
  canvas,
  width,
  height,
  pointSize: 5
});

const points = new Array(10000)
  .fill()
  .map(() => [-1 + Math.random() * 2, -1 + Math.random() * 2, color]);

scatterplot.draw(points);
```

See a complete example at [example/index.js](example/index.js).

## API

### Constructors

#### `const scatterplot = createScatterplot(options)`

**Returns:** a new scatterplot instance.

**Options:** is an object that accepts the following properties:

- `regl` a Regl instance to be used for rendering.
- `background` background color of the scatterplot.
- `backgroundImage` background image for the scatterplot. This must be a [regl texture object](https://github.com/regl-project/regl/blob/gh-pages/API.md#textures).
- `canvas` canvas element.
- `colors` colormap.
- `pointSize` size of the points.
- `pointSizeSelected` additional size of the points when being selected. I.e., if set to `0` selected and deselect points have the same size.
- `pointOutlineWidth` width of the point outline when a point is being selected.
- `width` width of the canvas element.
- `height` height of the canvas element.
- `target` location that the camera should look at.
- `distance` distance of the camera to the target.
- `rotation` rotation of the camera around the target.
- `view` view matrix defining `target`, `distance`, and `rotation`. When given `target`, `distance`, and `rotation` are ignored.

#### `const regl = createRegl(canvas)`

**Returns:** a new Regl instance with appropriate extensions being enabled.

**Canvas:** the canvas object on which the scatterplot will be rendered on.

#### `const texture = createTextureFromUrl(regl, url, isCrossOrigin)`

**Returns:** a new [Regl texture](https://github.com/regl-project/regl/blob/gh-pages/API.md#textures) from a remote image.

**regl:** the Regl instance associated to your scatterplot instance. Either use [`createRegl()`](#const-regl--createreglcanvas) or `scatterplot.regl`;

**url:** the URL to an image.

**isCrossOrigin:** if `url` is pointing to another origin `isCrossOrigin` must be set to `true`.

### Methods

#### `scatterplot.draw(points)`

Sets and draws `points`, which must be an array of points where a point is interpreted as a quadruple of form `[x, y, category, value]`.

**Examples:**

```javascript
const points = [
  [
    // The X position
    2,
    // The Y position
    1,
    // The category, which defaults to `0` if `undefined`
    0,
    // Some value, which defaults to `0` if `undefined`
    0.5
  ]
];

scatterplot.draw(points);

// You can now do something else like changing the point size etc.

// Lets redraw the scatterplot. Since `draw` is caching the points you don't
// have to specify the points here again if they didn't change.
scatterplot.draw();

// Lets actively unset the points. Since `draw()` assumes that you want to
// redraw existing points you have to actively pass in an empty array
scatterplot.draw([]);
```

#### `scatterplot.canvas`

The canvas element on which the scatterplot is rendered.

#### `scatterplot.regl`

The Regl instance which renderes the scatterplot.

#### `scatterplot.version`

The version number of the scatterplot.

#### `scatterplot.get(property)`

**Returns:** one of the properties documented in [`set()`](#scatterplotset)

#### `scatterplot.set(properties)`

**Arguments:** `properties` is an object of key-value pairs. The list of all understood properties is given below.

**Properties:**

| Name              | Type            | Default                            | Constraints            | Settable | Nullifiable |
| ----------------- | --------------- | ---------------------------------- | ---------------------- | -------- | ----------- |
| canvas            | object          | `document.createElement('canvas')` |                        | `true`   | `false`     |
| regl              | object          | `createRegl(canvas)`               |                        | `true`   | `false`     |
| version           | string          |                                    |                        | `false`  | `false`     |
| width             | number          | `300`                              | > 0                    | `true`   | `false`     |
| height            | number          | `200`                              | > 0                    | `true`   | `false`     |
| aspectRatio       | number          | `1.0`                              | > 0                    | `true`   | `false`     |
| background        | string or array | rgba(0,0,0,1)                      | hex, rgb, rgba         | `true`   | `false`     |
| backgroundImage   | function        | `null`                             | Regl texture           | `true`   | `true`      |
| colorBy           | string          | `null`                             | `category` or `value`  | `true`   | `true`      |
| colors            | array           | _see below_                        | list of hex, rgb, rgba | `true`   | `false`     |
| opacity           | number          | `1`                                | > 0                    | `true`   | `false`     |
| pointOutlineWidth | number          | `2`                                | >= 0                   | `true`   | `false`     |
| pointSize         | number          | `6`                                | > 0                    | `true`   | `false`     |
| pointSizeSelected | number          | `2`                                | >= 0                   | `true`   | `false`     |
| lassoColor        | array           | rgba(0, 0.667, 1, 1)               | hex, rgb, rgba         | `true`   | `false`     |
| lassoMinDelay     | number          | 15                                 | >= 0                   | `true`   | `false`     |
| lassoMinDist      | number          | 4                                  | >= 0                   | `true`   | `false`     |
| showRecticle      | boolean         | `false`                            | `true` or `false`      | `true`   | `false`     |
| recticleColor     | array           | rgba(1,1,1,.5)                     | hex, rgb, rgba         | `true`   | `false`     |

**Notes:**

- An attribute is considered _nullifiable_ if it can be unset. Attributes that
  are **not nullifiable** will be ignored if you try to set them to a falsy
  value. For example, if you call `scatterplot.attr({ width: 0 });` the width
  will not be changed as `0` is interpreted as a falsy value.

- The background of the scatterplot is transparent, i.e., you have to control
  the background with CSS! `background` is used when drawing the
  outline of selected points to simulate the padded border only.

- The background image must be a Regl texture function. To easily set a remote
  image as the background please use [`createTextureFromUrl`](#const-texture--createTextureFromUrlregl-url-isCrossOrigin).

- The scatterplot stores 4 colors per color representing 4 states, representing:

  - normal: used by default [default: `[0.66, 0.66, 0.66, 1]`]
  - active: used when selecting a point [default: `[0, 0.55, 1, 1]`]
  - hover: used when mousing over a point _not implemented yet_ [default: `[1, 1, 1, 1]`]
  - background: used as the background color [default: `[0, 0, 0, 1]`]

  When defining colors you can either pass in a flat array of _normal_ colors
  and regl-scatterplot will fill in the rest or you provide a list of quadruples
  where each quadruple defines the colors for all 4 states.

- Points can currently by colored by _category_ and _value_.

- The size of selected points is given by `pointSize + pointSizeSelected`

**Examples:**

```javascript
// Set width and height
scatterplot.set({ width: 300, height: 200 });

// get width
const width = scatterplot.get('width');

// Set the aspect ratio of the scatterplot. This aspect ratio is referring to
// your data source and **not** the aspect ratio of the canvas element! By
// default it is assumed that your data us following a 1:1 ratio and this ratio
// is preserved even if your canvas element has some other aspect ratio. But if
// you wanted you could provide data that's going from [0,2] in x and [0,1] in y
// in which case you'd have to set the aspect ratio as follows to `2`.
scatterplot.set({ aspectRatio: 2.0 });

// Set background color red
scatterplot.set({ background: '#00ff00' });
scatterplot.set({ background: [255, 0, 0] });
scatterplot.set({ background: [255, 0, 0, 1.0] });
scatterplot.set({ background: [1, 0, 0, 1.0] }); // normalized rgba

// Set background image to an image with the same origin
scatterplot.set({ backgroundImage: 'my-image.png' });
// Set background image to an image with a different origin
scatterplot.set({ backgroundImage: { src: 'https://server.com/my-image.png', crossOrigin: true } });
// Set background image to some regl texture
const image = new Image();
image.src = 'my-image.png';
image.onload = () => { scatterplot.set({ backgroundImage: regl.texture(image) });

// Color by
scatterplot.set({ colorBy: 'category' });

// Set color map
scatterplot.set({ colors: ['#ff0000', '#00ff00', '#0000ff'] });

// Set base opacity
scatterplot.set({ opacity: 0.5 });

// Set the width of the outline of selected points
scatterplot.set({ pointOutlineWidth: 2 });

// Set the base point size
scatterplot.set({ pointSize: 10 });

// Set the additional point size of selected points
scatterplot.set({ pointSizeSelected: 2 });

// Change the lasso color and make it very smooth, i.e., do not wait before
// extending the lasso (i.e., `lassoMinDelay = 0`) and extend the lasso when
// the mouse moves at least 1 pixel
scatterplot.set({ lassoColor: [1, 1, 1, 1], lassoMinDelay: 0, lassoMinDist: 1 });

// Activate recticle and set recticle color to red
scatterplot.set({ showRecticle: true, recticleColor: [1, 0, 0, 0.66] });
```

#### `scatterplot.select(points)`

Select some points, such that they get visually highlighted. This will trigger
a `select` event.

#### `scatterplot.deselect()`

Deselect all selected points. This will trigger a `deselect` event.

#### `scatterplot.destroy()`

Destroys the scatterplot instance by disposing all event listeners, the pubSub
instance, regl, and the camera.

#### `scatterplot.refresh()`

Refreshes the viewport of the scatterplot's regl instance.

#### `scatterplot.reset()`

Sets the view back to the initially defined view.

#### `scatterplot.subscribe(eventName, eventHandler)`

Subscribe to an event.

**eventName** needs to be one of the following events:

- `pointover` [payload: `point`]: broadcasted when the mouse cursor is over a point
- `pointout` [payload: `point`]: broadcasted when the mouse cursor moves out of a point
- `select` [payload: `{ points }`]: broadcasted when points are selected
- `deselect` [payload: `undefined`]: broadcasted when points are deselected
- `view` [payload: camera view matrix]: broadcasted when the view changes

**eventHandler** needs to be a callback function that can receive the payload.

#### `scatterplot.unsubscribe(eventName, eventHandler)`

Unsubscribe from an event. See [`scatterplot.subscribe()`](#scatterplot.subscribe) for a list of all
events.
