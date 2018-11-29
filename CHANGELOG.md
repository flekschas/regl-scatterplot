**v0.4.0**

- Use a combination of linear and log2 scaling for point size
- Add support for background images
- Add API documentation
- Switch to single quotes
- Export version

**v0.3.3**

- Add endpoint for changing the background color
- Allow setting view on initialization
- Remove event listeners on `destroy()`
- Rename `camera` event to `view` and publish the view matrix
- Fix issues with setting colors
- Fix resetting view

**v0.3.2**

- Update third party libraries
- Switch to browser-based tests
- Set more strict linting

**v0.3.1**

- Fix nasty floating point issue when working with large textures (> 100.000 points)
- Make point size dependent on zoom level

**v0.3.0**

- Optimize rendering: up to about 500K points render fine. Usable for up to 1M points.
- Add support for one categories and one value per point for color encoding.
- Add visual outline for selected points for better highlighting.
- Add test setup and some base tests.
- Many bug fixes and under the hood improvements.

**v0.2.0**

- Add fast lasso selection
- Support rotations

**v0.1.0**

- Initial working version. **Warning:** this version is not optimized yet and only works fluidly for up to 50.000 points.
