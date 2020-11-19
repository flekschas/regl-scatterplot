# WebGl 2D Scatterplot with Regl

[![npm version](https://img.shields.io/npm/v/regl-scatterplot.svg)](https://www.npmjs.com/package/regl-scatterplot)
[![node stability](https://img.shields.io/badge/stability-experimental-EC5314.svg)](https://nodejs.org/api/documentation.html#documentation_stability_index)
[![build status](https://travis-ci.org/flekschas/regl-scatterplot.svg?branch=master)](https://travis-ci.org/flekschas/regl-scatterplot)
[![File Size](http://img.badgesize.io/https://unpkg.com/regl-scatterplot/dist/regl-scatterplot.min.js?compression=gzip&color=e17fff)](https://unpkg.com/regl-scatterplot/dist/regl-scatterplot.min.js)
[![code style prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![regl-scatterplot demo](https://img.shields.io/badge/demo-online-6ae3c7.svg)](https://flekschas.github.io/regl-scatterplot/)

> A highly-scalable pan-and-zoomable scatter plot rendered with WebGL using [Regl](https://github.com/regl-project/regl). This library sacrifices feature richness for speed to allow rendering up to 2 million points (depending on your hardware of course) including fast lasso selection. Also, the [footprint of regl-scatterplot](https://bundlephobia.com/result?p=regl-scatterplot) is kept to a minimum.

<p>
  <img src="https://user-images.githubusercontent.com/932103/62905669-7679f380-bd39-11e9-9528-86ee56d6dfba.gif" />
</p>

**Demo:** https://flekschas.github.io/regl-scatterplot/

**Live playground:** https://observablehq.com/@flekschas/regl-scatterplot

**Interactions:**

- **Pan**: Click and drag your mouse.
- **Zoom**: Scroll vertically.
- **Rotate**: While pressing <kbd>ALT</kbd>, click and drag your mouse.
- **Select a single dot**: Click on a dot with your mouse.
- **Select multiple dots**: While pressing <kbd>SHIFT</kbd>, click and drag your mouse. All items within the lasso will be selected.
- **Deselect**: Double-click onto an empty region.

## Install

```
npm -i regl-scatterplot
```

## Getting started

#### Basic Example

```javascript
import createScatterplot from 'regl-scatterplot';

const canvas = document.querySelector('#canvas');

const { width, height } = canvas.getBoundingClientRect();

const scatterplot = createScatterplot({
  canvas,
  width,
  height,
  pointSize: 5,
});

const points = new Array(10000)
  .fill()
  .map(() => [-1 + Math.random() * 2, -1 + Math.random() * 2, color]);

scatterplot.draw(points);
```

#### Color by value or category

Regl-scatterplot supports two color modes: coloring by value or coloring by category. To support those, each point can be associated to a categorical and continuous value. To specify those values simply append two additional values to a point quadruples: e.g., `[x, y, category, value]`.

```javascript
scatterplot.draw([
  // x, y, category, value
  [0.2, -0.1, 0, 0.1337],
  [0.3, 0.1, 0, 0.3371],
  [-0.9, 0.8, 1, 0.3713],
]);
```

To color points by category, set `pointColor` to an array of colors. For performance reasons, regl-scatterplot assumes that the category `0` refers to the first color, `1` refers to the second color, etc. Mathematically, regl-scatterplot maps categories to colors as follows: `category => category % colors.length`.

```javascript
const colorsCat = ['#3a78aa', '#aa3a99'];
scatterplot.set({ colorBy: 'category', pointColor: colorsCat });
```

To apply a continuous colormap use `colorBy: 'value'` and set `pointColor` to a list of colors representing the colormap. For performance reasons, regl-scatterplot assumes that the values are in `[0,1]` . Mathematically, the maping functions is as follows: `value => Math.min(1, Math.max(0, value))`.

```javascript
const blackToWhite = ['#000000', ..., '#ffffff'];
scatterplot.set({ colorBy: 'value', pointColor: blackToWhite });
```

For a complete example see [example/index.js](example/index.js).

#### Size by value or category

Similar to [coloring by value or category](#color-by-value-or-category), you can encode the value or category as the point size.

```javascript
scatterplot.draw([
  // x, y, category, value
  [0.2, -0.1, 0, 0.1337],
  [0.3, 0.1, 1, 0.3371],
  [-0.9, 0.8, 2, 0.3713],
]);
```

To color points by category, set `pointSize` to an array of sizes. For performance reasons, regl-scatterplot assumes that the category `0` refers to the first size, `1` refers to the second size, etc.

```javascript
const pointSize = [2, 4, 6];
scatterplot.set({ sizeBy: 'category', pointSize: colorsCat });
```

To apply _"continuous"_ point sizes use `sizeBy: 'value'` and set `pointSize` to a precomputed array of point sizes. For performance reasons, regl-scatterplot assumes that the values are in `[0,1]` .

```javascript
const pointSize = Array(100)
  .fill()
  .map((v, i) => i + 1);
scatterplot.set({ sizeBy: 'value', pointSize });
```

For a complete example see [example/size-encoding.js](example/size-encoding.js).

#### Synchronize D3 x and y scales with the scatterplot view

Under the hood regl-scatterplot uses a [2D camera](https://github.com/flekschas/dom-2d-camera), which you can either get via `scatterplot.get('camera')` or `scatterplot.subscribe('view', ({ camera }) => {})`. You can use the camera's `view` matrix to compute the x and y scale domains. However, since this is tedious, regl-scatterplot allows you to specify D3 x and y scales that will automatically be synchronized. For example:

```javascript
const xScale = scaleLinear().domain([0, 42]);
const yScale = scaleLinear().domain([-5, 5]);

const scatterplot = createScatterplot({
  canvas,
  width,
  height,
  xScale,
  yScale,
});
```

Now whenever you pan or zoom, the domains of `xScale` and `yScale` will be updated according to your current view. Note, the ranges are automatically set to the width and height of your `canvas` object.

For a complete example with D3 axes see [example/axes.js](example/axes.js).

## API

### Constructors

<a name="createScatterplot" href="#createScatterplot">#</a> <b>createScatterplot</b>(<i>options = {}</i>)

**Returns:** a new scatterplot instance.

**Options:** is an object that accepts any of the [settable properties](scatterplot.set). Additionally, you can set the following properties:

- `regl` a Regl instance to be used for rendering.
- `canvas` background color of the scatterplot.

<a name="createRegl" href="#createRegl">#</a> <b>createRegl</b>(<i>canvas</i>)

**Returns:** a new Regl instance with appropriate extensions being enabled.

**Canvas:** the canvas object on which the scatterplot will be rendered on.

<a name="createTextureFromUrl" href="#createTextureFromUrl">#</a> <b>createTextureFromUrl</b>(<i>regl</i>, <i>url</i>)

_DEPRECATED! Use [`scatterplot.createTextureFromUrl()`](#scatterplot.createTextureFromUrl) instead._

### Methods

<a name="scatterplot.draw" href="#scatterplot.draw">#</a> scatterplot.<b>draw</b>(<i>points</i>, <i>options</i>)

Sets and draws `points`. Note that repeatedly calling this method without specifying `points` will not clear previously set points. To clear points use [`scatterplot.clear()`](#scatterplot.clear)

**Arguments:**

- `points` is an array of quadruples defining the point data. Each quadruple must be of the form `[x, y, category, value]` where `category` and `value` are optional and can be used for [color encoding](#color-by-value-or-category) or [size encoding](#size-by-value-or-category).
- `options` is an object with the following properties:
  - `transition` [default: `false`]: if `true` and if the current number of points equals `points.length`, the current points will be transitioned to the new points
  - `transitionDuration` [default: `500`]: the duration in milliseconds over which the transition should occur
  - `transitionEasing` [default: `cubicInOut`]: the easing function, which determines how intermediate values of the transition are calculated

**Returns:** a Promise object that resolves once the points have been drawn or transitioned.

**Examples:**

```javascript
const points = [
  [
    // The relative X position in normalized device coordinates
    0.9,
    // The relative Y position in normalized device coordinates
    0.3,
    // The category, which defaults to `0` if `undefined`
    0,
    // A continuous value between [0,1], which defaults to `0` if `undefined`
    0.5,
  ],
];

scatterplot.draw(points);

// You can now do something else like changing the point size etc.

// Lets redraw the scatterplot. Since `draw` is caching the points you don't
// have to specify the points here again if they didn't change.
scatterplot.draw();

// If we want to animate the transition of our point from above to another
// x,y position, we can also do this by drawing a new point while enableing
// transition via the `options` argument.
scatterplot.draw([[0.6, 0.6, 0, 0.6]], { transition: true });

// Lets actively unset the points. Since `draw()` assumes that you want to
// redraw existing points you have to actively pass in an empty array.
// Alternatively, call `scatterplot.clear()`
scatterplot.draw([]);
```

<a name="scatterplot.clear" href="#scatterplot.clear">#</a> scatterplot.<b>clear</b>()

Clears previously drawn points.

<a name="scatterplot.get" href="#scatterplot.set">#</a> scatterplot.<b>get</b>(<i>property</i>)

**Returns:** one of the properties documented in [`set()`](#scatterplotset)

<a name="scatterplot.set" href="#scatterplot.set">#</a> scatterplot.<b>set</b>(<i>properties = {}</i>)

**Arguments:**

- `properties` is an object of key-value pairs. The list of all understood properties is given below.

**Properties:**

| Name               | Type            | Default                             | Constraints                                                     | Settable | Nullifiable |
| ------------------ | --------------- | ----------------------------------- | --------------------------------------------------------------- | -------- | ----------- |
| canvas             | object          | `document.createElement('canvas')`  |                                                                 | `false`  | `false`     |
| regl               | object          | `createRegl(canvas)`                |                                                                 | `false`  | `false`     |
| syncEvents         | boolean         | `false`                             |                                                                 | `false`  | `false`     |
| version            | string          |                                     |                                                                 | `false`  | `false`     |
| width              | integer         | `300`                               | > 0                                                             | `true`   | `false`     |
| height             | integer         | `200`                               | > 0                                                             | `true`   | `false`     |
| aspectRatio        | float           | `1.0`                               | > 0                                                             | `true`   | `false`     |
| backgroundColor    | string or array | rgba(0, 0, 0, 1)                    | hex, rgb, rgba                                                  | `true`   | `false`     |
| backgroundImage    | function        | `null`                              | Regl texture                                                    | `true`   | `true`      |
| camera             | object          |                                     | See [dom-2d-camera](https://github.com/flekschas/dom-2d-camera) | `false`  | `false`     |
| cameraTarget       | tuple           | `[0, 0]`                            |                                                                 | `true`   | `false`     |
| cameraDistance     | float           | `1`                                 | > 0                                                             | `true`   | `false`     |
| cameraRotation     | float           | `0`                                 |                                                                 | `true`   | `false`     |
| cameraView         | Float32Array    | `[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1`] |                                                                 | `true`   | `false`     |
| colorBy            | string          | `null`                              | `category` or `value`                                           | `true`   | `true`      |
| sizeBy             | string          | `null`                              | `category` or `value`                                           | `true`   | `true`      |
| deselectOnDblClick | boolean         | `true`                              |                                                                 | `true`   | `false`     |
| deselectOnEscape   | boolean         | `true`                              |                                                                 | `true`   | `false`     |
| opacity            | float           | `1`                                 | > 0                                                             | `true`   | `false`     |
| pointColor         | quadruple       | `[0.66, 0.66, 0.66, 1]`             | single value or list of hex, rgb, rgba                          | `true`   | `false`     |
| pointColorActive   | quadruple       | `[0, 0.55, 1, 1]`                   | single value or list of hex, rgb, rgba                          | `true`   | `false`     |
| pointColorHover    | quadruple       | `[1, 1, 1, 1]`                      | single value or list of hex, rgb, rgba                          | `true`   | `false`     |
| pointOutlineWidth  | integer         | `2`                                 | >= 0                                                            | `true`   | `false`     |
| pointSize          | integer         | `6`                                 | > 0                                                             | `true`   | `false`     |
| pointSizeSelected  | integer         | `2`                                 | >= 0                                                            | `true`   | `false`     |
| lassoColor         | quadruple       | rgba(0, 0.667, 1, 1)                | hex, rgb, rgba                                                  | `true`   | `false`     |
| lassoMinDelay      | integer         | 15                                  | >= 0                                                            | `true`   | `false`     |
| lassoMinDist       | integer         | 4                                   | >= 0                                                            | `true`   | `false`     |
| lassoClearEvent    | string          | `'lassoEnd'`                        | `'lassoEnd'` or `'deselect'`                                    | `true`   | `false`     |
| showRecticle       | boolean         | `false`                             | `true` or `false`                                               | `true`   | `false`     |
| recticleColor      | quadruple       | rgba(1, 1, 1, .5)                   | hex, rgb, rgba                                                  | `true`   | `false`     |
| xScale             | function        | `null`                              | must follow the D3 scale API                                    | `true`   | `true`      |
| yScale             | function        | `null`                              | must follow the D3 scale API                                    | `true`   | `true`      |

**Notes:**

- An attribute is considered _nullifiable_ if it can be unset. Attributes that
  are **not nullifiable** will be ignored if you try to set them to a falsy
  value. For example, if you call `scatterplot.attr({ width: 0 });` the width
  will not be changed as `0` is interpreted as a falsy value.

- The background of the scatterplot is transparent, i.e., you have to control
  the background with CSS! `background` is used when drawing the
  outline of selected points to simulate the padded border only.

- The background image must be a Regl texture. To easily set a remote
  image as the background please use [`createTextureFromUrl`](#const-texture--createTextureFromUrlregl-url-isCrossOrigin).

- The scatterplot understan 4 colors per color representing 4 states, representing:

  - normal (`pointColor`): the normal color of points.
  - active (`pointColorActive`): used for coloring selected points.
  - hover (`pointColorHover`): used when mousing over a point.
  - background (`backgroundColor`): used as the background color.

- Points can currently by colored by _category_ and _value_.

- The size of selected points is given by `pointSize + pointSizeSelected`

- By default, events are published asynchronously to decouple regl-scatterplot's
  execution flow from the event consumer's process. However, you can enable
  synchronous event broadcasting at your own risk via
  `createScatterplot({ syncEvents: true })`. This property can't be changed
  after initialization!

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

// Set background color to red
scatterplot.set({ backgroundColor: '#00ff00' }); // hex string
scatterplot.set({ backgroundColor: [255, 0, 0] }); // rgb array
scatterplot.set({ backgroundColor: [255, 0, 0, 1.0] }); // rgba array
scatterplot.set({ backgroundColor: [1.0, 0, 0, 1.0] }); // normalized rgba

// Set background image to an image
scatterplot.set({ backgroundImage: 'https://server.com/my-image.png' });
// If you need to know when the image was loaded you have two options. First,
// you can listen to the following event
scatterplot.subscribe(
  'backgroundImageReady',
  () => {
    console.log('Background image is now loaded and rendered!');
  },
  1
);
// or you load the image yourself as follows
const backgroundImage = await scatterplot.createTextureFromUrl(
  'https://server.com/my-image.png'
);
scatterplot.set({ backgroundImage });

// Color by
scatterplot.set({ colorBy: 'category' });

// Set color map
scatterplot.set({
  pointColor: ['#ff0000', '#00ff00', '#0000ff'],
  pointColorActive: ['#ff0000', '#00ff00', '#0000ff'], // optional
  pointColorHover: ['#ff0000', '#00ff00', '#0000ff'], // optional
});

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
scatterplot.set({
  lassoColor: [1, 1, 1, 1],
  lassoMinDelay: 0,
  lassoMinDist: 1,
  // This will keep the drawn lasso until the selected points are deselected
  lassoClearEvent: 'deselect',
});

// Activate recticle and set recticle color to red
scatterplot.set({ showRecticle: true, recticleColor: [1, 0, 0, 0.66] });
```

<a name="scatterplot.select" href="#scatterplot.select">#</a> scatterplot.<b>select</b>(<i>points</i>, <i>options = {}</i>)

Select some points, such that they get visually highlighted. This will trigger a `select` event unless `options.preventEvent === true`.

**Arguments:**

- `points` is an array of point indices.
- `options` [optional] is an object with the following properties:
  - `preventEvent`: if `true` the `select` will not be published.

**Examples:**

```javascript
// Let's say we have three points
scatterplot.draw([
  [0.1, 0.1],
  [0.2, 0.2],
  [0.3, 0.3],
]);

// To select the first and second point we have to do
scatterplot.select([0, 1]);
```

<a name="scatterplot.deselect" href="#scatterplot.deselect">#</a> scatterplot.<b>deselect</b>(<i>options = {}</i>)

Deselect all selected points. This will trigger a `deselect` event unless `options.preventEvent === true`.

**Arguments:**

- `options` [optional] is an object with the following properties:
  - `preventEvent`: if `true` the `deselect` will not be published.

<a name="scatterplot.destroy" href="#scatterplot.destroy">#</a> scatterplot.<b>destroy</b>()

Destroys the scatterplot instance by disposing all event listeners, the pubSub
instance, regl, and the camera.

<a name="scatterplot.refresh" href="#scatterplot.refresh">#</a> scatterplot.<b>refresh</b>()

Refreshes the viewport of the scatterplot's regl instance.

<a name="scatterplot.reset" href="#scatterplot.reset">#</a> scatterplot.<b>reset</b>()

Sets the view back to the initially defined view.

<a name="scatterplot.subscribe" href="#scatterplot.subscribe">#</a> scatterplot.<b>subscribe</b>(<i>eventName</i>, <i>eventHandler</i>)

Subscribe to an event.

**Arguments:**

- `eventName` needs to be [a valid event name](#events).
- `eventHandler` needs to be a callback function that can receive the payload.

**Returns:** an unsubscriber object that can be passed into [`unsubscribe()`](#scatterplot.unsubscribe).

<a name="scatterplot.unsubscribe" href="#scatterplot.unsubscribe">#</a> scatterplot.<b>unsubscribe</b>(<i>eventName</i>, <i>eventHandler</i>)

Unsubscribe from an event. See [`scatterplot.subscribe()`](#scatterplot.subscribe) for a list of all
events.

<a name="scatterplot.createTextureFromUrl" href="#scatterplot.createTextureFromUrl">#</a> scatterplot.<b>createTextureFromUrl</b>(<i>url</i>)

**Returns:** a Promise that resolves to a [Regl texture](https://github.com/regl-project/regl/blob/gh-pages/API.md#textures) that can be used, for example, as the [background image](#).

**url:** the URL to an image.

### Events

| Name                 | Trigger                                    | Payload                            |
| -------------------- | ------------------------------------------ | ---------------------------------- |
| backgroundImageReady | when the background image was loaded       | `undefined`                        |
| pointOver            | when the mouse cursor is over a point      | pointIndex                         |
| pointOut             | when the mouse cursor moves out of a point | pointIndex                         |
| select               | when points are selected                   | `{ points }`                       |
| deselect             | when points are deselected                 | `undefined`                        |
| view                 | when the view has changes                  | `{ camera, view, xScale, yScale }` |
| draw                 | when the plot was drawn                    | `{ camera, view, xScale, yScale }` |
| lassoStart           | when the lasso selection has started       | `undefined`                        |
| lassoExtend          | when the lasso selection has extended      | `{ coordinates }`                  |
| lassoEnd             | when the lasso selection has ended         | `{ coordinates }`                  |
| transitionStart      | when points started to transition          | `undefined`                        |
| transitionEnd        | when points ended to transition            | `createRegl(canvas)`               |

## Trouble Shooting

#### Resizing the scatterplot

The chances are high that you use the regl-scatterplot in a dynamically-resizable or interactive web-app. Please note that **regl-scatterplot doesn't not automatically resize** when the dimensions of its parent container change. It's your job to keep the size of regl-scatterplot and its parent element in sync. Hence, every time the size of the parent or `canvas` element changed, you have to call:

```javascript
const { width, height } = canvas.getBoundingClientRect();
scatterplot.set({ width, height });
```

#### Using regl-scatterplot with Vue

Related to the resizing, when conditionally displaying regl-scatterplot in Vue you might have to update the `width` and `height` when the visibility is changed. See [issue #20](https://github.com/flekschas/regl-scatterplot/issues/20#issuecomment-639377810) for an example.
