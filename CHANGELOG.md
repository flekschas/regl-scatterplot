## 1.14.1

- Fix: ensure view aspect ratio is updated before the scales are updated on resize

## 1.14.0

- Feat: expose a flag indicating a view change for events `draw`, `drawing`, and `view`
- Fix: clean up worker URL after creation

## 1.13.2

- Fix: replace the even-odd rule based with the non-zero winding rule for `isPointInPolygon()` to correctly handle overlapping/looping selections. Previosuly points that would fall within the overlapping area would falsely be excluded from the selection instead of being included.
- Fix: Smooth the brush normal to avoid jitter

## 1.13.1

- Fix: an issue where new colors wouldn't be set properly ([#214](https://github.com/flekschas/regl-scatterplot/issues/214))

## 1.13.0

- Feat: add support for two new lasso types: `'rectangle'` and `'brush'`. The lasso type can be changed via `lassoType`. Additionally, for the brush lasso, you can adjust the brush size via `lassoBrushSize`. The default lasso type is `'freeform'`. ([#186](https://github.com/flekschas/regl-scatterplot/issues/186))
- Feat: replace `keyMap` with `actionKeyMap` to allow triggering multiple actions with the same modifier key.
- Feat: add `'remove'` key action to allow removing selecting points. By default, to rgitemove selected points hold down `ALT` and then lasso around selected points. ([#105](https://github.com/flekschas/regl-scatterplot/issues/105))
- Feat: expose `renderPointsAsSquares` and `disableAlphaBlending` to allow finer control over performance increasing settings ([#206](https://github.com/flekschas/regl-scatterplot/issues/206))

## 1.12.1

- Fix: prevent drawing points if all are filtered out ([#201](https://github.com/flekschas/regl-scatterplot/issues/201))
- Fix: destroy the encoding texture before recreating it
- Fix: reject `set()` calls if the instance was destroyed
- Fix: ensures unnecessary color and encoding texture updates are avoided
- Fix: color and encoding textures are destroyed upon calling `scatterplot.destroy()`
- Fix: prevent a minor memory leak in the newly added advanced exporter

## 1.12.0

- Feat: add support for adjusting the anti-aliasing via `scatterplot.set({ antiAliasing: 1 })`. ([#175](https://github.com/flekschas/regl-scatterplot/issues/175))
- Feat: add support for aligning points with the pixel grid via `scatterplot.set({ pixelAligned: true })`. ([#175](https://github.com/flekschas/regl-scatterplot/issues/175))
- Feat: enhance `scatterplot.export()` by allowing to adjust the scale, anti-aliasing, and pixel alignment. Note that when customizing the render setting for export, the function returns a promise that resolves into `ImageData`.
- Feat: expose `resize()` method of the `renderer`.

## 1.11.4

- Fix: allow setting the lasso long press indicator parent element

## 1.11.3

- Fix: catch another edge case where `zoomToOrigin` was unsetting the camera fixed state

## 1.11.2

- Fix: handle camera fixing better by adding a dedicated prop called `cameraIsFixed`. Previously, the lasso end interaction would unset the camera fixing. ([#94](https://github.com/flekschas/regl-scatterplot/issues/94))

## 1.11.1

- Fix: ensure that the drawing order of points cannot be manipulated via `scatterplot.filter()` ([#197](https://github.com/flekschas/regl-scatterplot/issues/197))

## 1.11.0

- Feat: add support for linear and constant point scaling via a new property called `pointScaleMode`.

## 1.10.4

- Fix: restrict the renderer's canvas to be at most as large as the screen. Previously we had the canvas size bound to `window.innerWidth` and `window.innerHeight`. However, in VSCode it was possible that `window.innerHeight` was muuuuch larger than the actual screen, which in turn caused a WebGL error (invalid renderbuffer size). This issues was first reported at https://github.com/flekschas/jupyter-scatter/issues/37.

## 1.10.3

- Fix: properly set mouse mode on initialization and add tests for it

## 1.10.2

- Fix: expose x start/end and y start/end for horizontal and vertical line annotations.
- Fix: ensure KDBush worker works in prod build

## 1.10.1

- Fix: ensure single annotations render properly ([#187](https://github.com/flekschas/regl-scatterplot/issues/187))

## 1.10.0

- Feat: add support for annotations via `scatterplot.drawAnnotations()`

## 1.9.6

- Fix: try ensure `zoomToArea` works in cases where `aspectRatio` is not equal to `1` and add tests to verify this

## 1.9.5

- Fix: option types of `zoomToLocation`, `zoomToOrigin`, `zoomToArea`
- Fix: ensure `zoomToArea` works in cases where `aspectRatio` is not equal to `1`

## 1.9.4

- Fix: `scatterplot.draw(newPoints, { preventFilterReset })` should preserves the filter ([Jupyter-Scatter#134](https://github.com/flekschas/jupyter-scatter/issues/134))
- Fix: `scatterplot.hover(filteredOutPoint)` should not trigger a hover event

## 1.9.3

- Fix: point connection initial color map
- Fix: allow point connection color to be set to `inherit` (to inherit the point color)

## 1.9.2

- Fix: update `regl-line` to include a critical bug fix related to drawing connected points.

## 1.9.1

- Fix: add missing type definition for `scatterplot.get('spatialIndex')` ([#179](https://github.com/flekschas/regl-scatterplot/issues/179))

## 1.9.0

- Add: allow to retrieve KDBush's spatial index via `scatterplot.get('spatialIndex')`. The index refers to KDBush v4.0.2.
- Add: allow to pass a spatial index to `scatterplot.draw(newPoints, { spatialIndex })` to circumvent the indexing of `newPoints`. This can be useful when only the z or w coordinates of `newPoints` differ to previously drawn points or when you've computed the spatial index upfront.
- Add: run the computation of the spatial index in a worker when the number of points is larger or equal to one million. This behavior can be adjusted during the instantiation of the scatterplot via `createScatterplot({ spatialIndexUseWorker })`. If `true`, regl-scatterplot will always compute the spatial index in a worker. If `false`, regl-scatterplot will always compute the spatial index in the main browser thread.
- Add: export `createSpatialIndex` to allow creating a spatial index upfront conveniently
- Add: new `drawing` event that is _always fired synchronously_ before the end of a draw call. This event is useful for drawing other things as part of an animation frame. The main difference to the default `draw` event is that the `draw` event is fired asynchronously (like all other events) after the draw call such that the draw call itself isn't blocked.
- Fix: pass `{ camera, view, xScale, yScale }` as the payload of the `draw` event as specified in the docs.
- Fix: allow `scatterplot.set({ showPointConnections: true })` before points were drawn [#171](https://github.com/flekschas/regl-scatterplot/issues/171)
- Fix: pub-sub related types by updating `pub-sub-es` to version 3

## 1.8.5

- Fix: add `d3-scale` types as a dev dependency [#153](https://github.com/flekschas/regl-scatterplot/issues/153)
- Fix: run CI workflows on Ubuntu to ensure the `sed` replacement call works properly [#153](https://github.com/flekschas/regl-scatterplot/issues/153)

## 1.8.4

- Fix a regression with the point opacity introduced in [v1.7.1](#1.7.1)

## 1.8.3

- Fix typo in draw option type (renamed `focus` to `filter`) [#148](https://github.com/flekschas/regl-scatterplot/issues/148)

## 1.8.2

- Improve hover detection

## 1.8.1

- Fix: add ability to set `aspectRatio` in the constructor
- Fix: add missing type definition for `aspectRatio`
- Fix: extend `opacity` type to correctly allow `number[]`

## 1.8.0

- Add `scatterplot.getScreenPosition(pointIdx)` to retrieve the screen position of a point by its index.

## 1.7.1

- Improve data type inference of the z/w values and allow to explicitely specify their data type via `draw(newPoints, { zDataType: 'categorical', wDataType: 'continuous' })`

## 1.7.0

- Add `preventFilterReset` option to `draw()` to allow re-drawing while keeping the current point filter. [#136](https://github.com/flekschas/regl-scatterplot/pull/136)
- Add ability to hover, select, and filter points immediately when calling `draw(points, { hover: 0, select: [1, 2], filter: [0, 2, 3] })`. Immediately hovering, selecting, or filtering points avoids a filter that can occur when first drawing points and then hovering, selecting, or filtering points subsequently. [#142](https://github.com/flekschas/regl-scatterplot/pull/142)
- Add missing `filteredPoints` type definition. [#139](https://github.com/flekschas/regl-scatterplot/pull/139)
- Add missing `selectedPoints` type definition.
- Fix drawing a single connecting line between points [#125](https://github.com/flekschas/regl-scatterplot/issues/125)
- Fix drawing a single point connection [#141](https://github.com/flekschas/regl-scatterplot/pull/141)
- Fix `draw()`'s promise resolution when `showPointConnections` is `true`. The promise is now resolved after both, the points and point connections, have been drawn.
- Set minimum Node version to `16` and minimum npm version to `7`. You might still be able to use `regl-scatterplot` with older version but it's not advised.

## 1.6.10

- Fix `scatterplot.destroy()` to properly remove all event listeners bound during instance creation. [#135](https://github.com/flekschas/regl-scatterplot/pull/135)

## v1.6.9

- Fix empty `select([])` handling [#132](https://github.com/flekschas/regl-scatterplot/issues/132)

## v1.6.8

- Fix `filter()` to allow filtering out all points [#122](https://github.com/flekschas/regl-scatterplot/issues/122)
- Add `isPointsFiltered` to `get()` to allow determining if any points have been filtered out

## v1.6.7

- Fix `zoomToPoints` behavior when points are not initialized [#123](https://github.com/flekschas/regl-scatterplot/issues/123)
- Add `isDestroyed` and `isPointsDrawn` to `get()`

## v1.6.6

- Improve type annotations of the `select` event ([#119](https://github.com/flekschas/regl-scatterplot/issues/119))
- Add type annotations for the `filter` and `unfilter` events

## v1.6.5

- Fix typing issue related to `subscribe()` ([#117](https://github.com/flekschas/regl-scatterplot/issues/117))

## v1.6.4

- Fix a point hovering issue ([#112](https://github.com/flekschas/regl-scatterplot/issues/112))

## v1.6.3

- Fix an issue with repeated zooming to points
- Improve lasso on long press start

## v1.6.2

- Fix a build regression from updating to Rollup v3

## v1.6.1

- Update third party libraries
- Improve lasso long press indicator styling
- Fix an issue where a lasso with less than three control points

## v1.6.0

- Add the ability to filter down points via `scatterplot.filter(pointIdxs)`. This can be useful if you need to temporarily need to hide points without having to re-instantiate the regl-scatterplot instance. E.g., when calling `scatterplot.filter([0, 1, 2])`, only the first, second, and third point will remain visible. All other points (and their related point connections) will be visually and interactively hidden.

  To reset the filter call `scatterplot.unfilter()` or `scatterplot.filter([])`.

  https://user-images.githubusercontent.com/932103/222810324-3e048176-fd1d-4ede-a836-511c548f09ff.mp4

- Add the ability to retrieve selected and filtered point indices via `scatterplot.get('selectedPoints')` and `scatterplot.get('filteredPoints')` respectively.

## v1.5.1

- Refactor lasso manager to support SSR ([#101](https://github.com/flekschas/regl-scatterplot/issues/101))
- Fix a glitch where the scatterplot instance is destroyed after a `scatterplot.draw()` was called but before `scatterplot.draw()` finished. ([#101](https://github.com/flekschas/regl-scatterplot/issues/101))

## v1.5.0

- Add the ability to lasso select point upon long press via `scatterplot.set('lassoOnLongPress', true)`.
- Fix type issues ([#98](https://github.com/flekschas/regl-scatterplot/issues/98))

## v1.4.2

- Enforce the canvas width and height to be at least 1px to prevent view operations from breaking.

## v1.4.1

- Bump `dom-2d-camera` to publish view updates on camera tweens ([#95](https://github.com/flekschas/regl-scatterplot/issues/95))

## v1.4.0

- Add zooming via the following four methods. All four methods supported animated transition just like `draw()`.
  1. `scatterplot.zoomToLocation(target, distance)` for zooming to a specific point location
  2. `scatterplot.zoomToArea(rectangle)` for zooming to an area specified by a rectangular bounding box
  3. `scatterplot.zoomToPoints(pointIndices)` for zooming to a set of points
  4. `scatterplot.zoomToOrigin()` for zooming to the origin

## v1.3.2

- Add `scatterplot.isSupported` and `renderer.isSupported` as read-only properties to expose if all GL extensions are supported and enabled in the user's browser (#90)
- Add `checkSupport()` as a globally exported function for users to check if their browser supports and has enabled all required GL extensions (#90)

## v1.3.1

- Add a missing `select` event name to the type definition (#87)

## v1.3.0

- Add properties `opacityInactiveScale` and `opacityInactiveMax` to enable de-emphasizing unselected points and highlight selected points. The final point opacity is now set to `min(opacityInactiveMax, currentOpacity) * opacityInactiveScale` when at least one point is selected. By default `opacityInactiveScale` and `opacityInactiveMax` are set to `1`. I.e., the default behavior did not change.

## v1.2.3

- Properly initialize new x/y scales upon calling `set()`

## v1.2.2

- Fix a minor issue in `destroy()` that prevented disconnecting resize listeners

## v1.2.1

- Update dom-2d-camera to fix internal tests

## v1.2.0

- Outsource WebGL renderer to improve instancing: You can now use a single shared WebGL renderer (via `createRenderer()`) to power multiple scatter plot instances. See https://flekschas.github.io/regl-scatterplot/multiple-instances.html.
- Add `scatterplot.redraw()` to enforce a redrawing of the scene. This can be necessary when you manually updated the camera.
- Add `scatterplot.view(cameraView, { preventEvent })` as a shorthand for setting the scatter plot's camera view. The `preventEvent` option enables synchronizing multiple scatter plot instances. See https://flekschas.github.io/regl-scatterplot/multiple-instances.html.
- Allow passing typed arrays to `scatterplot.draw({ x, y, z, w })`.

**Breaking changes:**

- `scatterplot.export()` is now returning an [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object for better utility.

## v1.1.1

- Fix incorrect opacity handling (#74)

## v1.1.0

- Add `scatterplot.get('pointsInView')` to retrieve the indices of the points currently visible within the view (#72). Shoutout to [@dulex123](https://github.com/dulex123) for his PR!
- Add `scatterplot.get('points')` to retrieve all currently drawn points.
- Add an example for demonstrating how labels can be rendered. The demo using `scatterplot.get('pointsInView')` to determine when to render text labels. See https://flekschas.github.io/regl-scatterplot/text-labels.html

## v1.0.0

Woohoo 🥳 It's time to release v1! Nothing dramatic changed in this release but I felt that the library/API is now stable enough. Also, a big shoutout to [@manzt](https://github.com/manzt) and [@japrescott](https://github.com/japrescott) for their PRs.

- Support drawing columnar data `scatterplot.draw({ x: [...], y: [...], ... })` (#59)
- Fix the rendering issue with with Safari 14 (#45)
- Replace webpack with vite (#64)

## v0.19.2

- Fix an issue with not properly publishing the pointout event (#58)

## v0.19.1

- Simplify drawing loop by using `regl.frame` and bailing out of when nothing needs to be redrawn
- Update regl-line to be compatible with regl v2

## v0.19.0

- Ensure inter buffers and viewports are properly updated on every draw call.

**Breaking changes:**

- Improve the handling of the connection order by switching from a structured 5th component to a 6th component.

  Previously to provide a specific order, the 5th component had to be a tuple of `[lineComponentId, orderIndex]`. With this update the 5th component will always just be `lineComponentId` and the 6th will be `orderIndex`.

## v0.18.7

- Avoid text selection when lassoing

## v0.18.6

- Optimize density-based opacity encoding

## v0.18.5

- Fix an issue with the lasso position when the page is scrollable (#50)

## v0.18.4

- Fix an issues when programmatically trying to `select()` or `hover()` non-existing points

## v0.18.3

- Harmonize `hover(pointIdx, { showReticleOnce, preventEvent })` with `select()` API by allowing it to prevent the `pointover` and `pointout` from being published.

## v0.18.2

- Add two events: `init` and `destroy`
- Add `lassoLineWidth` to allow adjusting the lasso line width
- Fix an issue with normalizing RGBA values
- Fix a camera issue when lassoing in non-`panZoom` mouse mode

## v0.18.1

- Rename `showRecticle` to `showReticle` and `recticleColor` to `reticleColor` (#47)
- Fix reticle glitches by updating `regl-line` (#46)

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
