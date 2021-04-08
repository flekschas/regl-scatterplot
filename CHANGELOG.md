## Next

## v0.18.1

- Rename `showRecticle` to `showReticle` and `recticleColor` to `reticleColor` (#47)

## v0.18.0

- Add density-based dynamic point opacity via `opacityBy: 'density'`. See
  [dynamic-opacity.html](https://flekschas.github.io/regl-scatterplot/dynamic-opacity.html) for an example.

## v0.17.1

- Add [`scatterplot.export`](README.md#scatterplot.export) for exporting the current view as pixels.
- Add default canvas width/height (`'auto'`) to fix an issue on high-dpi monitors that do not style the canvas element (#41)
- Add resize handler so when width/height is set to `'auto'` the canvas element is automatically resized on `resize` and `orientationchange` events.
- Improve framebuffer rendering and add `gamma` prop to allow controlling the opacity blending (#42)

## v0.17.0

- Add the ability to color point connections by their segment via `pointConnectionColorBy: 'segment'`
- Fix an issue with normalizing RGB(A) values
- Avoid the unnecessary use of the logical-assignment-operators (#39)

## v0.16.2

- Stop calling `camera.refresh()` as that is unnecessary since `v1.2.2`
- Avoid empty lasso events
- Fix incorrectly initialized `pointConnectionColorBy`, `pointConnectionOpacityBy`, and `pointConnectionSizeBy`
- Fix an issue with the color conversion to RGBA
- Fix an issue blurring an active point connection

## v0.16.1

- Allow inheriting `pointConnectionColor` from `pointColor` by setting `pointConnectionColor: 'inherit'`. Same for `pointConnectionColorActive` and `pointConnectionColorHover`.
- Fix incorrectly initialized `opacity`
- Fix incorrectly initialized `colorBy`, `opacityBy`, and `sizeBy`
- Fix not assigned `pointConnectionOpacity`
- Rename `pointConnectionOpacitySelection` and `pointConnectionSizeSelected` to `pointConnectionOpacityActive` and `pointConnectionSizeActive` for consistency

## v0.16.0

- Allow the point-associated data values to be either categorical or continuous instead of enforcing one to be categorical and the other one to be continuous. For continuous data, assign [0,1]-normalized data as the third or forth component of a point. For categorical data, assign an integer-based data. For instance, if a point looks `[1, 2, 3, 4]` we assume that the first (`3`) and second (`4`) data value is categorical. If you would instead have points like `[1, 2, 0.33, 0.44]` where the third and forth component are within [0,1] then we would assume that those components represent continuous data. For backward compatibility, `colorBy: 'category'` refers to coloring by the third component and `colorBy 'value'` refers to the forth component. Additionall, you can now reference the third components via `value1`, `valueA`, `valueZ`, or `z` and the forth component via`value2`, `valueB`, `valueW`, or `w`.

- Add the ability to connect points visually via `draw(points, { connectPoints: true })`. This assumes that your points have a 5th component that identifies the point connection. Currently the order of points as they appear in `points` defines the order of how they would be connected. So assuming you have:

  ```javascript
  // prettier-ignore
  scatterplot.draw([
    1, 1, 0, 0, 0,
    2, 2, 0, 0, 0,
    3, 3, 0, 0, 1,
    4, 4, 0, 0, 1,
    5, 5, 0, 0, 0,
  ], { connectPoints: true });
  ```

  Then we would connext the points as follows:

  ```
  1 -> 2 -> 5
  3 -> 4
  ```

  For an example see [example/connected-points.js](example/connected-points.js).

- Add support for multi-selections by holding down <kbd>CMD</kbd> (by default) during click- or lasso-selections. The modifier key for multi-selections can be adjusted via `scatterplot.set({ keyMap: { merge: 'ctrl' } })`
- Add `performanceMode` to allow drawing up to 20 million points
- Add `opacityBy` to allow encoding one of the two data properties as the point opacity.

- Fix an issue with the point size between devices with different pixel ratios
- Fix an issue with detecting points when using variable point sizes
- Fix an issue that drew the background image before it was loaded

**Breaking changes:**

- Removed the following deplicated properties:
  - `background` (use `backgroundColor` instead)
  - `distance` (use `cameraDistance` instead)
  - `rotation` (use `cameraRotation` instead)
  - `target` (use `cameraTarget` instead)
  - `view` (use `cameraView` instead)

## v0.15.1

- Make sure the `keyMap` is properly initiated.
- Fix a memory leak by properly destroying the camera on `scatterplot.destroy()`.
- Add test for rotation, key mapping, and the lasso initiator

## v0.15.0

- Add `mouseMode` for switching betweem mouse modes programmatically. Currently supported modes are `panZoom`, `lasso`, and `rotate`.
- Add `keyMap` for remapping modifier key-induced actions. Available modifier keys are `alt`, `shift`, `ctrl`, `cmd`, and `meta`. Available actions are `lasso` and `rotate`.
- Add `lassoInitiator` (boolean) for enabling a way to lasso points without having to use a modifier key. When activated, you can click into the void and a circle will appear. You can then start lassoing by mousing down + holding onto the circle and dragging. Since clicking into the void can be challenging when working with many points you can also long clicking anywhere and the circle for initiating the lasso will appear anywhere.
- Improve point selection

## v0.14.0

- Add `lassoStart`, `lassoExtend`, and `lassoEnd` events

**Breaking changes:**

- Renamed event `background-image-ready` to `backgroundImageReady` for consistency
- Switched to asynchronously broadcasted events to decouple regl-scatterplot's execution flow from the event handler. You can switch back to the old behavior if you like by initializing the scatterplot via `createScatterplot({ syncEvents: true })`

## v0.13.0

- Add support for transitioning points via `scatterplot.draw(updatedPoints, { transition: true})`
- Add support for size encoding the points' category or value via `scatterplot.set({ sizeBy })`

## v0.12.0

- Add `deselectOnDblClick` and `deselectOnEscape` to allow disabling deselection on double click or escape when set to `false` (#31)
- Fix an issue updating the x and y scale domains (#30)

## v0.11.0

- Allow synchronizing D3 x and y scales with the scatterplot view. See [README.md](README.md#synchronize-d3-x-and-y-scales-with-the-scatterplot-view) for more details. (#29)

## v0.10.1

- Make sure `backgroundImage` supports base64-encoded images
- Fix missing texture destruction before recreating the texture (#22)

## v0.10.0

- Add `lassoClearEvent` property to allow customizing when the lasso is cleared.
- Add `preventEvent` option to `scatterplot.select()` and `scatterplot.deselect()` to prevent publishing the `select` and `deselect` events
- Add Promise-based return value to `scatterplot.draw()` to enable the parent application to determine when the points were drawn
- Add support for `get('lassoMinDelay')` and `get('lassoMinDist')`

## v0.9.1

- Only listen on mouse down events within the instance's canvas element (#16)

## v0.9.0

- Renames `target`, `distance`, `rotation`, and `view` to `cameraTarget`, `cameraDistance`, `cameraRotation`, and `cameraView`
- Add getter and setter for `cameraTarget`, `cameraDistance`, `cameraRotation`, and `cameraView`
- Fix setting initial camera position (#15)
- Improve documentation on how to color points (#14)

## v0.8.0

- Add background to lasso
- Fix horizontally-flipped background image (#13)
- Rename the `background` property to `backgroundColor` for clarity
- Split the `colors` property into `pointColor`, `pointColorActive`, and `pointColorHover` for clarity
- Update camera

## v0.7.6

- Increase floating point precision
- Fix #5

## v0.7.5

- Add `clear()` to clear the scatter plot
- Update the camera on refresh
- Fix issue when drawing new points: do not wrap setting new points with withRaf(). Only wrap the pure draw call!
- Fix a regression from removed scroll library

## v0.7.4

- Increase floating point precision (#5)
- Fix a rare glitch in the lasso selection where the lasso would be drawn with a far away point
- Smoothify lasso by lowering the min delay and min dist
- Update 2D camera and many dev packages
- Remove the minified ESM build as it's unnecessary

## v0.7.3

- Fix glitch in the npm release of `v0.7.2`.

## v0.7.2

- Provide proper ESM instead of pointing to the source code.

## v0.7.1

- Replaced `hover` event with `pointover` and `pointout` to be able to know when a point is not hovered anymore.

## v0.7.0

- Allow changing the lasso smoothness via `set({ lassoMinDelay, lassoMinDist })` where `lassoMinDelay` is the minimum number of milliseconds between mousemove events before the lasso is extended and `lassoMinDist` is the minimum number of pixels the mouse has to move.

## v0.6.0

- Simplify API: `style()`, `attr()`, `scatterplot.canvas`, `scatterplot.regl`, and `scatterplot.version` are merged into `get()` and `set()`. The function signature is identical to `style()` and `attr()` so all you have to do is rename.
- Add recticle. It's not shown by default but can be activated with `set({ showRecticle, recticleColor })`.
- Fix a regression that caused interrupted panning

## v0.5.1

- Fix a bug in categorical color encoding

## v0.5.0

- Set default aspect ratio to 1. It can be changed via `attr({ aspectRatio })`
- Add property to set `lassoColor` via `style({ lassoColor })`
- Expose helper (`createTextureFromUrl`) for creating a texture from an image URL
- Expose regl instance via `scatterplot.regl`
- Replace `mouse-position` and `mouse-pressed` with internal code
- Avoid click selections upon mousedown + mousemove + mouseup
- Add tests for all public API endpoints
- Fix several smaller bugs

## v0.4.0

- Use a combination of linear and log2 scaling for point size
- Add support for background images
- Add API documentation
- Switch to single quotes
- Export version

## v0.3.3

- Add endpoint for changing the background color
- Allow setting view on initialization
- Remove event listeners on `destroy()`
- Rename `camera` event to `view` and publish the view matrix
- Fix issues with setting colors
- Fix resetting view

## v0.3.2

- Update third party libraries
- Switch to browser-based tests
- Set more strict linting

## v0.3.1

- Fix nasty floating point issue when working with large textures (> 100.000 points)
- Make point size dependent on zoom level

## v0.3.0

- Optimize rendering: up to about 500K points render fine. Usable for up to 1M points.
- Add support for one categories and one value per point for color encoding.
- Add visual outline for selected points for better highlighting.
- Add test setup and some base tests.
- Many bug fixes and under the hood improvements.

## v0.2.0

- Add fast lasso selection
- Support rotations

## v0.1.0

- Initial working version. **Warning:** this version is not optimized yet and only works fluidly for up to 50.000 points.
