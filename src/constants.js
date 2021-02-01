import {
  cubicIn,
  cubicInOut,
  cubicOut,
  linear,
  quadIn,
  quadInOut,
  quadOut,
} from '@flekschas/utils';

export const COLOR_ACTIVE_IDX = 1;
export const COLOR_BG_IDX = 3;
export const COLOR_HOVER_IDX = 2;
export const COLOR_NORMAL_IDX = 0;
export const COLOR_NUM_STATES = 4;
export const FLOAT_BYTES = Float32Array.BYTES_PER_ELEMENT;
export const GL_EXTENSIONS = ['OES_standard_derivatives', 'OES_texture_float'];

// Easing
export const EASING_FNS = {
  cubicIn,
  cubicInOut,
  cubicOut,
  linear,
  quadIn,
  quadInOut,
  quadOut,
};
export const DEFAULT_EASING = cubicInOut;

// Default lasso
export const LASSO_CLEAR_ON_DESELECT = 'deselect';
export const LASSO_CLEAR_ON_END = 'lassoEnd';
export const LASSO_CLEAR_EVENTS = [LASSO_CLEAR_ON_DESELECT, LASSO_CLEAR_ON_END];
export const DEFAULT_LASSO_MIN_DELAY = 10;
export const DEFAULT_LASSO_MIN_DIST = 3;
export const DEFAULT_LASSO_CLEAR_EVENT = LASSO_CLEAR_ON_END;

// Default attribute
export const DEFAULT_DATA_ASPECT_RATIO = 1;
export const DEFAULT_WIDTH = 100;
export const DEFAULT_HEIGHT = 100;

// Default styles
export const DEFAULT_POINT_SIZE = [6];
export const DEFAULT_POINT_SIZE_SELECTED = 2;
export const DEFAULT_POINT_OUTLINE_WIDTH = 2;
export const DEFAULT_SIZE_BY = null;

// Default colors
export const DEFAULT_COLORMAP = [];
export const DEFAULT_COLOR_BY = null;
export const DEFAULT_COLOR_NORMAL = [0.66, 0.66, 0.66, 1];
export const DEFAULT_COLOR_ACTIVE = [0, 0.55, 1, 1];
export const DEFAULT_COLOR_HOVER = [1, 1, 1, 1];
export const DEFAULT_COLOR_BG = [0, 0, 0, 1];

// Default view
export const DEFAULT_TARGET = [0, 0];
export const DEFAULT_DISTANCE = 1;
export const DEFAULT_ROTATION = 0;
// prettier-ignore
export const DEFAULT_VIEW = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
]);

// Default misc
export const DEFAULT_BACKGROUND_IMAGE = null;
export const DEFAULT_LASSO_COLOR = [0, 0.666666667, 1, 1];
export const DEFAULT_SHOW_RECTICLE = false;
export const DEFAULT_RECTICLE_COLOR = [1, 1, 1, 0.5];
export const DEFAULT_DESELECT_ON_DBL_CLICK = true;
export const DEFAULT_DESELECT_ON_ESCAPE = true;
export const DEFAULT_MOUSE_SELECTION_MODE = false;
