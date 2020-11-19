## Next

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
