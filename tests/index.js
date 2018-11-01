/* eslint no-console: 1 */

import test from "tape";
import browserEnv from "browser-env";
import createRegl from "regl";

browserEnv();

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

  const dim = 200;
  const canvas = createCanvas(dim, dim);
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
