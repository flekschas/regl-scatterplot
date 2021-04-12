# WebGl 2D Scatterplot with Regl

[![npm version](https://img.shields.io/npm/v/regl-scatterplot.svg?color=1a8cff&style=flat-square)](https://www.npmjs.com/package/regl-scatterplot)
[![build status](https://img.shields.io/github/workflow/status/flekschas/regl-scatterplot/build?color=139ce9&style=flat-square)](https://github.com/flekschas/regl-scatterplot/actions?query=workflow%3Abuild)
[![file size](http://img.badgesize.io/https://unpkg.com/regl-scatterplot/dist/regl-scatterplot.min.js?compression=gzip&color=0dacd4&style=flat-square)](https://bundlephobia.com/result?p=regl-scatterplot)
[![code style prettier](https://img.shields.io/badge/code_style-prettier-06bcbe.svg?style=flat-square)](https://github.com/prettier/prettier)
[![regl-scatterplot demo](https://img.shields.io/badge/demo-online-00cca9.svg?style=flat-square)](https://flekschas.github.io/regl-scatterplot/)

A highly-scalable pan-and-zoomable scatter plot library that uses WebGL through [Regl](https://github.com/regl-project/regl). This library sacrifices feature richness for speed to allow rendering up to **20 million points** (depending on your hardware of course) including fast lasso selection. Further, the [footprint of regl-scatterplot](https://bundlephobia.com/result?p=regl-scatterplot) is kept small. **NEW:** Python lovers please see [jscatter](https://github.com/flekschas/jupyter-scatter): a Jupyter Notebook/Lab widget that uses regl-scatterplot.

<p>
  <img src="https://user-images.githubusercontent.com/932103/62905669-7679f380-bd39-11e9-9528-86ee56d6dfba.gif" />
</p>

**Demo:** https://flekschas.github.io/regl-scatterplot/

**Live playground:** https://observablehq.com/@flekschas/regl-scatterplot

**Default Interactions:**

- **Pan**: Click and drag your mouse.
- **Zoom**: Scroll vertically.
- **Rotate**: While pressing <kbd>ALT</kbd>, click and drag your mouse.
- **Select a dot**: Click on a dot with your mouse.
- **Select multiple dots**:

  - While pressing <kbd>SHIFT</kbd>, click and drag your mouse. All items within the lasso will be selected.
  - Upon activating the lasso initiator (i.e., `lassoInitiator: true`) you can click into the background and a circle will appear under your mouse cursor. Click inside this circle and drag your mouse to start lassoing.
    <details><summary>Click here to see how it works</summary>
    <p>

    ![Lasso Initiator](https://user-images.githubusercontent.com/932103/106489598-f42c4480-6482-11eb-8286-92a9956e1d20.gif)

    </p>
    </details>

- **Deselect**: Double-click onto an empty region.

Note, you can remap `rotate` and `lasso` to other modifier keys via the `keyMap` option!

**Supported Visual Encodings:**

- x/y point position (obviously)
- categorical and continuous color encoding (including opacity)
- categorical and continuous size encoding
- point connections (stemming for example from time series data)

## Install

```
npm i regl-scatterplot
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

#### Color, Opacity, and Size Encoding

In regl-scatterplot, points can be associated with two data values. These two values are defined as the third and forth component of the point quadruples (`[x, y, value, value]`). For instance:

```javascript
scatterplot.draw([
  [0.2, -0.1, 0, 0.1337],
  [0.3, 0.1, 1, 0.3371],
  [-0.9, 0.8, 2, 0.3713],
]);
```

These two values can be visually encoded as the color, opacity, or the size. Values that range between [0, 1] are treated as continuous values. When the value range is in [0, >1] the data is treated as categorical data. In the example above, the first point value would be treated as categorical data and the second would be treated as continuous data.

To encode the two point values use the `colorBy`, `opacityBy`, and `sizeBy` property as follows:

```javascript
scatterplot.set({
  opacityBy: 'valueA',
  sizeBy: 'valueA',
  colorBy: 'valueB',
});
```

In this example we would encode the first categorical point values (`[0, 1, 2]`) as the point opacity and size. The second continuous point values (`[0.1337, 0.3317, 0.3713]`) would be encoded as the point color.

The last thing we need to tell regl-scatterplot is what those point values should be translated to. We do this by specifying a color, opacity, and size map as an array of colors, opacities, and sizes as follows:

```javascript
scatterplot.set({
  pointColor: ['#000000', '#111111', ..., '#eeeeee', '#ffffff'],
  pointSize: [2, 4, 8],
  opacity: [0.5, 0.75, 1],
});
```

You can encode a point data value in multiple ways. For instance, as you can see in the example above, the categorical fist data value is encoded via the point size _and_ opacity.

**What if I have more than two values associated to a point?** Unfortunately, this isn't supported currently. In case you're wondering, this limitation is due to how we store the point data. The whole point state is encoded as an RGBA texture where the x and y coordinate are stored as the red and green color components and the first and second data value are stored in the blue and alpha component of the color. However, this limitation might be addressed in future versions so make sure to check back or, even better, start a pull request!

**Why can't I specify a range function instead of a map?** Until we have implemented enough scale functions in the shader it's easier to let _you_ pre-compute the map. For instance, if you wanted to encode a continuous values on a log scale of point size, you can simply do `pointSize: Array(100).fill().map((v, i) => Math.log(i + 1) + 1)`.

For a complete example see [example/index.js](example/index.js) and [example/size-encoding.js](example/size-encoding.js).

#### Connecting points

You can connect points visually using spline curves by adding a 5th component to your point data and setting `connectPoints: true` when calling `draw()`.

The 5th component is needed to identify which points should be connected. The order of points are connected is defined by the order in which the points appear in your data.

```javascript
const points = [
  [1, 1, 0, 0, 0],
  [2, 2, 0, 0, 0],
  [3, 3, 0, 0, 1],
  [4, 4, 0, 0, 1],
  [5, 5, 0, 0, 0],
];
```

In the example above, the points would be connected in as following:

```
1 -> 2 -> 5
3 -> 4
```

Finally, to visualize the point connection call `scatterplot.set({ showPointConnection: true })`.

For an example see [example/connected-points.js](example/connected-points.js).

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

**Arguments:**

- `property` is a string referencing a [property](#properties).

**Returns:** the property value.

<a name="scatterplot.set" href="#scatterplot.set">#</a> scatterplot.<b>set</b>(<i>properties = {}</i>)

**Arguments:**

- `properties` is an object of key-value pairs. [See below for a list of all properties.](#properties)

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

<a name="scatterplot.export" href="#scatterplot.export">#</a> scatterplot.<b>export</b>(<i>options</i>)

**Arguments:**

- `options` is an object for customizing how to export. See [regl.read()](https://github.com/regl-project/regl/blob/master/API.md#reading-pixels) for details.

**Returns:** an object with three properties: `pixels`, `width`, and `height`. The `pixels` is a `Uint8ClampedArray`.

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

### Properties

You can customize the scatter plot according to the following properties that
can be read and written via [`scatterplot.get()`](#scatterplot.get) and [`scatterplot.set()`](#scatterplot.set).

| Name                                  | Type            | Default                             | Constraints                                                     | Settable | Nullifiable |
| ------------------------------------- | --------------- | ----------------------------------- | --------------------------------------------------------------- | -------- | ----------- |
| canvas                                | object          | `document.createElement('canvas')`  |                                                                 | `false`  | `false`     |
| regl                                  | object          | `createRegl(canvas)`                |                                                                 | `false`  | `false`     |
| syncEvents                            | boolean         | `false`                             |                                                                 | `false`  | `false`     |
| version                               | string          |                                     |                                                                 | `false`  | `false`     |
| width                                 | int or str      | `'auto'`                            | `'auto'` or > 0                                                 | `true`   | `false`     |
| height                                | int or str      | `'auto'`                            | `'auto'` or > 0                                                 | `true`   | `false`     |
| aspectRatio                           | float           | `1.0`                               | > 0                                                             | `true`   | `false`     |
| backgroundColor                       | string or array | rgba(0, 0, 0, 1)                    | hex, rgb, rgba                                                  | `true`   | `false`     |
| backgroundImage                       | function        | `null`                              | Regl texture                                                    | `true`   | `true`      |
| camera                                | object          |                                     | See [dom-2d-camera](https://github.com/flekschas/dom-2d-camera) | `false`  | `false`     |
| cameraTarget                          | tuple           | `[0, 0]`                            |                                                                 | `true`   | `false`     |
| cameraDistance                        | float           | `1`                                 | > 0                                                             | `true`   | `false`     |
| cameraRotation                        | float           | `0`                                 |                                                                 | `true`   | `false`     |
| cameraView                            | Float32Array    | `[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1`] |                                                                 | `true`   | `false`     |
| colorBy                               | string          | `null`                              | See [data encoding](#property-by)                               | `true`   | `true`      |
| sizeBy                                | string          | `null`                              | See [data encoding](#property-by)                               | `true`   | `true`      |
| opacityBy                             | string          | `null`                              | See [data encoding](#property-by)                               | `true`   | `true`      |
| deselectOnDblClick                    | boolean         | `true`                              |                                                                 | `true`   | `false`     |
| deselectOnEscape                      | boolean         | `true`                              |                                                                 | `true`   | `false`     |
| opacity                               | float           | `1`                                 | > 0                                                             | `true`   | `false`     |
| pointColor                            | quadruple       | `[0.66, 0.66, 0.66, 1]`             | single value or list of hex, rgb, rgba                          | `true`   | `false`     |
| pointColorActive                      | quadruple       | `[0, 0.55, 1, 1]`                   | single value or list of hex, rgb, rgba                          | `true`   | `false`     |
| pointColorHover                       | quadruple       | `[1, 1, 1, 1]`                      | single value or list of hex, rgb, rgba                          | `true`   | `false`     |
| pointOutlineWidth                     | int             | `2`                                 | >= 0                                                            | `true`   | `false`     |
| pointSize                             | int             | `6`                                 | > 0                                                             | `true`   | `false`     |
| pointSizeSelected                     | int             | `2`                                 | >= 0                                                            | `true`   | `false`     |
| showPointConnection                   | boolean         | `false`                             |                                                                 | `true`   | `false`     |
| pointConnectionColor                  | quadruple       | `[0.66, 0.66, 0.66, 0.2]`           |                                                                 | `true`   | `false`     |
| pointConnectionColorActive            | quadruple       | `[0, 0.55, 1, 1]`                   |                                                                 | `true`   | `false`     |
| pointConnectionColorHover             | quadruple       | `[1, 1, 1, 1]`                      |                                                                 | `true`   | `false`     |
| pointConnectionColorBy                | string          | `null`                              | See [data encoding](#property-point-conntection-by)             | `true`   | `false`     |
| pointConnectionOpacity                | float           | `0.1`                               |                                                                 | `true`   | `false`     |
| pointConnectionOpacityActive          | float           | `0.66`                              |                                                                 | `true`   | `false`     |
| pointConnectionOpacityBy              | string          | `null`                              | See [data encoding](#property-point-conntection-by)             | `true`   | `false`     |
| pointConnectionSize                   | float           | `2`                                 |                                                                 | `true`   | `false`     |
| pointConnectionSizeActive             | float           | `2`                                 |                                                                 | `true`   | `false`     |
| pointConnectionSizeBy                 | string          | `null`                              | See [data encoding](#property-point-conntection-by)             | `true`   | `false`     |
| pointConnectionMaxIntPointsPerSegment | int             | `100`                               |                                                                 | `true`   | `false`     |
| pointConnectionTolerance              | float           | `0.002`                             |                                                                 | `true`   | `false`     |
| lassoColor                            | quadruple       | rgba(0, 0.667, 1, 1)                | hex, rgb, rgba                                                  | `true`   | `false`     |
| lassoMinDelay                         | int             | 15                                  | >= 0                                                            | `true`   | `false`     |
| lassoMinDist                          | int             | 4                                   | >= 0                                                            | `true`   | `false`     |
| lassoClearEvent                       | string          | `'lassoEnd'`                        | `'lassoEnd'` or `'deselect'`                                    | `true`   | `false`     |
| lassoInitiator                        | boolean         | `false`                             |                                                                 | `true`   | `false`     |
| lassoInitiatorElement                 | object          | the lasso dom element               |                                                                 | `false`  | `false`     |
| lassoInitiatorParentElement           | object          | `document.body`                     |                                                                 | `true`   | `false`     |
| showReticle                           | boolean         | `false`                             | `true` or `false`                                               | `true`   | `false`     |
| reticleColor                          | quadruple       | rgba(1, 1, 1, .5)                   | hex, rgb, rgba                                                  | `true`   | `false`     |
| xScale                                | function        | `null`                              | must follow the D3 scale API                                    | `true`   | `true`      |
| yScale                                | function        | `null`                              | must follow the D3 scale API                                    | `true`   | `true`      |
| keyMap                                | object          | `{ alt: 'rotate', shift: 'lasso' }` | See the notes below                                             | `true`   | `false`     |
| mouseMode                             | string          | `'panZoom'`                         | `'panZoom'`, `'lasso'`, or `'rotate'`                           | `true`   | `false`     |
| performanceMode                       | boolean         | `false`                             | can only be set during initialization!                          | `true`   | `false`     |
| gamma                                 | float           | `1`                                 | to control the opacity blending                                 | `true`   | `false`     |

<a name="property-notes" href="#property-notes">#</a> <b>Notes:</b>

- An attribute is considered _nullifiable_ if it can be unset. Attributes that
  are **not nullifiable** will be ignored if you try to set them to a falsy
  value. For example, if you call `scatterplot.attr({ width: 0 });` the width
  will not be changed as `0` is interpreted as a falsy value.

- By default, the `width` and `height` are set to `'auto'`, which will make the
  `canvas` stretch all the way to the bounds of its clostest parent element with
  `position: relative`. When set to `'auto'` the library also takes care of
  resizing the canvas on `resize` and `orientationchange` events.

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

- If you need to draw more than 2 million points, you might want to set
  `performanceMode` to `true` during the initialization to boost the
  performance. In performance mode, points will be drawn as simple squares and
  color blending is disabled. This should allow you to draw up to 20 million
  points (or more depending on your hardware). Make sure to reduce the
  `pointSize` as you render more and more points (e.g., `0.25` for 20 million
  works for me) to ensure good performance.

<a name="property-by" href="#property-by">#</a> <b>colorBy, opacityBy, sizeBy:</b>

To visual encode one of the two point values set `colorBy`, `opacityBy`, or `sizeBy`
to one of the following values referencing the third or forth component of your
points. To reference the third component you can use `category` (only for
backwards compatibility), `value1`, `valueA`, `valueZ`, or `z`. To reference
the forth component use `value` (only for backwards compatibility), `value2`,
`valueB`, `valueW`, or `w`.

**Density-based opacity encoding:** In addition, the opacity can dynamically be
set based on the point density and zoom level via `opacityBy: 'density'`. As an
example go to [dynamic-opacity.html](https://flekschas.github.io/regl-scatterplot/dynamic-opacity.html).
The implementation is an extension of [Ricky Reusser's awesome notebook](https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds).
Huuuge kudos Ricky! 🙇‍♂️

<a name="property-point-conntection-by" href="#property-point-conntection-by">#</a> <b>pointConnectionColorBy, pointConnectionOpacityBy, and pointConnectionSizeBy:</b>

In addition to the properties understood by [`colorBy`, etc.](#property-by),
`pointConnectionColorBy`, `pointConnectionOpacityBy`, and `pointConnectionSizeBy`
also understand `"inherit"` and `"segment"`. When set to `"inherit"`, the value
will be inherited from its point-specific counterpart. When set to `"segment"`,
each segment of a point connection will be encoded separately. This allows you
to, for instance, color connection by a gradient from the start to the end of
each line.

<a name="property-lassoInitiator" href="#property-lassoInitiator">#</a> <b>lassoInitiator:</b>

When setting `lassoInitiator` to `true` you can initiate the lasso selection
without the need to hold down a modifier key. Simply click somewhere into the
background and a circle will appear under your mouse cursor. Now click into the
circle and drag you mouse to start lassoing. You can additionally invoke the
lasso initiator circle by a long click on a dot.

![Lasso Initiator](https://user-images.githubusercontent.com/932103/106489598-f42c4480-6482-11eb-8286-92a9956e1d20.gif)

You don't like the look of the lasso initiator? No problem. Simple get the DOM
element via `scatterplot.get('lassoInitiatorElement')` and adjust the style
via JavaScript. E.g.: `scatterplot.get('lassoInitiatorElement').style.background = 'green'`.

<a name="property-keymap" href="#property-keymap">#</a> <b>KeyMap:</b>

The `keyMap` property is an object defining which actions are enabled when
holding down which modifier key. E.g.: `{ shift: 'lasso' }`. Acceptable
modifier keys are `alt`, `cmd`, `ctrl`, `meta`, `shift`. Acceptable actions
are `lasso`, `rotate`, and `merge` (for selecting multiple items by merging a series of lasso or click selections).

You can also use the `keyMap` option to disable the lasso selection and rotation
by setting `keyMap` to an empty object.

<a name="property-examples" href="#property-examples">#</a> <b>Examples:</b>

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

// Activate reticle and set reticle color to red
scatterplot.set({ showReticle: true, reticleColor: [1, 0, 0, 0.66] });
```

### Events

| Name                 | Trigger                                    | Payload                            |
| -------------------- | ------------------------------------------ | ---------------------------------- |
| init                 | when the scatter plot is initialized       | `undefined`                        |
| destroy              | when the scatter plot is destroyed         | `undefined`                        |
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
| pointConnectionsDraw | when point connections were drawn          | `undefined`                        |

## Trouble Shooting

#### Resizing the scatterplot

The chances are high that you use the regl-scatterplot in a dynamically-resizable or interactive web-app. Please note that **regl-scatterplot doesn't not automatically resize** when the dimensions of its parent container change. It's your job to keep the size of regl-scatterplot and its parent element in sync. Hence, every time the size of the parent or `canvas` element changed, you have to call:

```javascript
const { width, height } = canvas.getBoundingClientRect();
scatterplot.set({ width, height });
```

#### Using regl-scatterplot with Vue

Related to the resizing, when conditionally displaying regl-scatterplot in Vue you might have to update the `width` and `height` when the visibility is changed. See [issue #20](https://github.com/flekschas/regl-scatterplot/issues/20#issuecomment-639377810) for an example.
