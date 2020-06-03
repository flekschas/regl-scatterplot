# WebGl 2D Scatterplot with Regl

[![npm version](https://img.shields.io/npm/v/regl-scatterplot.svg)](https://www.npmjs.com/package/regl-scatterplot)
[![node stability](https://img.shields.io/badge/stability-experimental-EC5314.svg)](https://nodejs.org/api/documentation.html#documentation_stability_index)
[![build status](https://travis-ci.org/flekschas/regl-scatterplot.svg?branch=master)](https://travis-ci.org/flekschas/regl-scatterplot)
[![File Size](http://img.badgesize.io/https://unpkg.com/regl-scatterplot/dist/regl-scatterplot.min.js?compression=gzip&color=e17fff)](https://unpkg.com/regl-scatterplot/dist/regl-scatterplot.min.js)
[![code style prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![regl-scatterplot demo](https://img.shields.io/badge/demo-online-6ae3c7.svg)](https://flekschas.github.io/regl-scatterplot/)

> A highly scalable scatterplot rendered with WebGL using [Regl](https://github.com/regl-project/regl)

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
- **Deselect**: Click outside a dot.

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
   0.2, -0.1, 0, 0.1337,
   0.3,  0.1, 0, 0.3371,
  -0.9,  0.8, 1, 0.3713,
]);
```

To color points by category, set `pointColor` to a list of colors. For performance reasons, regl-scatterplot assumes that the category `0` refers to the first color, `1` refers to the second color, etc. Mathematically, regl-scatterplot maps categories to colors as follows: `category => category % colors.length`.

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

<a name="scatterplot.draw" href="#scatterplot.draw">#</a> scatterplot.<b>draw</b>(<i>points</i>)

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
    0.5,
  ],
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

<a name="scatterplot.get" href="#scatterplot.set">#</a> scatterplot.<b>get</b>(<i>property</i>)

**Returns:** one of the properties documented in [`set()`](#scatterplotset)

<a name="scatterplot.set" href="#scatterplot.set">#</a> scatterplot.<b>set</b>(<i>properties = {}</i>)

**Arguments:** `properties` is an object of key-value pairs. The list of all understood properties is given below.

**Properties:**

| Name              | Type            | Default                            | Constraints                            | Settable | Nullifiable |
| ----------------- | --------------- | ---------------------------------- | -------------------------------------- | -------- | ----------- |
| canvas            | object          | `document.createElement('canvas')` |                                        | `false`  | `false`     |
| regl              | object          | `createRegl(canvas)`               |                                        | `false`  | `false`     |
| version           | string          |                                    |                                        | `false`  | `false`     |
| width             | integer         | `300`                              | > 0                                    | `true`   | `false`     |
| height            | integer         | `200`                              | > 0                                    | `true`   | `false`     |
| aspectRatio       | float           | `1.0`                              | > 0                                    | `true`   | `false`     |
| backgroundColor   | string or array | rgba(0, 0, 0, 1)                   | hex, rgb, rgba                         | `true`   | `false`     |
| backgroundImage   | function        | `null`                             | Regl texture                           | `true`   | `true`      |
| cameraTarget      | tuple           | `[0, 0]`                           |                                        | `true`   | `false`     |
| cameraDistance    | float           | `1`                                | > 0                                    | `true`   | `false`     |
| cameraRotation    | float           | `0`                                |                                        | `true`   | `false`     |
| colorBy           | string          | `null`                             | `category` or `value`                  | `true`   | `true`      |
| opacity           | float           | `1`                                | > 0                                    | `true`   | `false`     |
| pointColor        | quadruple       | `[0.66, 0.66, 0.66, 1]`            | single value or list of hex, rgb, rgba | `true`   | `false`     |
| pointColorActive  | quadruple       | `[0, 0.55, 1, 1]`                  | single value or list of hex, rgb, rgba | `true`   | `false`     |
| pointColorHover   | quadruple       | `[1, 1, 1, 1]`                     | single value or list of hex, rgb, rgba | `true`   | `false`     |
| pointOutlineWidth | integer         | `2`                                | >= 0                                   | `true`   | `false`     |
| pointSize         | integer         | `6`                                | > 0                                    | `true`   | `false`     |
| pointSizeSelected | integer         | `2`                                | >= 0                                   | `true`   | `false`     |
| lassoColor        | quadruple       | rgba(0, 0.667, 1, 1)               | hex, rgb, rgba                         | `true`   | `false`     |
| lassoMinDelay     | integer         | 15                                 | >= 0                                   | `true`   | `false`     |
| lassoMinDist      | integer         | 4                                  | >= 0                                   | `true`   | `false`     |
| showRecticle      | boolean         | `false`                            | `true` or `false`                      | `true`   | `false`     |
| recticleColor     | quadruple       | rgba(1, 1, 1, .5)                  | hex, rgb, rgba                         | `true`   | `false`     |

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
  'background-image-ready',
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
});

// Activate recticle and set recticle color to red
scatterplot.set({ showRecticle: true, recticleColor: [1, 0, 0, 0.66] });
```

<a name="scatterplot.select" href="#scatterplot.select">#</a> scatterplot.<b>select</b>()

Select some points, such that they get visually highlighted. This will trigger
a `select` event.

<a name="scatterplot.deselect" href="#scatterplot.deselect">#</a> scatterplot.<b>deselect</b>()

Deselect all selected points. This will trigger a `deselect` event.

<a name="scatterplot.destroy" href="#scatterplot.destroy">#</a> scatterplot.<b>destroy</b>()

Destroys the scatterplot instance by disposing all event listeners, the pubSub
instance, regl, and the camera.

<a name="scatterplot.refresh" href="#scatterplot.refresh">#</a> scatterplot.<b>refresh</b>()

Refreshes the viewport of the scatterplot's regl instance.

<a name="scatterplot.reset" href="#scatterplot.reset">#</a> scatterplot.<b>reset</b>()

Sets the view back to the initially defined view.

<a name="scatterplot.subscribe" href="#scatterplot.subscribe">#</a> scatterplot.<b>unsubscribe</b>(<i>eventName</i>, <i>eventHandler</i>)

Subscribe to an event.

**eventName** needs to be one of the following events:

- `pointover` [payload: `point`]: broadcasted when the mouse cursor is over a point
- `pointout` [payload: `point`]: broadcasted when the mouse cursor moves out of a point
- `select` [payload: `{ points }`]: broadcasted when points are selected
- `deselect` [payload: `undefined`]: broadcasted when points are deselected
- `view` [payload: camera view matrix]: broadcasted when the view changes

**eventHandler** needs to be a callback function that can receive the payload.

<a name="scatterplot.unsubscribe" href="#scatterplot.unsubscribe">#</a> scatterplot.<b>unsubscribe</b>(<i>eventName</i>, <i>eventHandler</i>)

Unsubscribe from an event. See [`scatterplot.subscribe()`](#scatterplot.subscribe) for a list of all
events.

<a name="scatterplot.createTextureFromUrl" href="#scatterplot.createTextureFromUrl">#</a> scatterplot.<b>createTextureFromUrl</b>(<i>url</i>)

**Returns:** a Promise that resolves to a [Regl texture](https://github.com/regl-project/regl/blob/gh-pages/API.md#textures) that can be used, for example, as the [background image](#).

**url:** the URL to an image.
