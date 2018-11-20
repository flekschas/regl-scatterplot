export const POINT_SIZE = 6;
export const POINT_SIZE_SELECTED = 2;
export const POINT_OUTLINE_WIDTH = 2;
export const WIDTH = 100;
export const HEIGHT = 100;
export const COLORMAP = [];
export const TARGET = [0, 0];
export const DISTANCE = 1;
export const ROTATION = 0;
export const VIEW = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
]);
export const COLOR_NORMAL = [0.66, 0.66, 0.66, 1];
export const COLOR_ACTIVE = [0, 0.55, 1, 1];
export const COLOR_HOVER = [1, 1, 1, 1];
export const COLOR_BG = [0, 0, 0, 1];
export const COLORS = [COLOR_NORMAL, COLOR_ACTIVE, COLOR_HOVER, COLOR_BG];

export default {
  POINT_SIZE,
  POINT_SIZE_SELECTED,
  POINT_OUTLINE_WIDTH,
  WIDTH,
  HEIGHT,
  COLORMAP,
  TARGET,
  DISTANCE,
  ROTATION,
  COLOR_NORMAL,
  COLOR_HOVER,
  COLOR_BG,
  COLORS
};
