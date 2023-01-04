import {
  cubicIn,
  cubicInOut,
  cubicOut,
  linear,
  quadIn,
  quadInOut,
  quadOut,
} from '@flekschas/utils';

export const AUTO = 'auto';

export const COLOR_NORMAL_IDX = 0;
export const COLOR_ACTIVE_IDX = 1;
export const COLOR_HOVER_IDX = 2;
export const COLOR_BG_IDX = 3;
export const COLOR_NUM_STATES = 4;
export const FLOAT_BYTES = Float32Array.BYTES_PER_ELEMENT;
export const GL_EXTENSIONS = [
  'OES_texture_float',
  'OES_element_index_uint',
  'WEBGL_color_buffer_float',
  'EXT_float_blend',
];
export const CLEAR_OPTIONS = {
  color: [0, 0, 0, 0], // Transparent background color
  depth: 1,
};

export const MOUSE_MODE_PANZOOM = 'panZoom';
export const MOUSE_MODE_LASSO = 'lasso';
export const MOUSE_MODE_ROTATE = 'rotate';
export const MOUSE_MODES = [
  MOUSE_MODE_PANZOOM,
  MOUSE_MODE_LASSO,
  MOUSE_MODE_ROTATE,
];
export const DEFAULT_MOUSE_MODE = MOUSE_MODE_PANZOOM;

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
export const DEFAULT_LASSO_COLOR = [0, 0.666666667, 1, 1];
export const DEFAULT_LASSO_LINE_WIDTH = 2;
export const DEFAULT_LASSO_INITIATOR = false;
export const DEFAULT_LASSO_INITIATOR_BACKGROUND = 'rgba(255, 255, 255, 0.1)';
export const DEFAULT_LASSO_MIN_DELAY = 10;
export const DEFAULT_LASSO_MIN_DIST = 3;
export const DEFAULT_LASSO_CLEAR_EVENT = LASSO_CLEAR_ON_END;

// Key mapping
export const KEY_ACTION_LASSO = 'lasso';
export const KEY_ACTION_ROTATE = 'rotate';
export const KEY_ACTION_MERGE = 'merge';
export const KEY_ACTIONS = [
  KEY_ACTION_LASSO,
  KEY_ACTION_ROTATE,
  KEY_ACTION_MERGE,
];
export const KEY_ALT = 'alt';
export const KEY_CMD = 'cmd';
export const KEY_CTRL = 'ctrl';
export const KEY_META = 'meta';
export const KEY_SHIFT = 'shift';
export const KEYS = [KEY_ALT, KEY_CMD, KEY_CTRL, KEY_META, KEY_SHIFT];
export const DEFAULT_KEY_MAP = {
  [KEY_ALT]: KEY_ACTION_ROTATE,
  [KEY_SHIFT]: KEY_ACTION_LASSO,
  [KEY_CMD]: KEY_ACTION_MERGE,
};

// Default attribute
export const DEFAULT_DATA_ASPECT_RATIO = 1;
export const DEFAULT_WIDTH = AUTO;
export const DEFAULT_HEIGHT = AUTO;
export const DEFAULT_GAMMA = 1;

// Default styles
export const MIN_POINT_SIZE = 1;
export const DEFAULT_POINT_SIZE = 6;
export const DEFAULT_POINT_SIZE_SELECTED = 2;
export const DEFAULT_POINT_OUTLINE_WIDTH = 2;
export const DEFAULT_SIZE_BY = null;
export const DEFAULT_POINT_CONNECTION_SIZE = 2;
export const DEFAULT_POINT_CONNECTION_SIZE_ACTIVE = 2;
export const DEFAULT_POINT_CONNECTION_SIZE_BY = null;
export const DEFAULT_POINT_CONNECTION_OPACITY = null;
export const DEFAULT_POINT_CONNECTION_OPACITY_BY = null;
export const DEFAULT_POINT_CONNECTION_OPACITY_ACTIVE = 0.66;
export const DEFAULT_OPACITY = 1;
export const DEFAULT_OPACITY_BY = null;
export const DEFAULT_OPACITY_BY_DENSITY_FILL = 0.15;
export const DEFAULT_OPACITY_BY_DENSITY_DEBOUNCE_TIME = 25;
export const DEFAULT_OPACITY_INACTIVE_MAX = 1;
export const DEFAULT_OPACITY_INACTIVE_SCALE = 1;

// Default colors
export const DEFAULT_COLORMAP = [];
export const DEFAULT_COLOR_BY = null;
export const DEFAULT_COLOR_NORMAL = [0.66, 0.66, 0.66, DEFAULT_OPACITY];
export const DEFAULT_COLOR_ACTIVE = [0, 0.55, 1, 1];
export const DEFAULT_COLOR_HOVER = [1, 1, 1, 1];
export const DEFAULT_COLOR_BG = [0, 0, 0, 1];
export const DEFAULT_POINT_CONNECTION_COLOR_BY = null;
export const DEFAULT_POINT_CONNECTION_COLOR_NORMAL = [0.66, 0.66, 0.66, 0.2];
export const DEFAULT_POINT_CONNECTION_COLOR_ACTIVE = [0, 0.55, 1, 1];
export const DEFAULT_POINT_CONNECTION_COLOR_HOVER = [1, 1, 1, 1];

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

// Error codes
export const IMAGE_LOAD_ERROR = 'IMAGE_LOAD_ERROR';

// Default misc
export const DEFAULT_BACKGROUND_IMAGE = null;
export const DEFAULT_SHOW_RETICLE = false;
export const DEFAULT_RETICLE_COLOR = [1, 1, 1, 0.5];
export const DEFAULT_DESELECT_ON_DBL_CLICK = true;
export const DEFAULT_DESELECT_ON_ESCAPE = true;
export const DEFAULT_SHOW_POINT_CONNECTIONS = false;
export const DEFAULT_POINT_CONNECTION_MAX_INT_POINTS_PER_SEGMENT = 100;
export const DEFAULT_POINT_CONNECTION_INT_POINTS_TOLERANCE = 1 / 500;
export const DEFAULT_POINT_SIZE_MOUSE_DETECTION = 'auto';
export const DEFAULT_PERFORMANCE_MODE = false;
export const SINGLE_CLICK_DELAY = 200;
export const LONG_CLICK_TIME = 500;
export const Z_NAMES = new Set(['z', 'valueZ', 'valueA', 'value1', 'category']);
export const W_NAMES = new Set(['w', 'valueW', 'valueB', 'value2', 'value']);
export const DEFAULT_IMAGE_LOAD_TIMEOUT = 15000;
