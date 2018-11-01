import test from "tape";
import browserEnv from "browser-env";
import createRegl from "regl";

// import createScatterplot from "../src";
// import DEFAULT from '../src/defaults';

import createCanvas from "./create-canvas";

browserEnv();

test("creates a Regl instance with a fake canvas element with a webgl context", t => {
  t.plan(3);

  const canvas = createCanvas(200, 200);
  const gl = canvas.getContext("webgl");

  t.ok(gl.drawingBufferWidth === 200);
  t.ok(gl.drawingBufferHeight === 200);

  const regl = createRegl({ canvas });

  t.ok(!!regl);
});

// test("creates scatterplot with default values", t => {
//   t.plan(7);

//   const canvas = createCanvas(200, 200);
//   const scatterplot = createScatterplot({ canvas });

//   t.ok(scatterplot.canvas === canvas);

//   t.ok(scatterplot.colorMap === DEFAULT.COLOR_MAP);
//   t.ok(scatterplot.pointSize === DEFAULT.POINT_SIZE);
//   t.ok(scatterplot.pointSizeSelected === DEFAULT.POINT_SIZE_SELECTED);
//   t.ok(scatterplot.pointOutlineWidth === DEFAULT.POINT_OUTLINE_WIDTH);
//   t.ok(scatterplot.width === DEFAULT.WIDTH);
//   t.ok(scatterplot.height === DEFAULT.HEIGHT);
// });
