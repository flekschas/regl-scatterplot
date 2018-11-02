/* eslint no-console: 1 */

import test from "tape";
import browserEnv from "browser-env";
import createRegl from "regl";

browserEnv();

// Fake RAF which is used by the scatterplot
window.requestAnimationFrame = f => f();

import createScatterplot from "../src";
import DEFAULT from "../src/defaults";

import createCanvas from "./create-canvas";

test("creates a Regl instance with a fake canvas element with a webgl context", t => {
  t.plan(3);

  const dim = 200;
  const canvas = createCanvas(dim, dim);
  const gl = canvas.getContext("webgl");

  t.ok(gl.drawingBufferWidth === dim, `width should be ${dim}px`);
  t.ok(gl.drawingBufferHeight === dim, `height should be ${dim}px`);

  const regl = createRegl({ canvas });

  t.ok(!!regl, "regl should be instanciated");
});

test("creates scatterplot with default values", t => {
  t.plan(7);

  const canvas = createCanvas(200, 200);
  const scatterplot = createScatterplot({ canvas });

  t.ok(scatterplot.canvas === canvas, "canvas object should equal");
  t.ok(
    scatterplot.colors === DEFAULT.COLORS,
    "scatterplot should have default colors"
  );
  t.ok(
    scatterplot.pointSize === DEFAULT.POINT_SIZE,
    "scatterplot should have default point size"
  );
  t.ok(
    scatterplot.pointSizeSelected === DEFAULT.POINT_SIZE_SELECTED,
    "scatterplot should have default selected point size"
  );
  t.ok(
    scatterplot.pointOutlineWidth === DEFAULT.POINT_OUTLINE_WIDTH,
    "scatterplot should have default point outline width"
  );
  t.ok(
    scatterplot.width === DEFAULT.WIDTH,
    "scatterplot should have default width"
  );
  t.ok(
    scatterplot.height === DEFAULT.HEIGHT,
    "scatterplot should have default height"
  );
});

test("creates colormap", t => {
  t.plan(4);

  const canvas = createCanvas(200, 200);
  const scatterplot = createScatterplot({ canvas });

  const rgba6 = [
    [0.22745098039215686, 0.47058823529411764, 0.6666666666666666, 1],
    [0, 0.5529411764705883, 1, 1],
    [0, 0.5529411764705883, 1, 1],
    [0, 0, 0, 1],
    [0.6666666666666666, 0.22745098039215686, 0.6, 1],
    [1, 0, 0.8549019607843137, 1],
    [1, 0, 0.8549019607843137, 1],
    [0, 0, 0, 1]
  ];

  const rgba2 = [
    [0, 0.5529411764705883, 1, 1],
    [0, 0.5529411764705883, 1, 1],
    [0, 0.5529411764705883, 1, 1],
    [0, 0, 0, 1],
    [1, 0, 0.8549019607843137, 1],
    [1, 0, 0.8549019607843137, 1],
    [1, 0, 0.8549019607843137, 1],
    [0, 0, 0, 1]
  ];

  const rgba2a = [
    [0, 0.5529411764705883, 1, 0.4980392156862745],
    [0, 0.5529411764705883, 1, 0.4980392156862745],
    [0, 0.5529411764705883, 1, 0.4980392156862745],
    [0, 0, 0, 1],
    [1, 0, 0.8549019607843137, 0.4980392156862745],
    [1, 0, 0.8549019607843137, 0.4980392156862745],
    [1, 0, 0.8549019607843137, 0.4980392156862745],
    [0, 0, 0, 1]
  ];

  scatterplot.colors = [
    ["#3a78aa", "#008dff", "#008dff"],
    ["#aa3a99", "#ff00da", "#ff00da"]
  ];

  t.ok(
    scatterplot.colors.every((color, i) =>
      color.every((c, j) => c === rgba6[i][j])
    ),
    "should create 8 normalized RGBAs from 6 HEX"
  );

  scatterplot.colors = ["#008dff", "#ff00da"];

  t.ok(
    scatterplot.colors.every((color, i) =>
      color.every((c, j) => c === rgba2[i][j])
    ),
    "should create 8 normalized RGBAs from 2 HEX"
  );

  scatterplot.colors = [[0, 141, 255], [255, 0, 218]];
  t.ok(
    scatterplot.colors.every((color, i) =>
      color.every((c, j) => c === rgba2[i][j])
    ),
    "should create 8 normalized RGBAs from 2 non-normalized RGB"
  );

  scatterplot.colors = [[0, 141, 255, 127], [255, 0, 218, 127]];
  t.ok(
    scatterplot.colors.every((color, i) =>
      color.every((c, j) => c === rgba2a[i][j])
    ),
    "should create 8 normalized RGBAs from 2 non-normalized RGBAs"
  );
});
