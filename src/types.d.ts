type Hex = string;
type Rgb = [number, number, number];
type Rgba = [number, number, number, number];

type Color = Hex | Rgb | Rgba;
type ColorMap = Color | Array<Color>;

type Category = 'category' | 'value1' | 'valueA' | 'valueZ' | 'z';
type Value = 'value' | 'value2' | 'valueB' | 'valueW' | 'w';
type DataEncoding = Category | Value;
type PointDataEncoding = DataEncoding | 'inherit' | 'segment';

type KeyAction = 'lasso' | 'rotate' | 'merge';
type KeyMap = Record<'alt' | 'cmd' | 'ctrl' | 'meta' | 'shift', KeyAction>;

type MouseMode = 'panZoom' | 'lasso' | 'rotate';

type ZWDataType = 'continuous' | 'categorical';

type Camera2D = any; // Needs to be typed at some point
type Scale = import('d3-scale').ScaleContinuousNumeric<number, number>;

type PointsObject = {
  x: ArrayLike<number>;
  y: ArrayLike<number>;
  line?: ArrayLike<number>;
  lineOrder?: ArrayLike<number>;
} & {
  [Key in Category | Value]?: ArrayLike<number>;
};

export type Points = Array<Array<number>> | PointsObject;

type PointOptions = {
  color: ColorMap;
  colorActive: Color;
  colorHover: Color;
  outlineWidth: number;
  size: number | Array<number>;
  sizeSelected: number;
};

type PointConnectionOptions = {
  color: ColorMap;
  colorActive: Color;
  colorHover: Color;
  opacity: number | Array<number>;
  opacityActive: number;
  size: number | Array<number>;
  sizeActive: number;
  maxIntPointsPerSegment: number;
  tolerance: number;
  // Nullifiable
  colorBy: null | PointDataEncoding;
  opacityBy: null | PointDataEncoding;
  sizeBy: null | PointDataEncoding;
};

type LassoOptions = {
  color: Color;
  lineWidth: number;
  minDelay: number;
  minDist: number;
  clearEvent: 'lassoEnd' | 'deselect';
  initiator: boolean;
  initiatorParentElement: HTMLElement;
  onLongPress: boolean;
  longPressTime: number;
  longPressAfterEffectTime: number;
  longPressEffectDelay: number;
  longPressRevertEffectTime: number;
};

type CameraOptions = {
  target: [number, number];
  distance: number;
  rotation: number;
  view: Float32Array;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface BaseAnnotation {
  lineColor?: Color;
  lineWidth?: number;
}

interface AnnotationHLine extends BaseAnnotation {
  y: number;
}

interface AnnotationVLine extends BaseAnnotation {
  x: number;
}

interface AnnotationDomRect extends BaseAnnotation {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AnnotationRect extends BaseAnnotation {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface AnnotationPolygon extends BaseAnnotation {
  vertices: [number, number][];
}

type Annotation =
  | AnnotationHLine
  | AnnotationVLine
  | AnnotationDomRect
  | AnnotationRect
  | AnnotationPolygon;

interface BaseOptions {
  backgroundColor: Color;
  deselectOnDblClick: boolean;
  deselectOnEscape: boolean;
  keyMap: KeyMap;
  mouseMode: MouseMode;
  showPointConnections: boolean;
  showReticle: boolean;
  reticleColor: Color;
  opacity: number | Array<number>;
  opacityByDensityFill: number;
  opacityInactiveMax: number;
  opacityInactiveScale: number;
  height: 'auto' | number;
  width: 'auto' | number;
  gamma: number;
  aspectRatio: number;
  annotationLineColor: Color;
  annotationLineWidth: number;
  annotationHVLineLimit: number;
  // Nullifiable
  backgroundImage: null | import('regl').Texture2D | string;
  colorBy: null | DataEncoding;
  sizeBy: null | DataEncoding;
  opacityBy: null | DataEncoding;
  xScale: null | Scale;
  yScale: null | Scale;
}

export interface CreateKDBushOptions {
  node: number;
  useWorker: boolean;
}

/**
 * Helper type. Adds a prefix to keys of Options.
 *
 * type A = { a: number; b: string };
 * WithPrefix<'myPrefix', A> === { myPrefixA: number, myPrefixB: string };
 */
type WithPrefix<
  Name extends string,
  Options extends Record<string, unknown>
> = {
  [Key in keyof Options as `${Name}${Capitalize<string & Key>}`]: Options[Key];
};

export type Settable = BaseOptions &
  WithPrefix<'point', PointOptions> &
  WithPrefix<'pointConnection', PointConnectionOptions> &
  WithPrefix<'lasso', LassoOptions> &
  WithPrefix<'camera', CameraOptions>;

export type RendererOptions = {
  regl: import('regl').Regl;
  canvas: HTMLCanvasElement;
  gamma: number;
};

export type Properties = {
  renderer: ReturnType<typeof import('./renderer').createRenderer>;
  canvas: HTMLCanvasElement;
  regl: import('regl').Regl;
  syncEvents: boolean;
  version: string;
  lassoInitiatorElement: HTMLElement;
  camera: Camera2D;
  performanceMode: boolean;
  opacityByDensityDebounceTime: number;
  spatialIndex: ArrayBuffer;
  spatialIndexUseWorker: undefined | boolean;
  points: [number, number][];
  pointsInView: number[];
  isDestroyed: boolean;
  isPointsDrawn: boolean;
  isPointsFiltered: boolean;
  hoveredPoint: number;
  filteredPoints: number[];
  selectedPoints: number[];
} & Settable;

// Options for plot.{draw, select, hover}
export interface ScatterplotMethodOptions {
  draw: Partial<{
    transition: boolean;
    transitionDuration: number;
    transitionEasing: (t: number) => number;
    preventFilterReset: boolean;
    hover: number;
    select: number | number[];
    filter: number | number[];
    zDataType: ZWDataType;
    wDataType: ZWDataType;
    spatialIndex: ArrayBuffer;
  }>;
  hover: Partial<{
    showReticleOnce: boolean;
    preventEvent: boolean;
  }>;
  select: Partial<{
    merge: boolean;
    preventEvent: boolean;
  }>;
  filter: Partial<{
    preventEvent: boolean;
  }>;
  preventEvent: Partial<{
    preventEvent: boolean;
  }>;
  zoomToPoints: Partial<{
    padding: number;
    transition: boolean;
    transitionDuration: number;
    transitionEasing: (t: number) => number;
  }>;
  zoomToArea: Partial<{
    transition: boolean;
    transitionDuration: number;
    transitionEasing: (t: number) => number;
  }>;
  zoomToLocation: Partial<{
    transition: boolean;
    transitionDuration: number;
    transitionEasing: (t: number) => number;
  }>;
}

export type Events = import('pub-sub-es').Event<
  | 'init'
  | 'destroy'
  | 'backgroundImageReady'
  | 'deselect'
  | 'unfilter'
  | 'lassoStart'
  | 'transitionStart'
  | 'pointConnectionsDraw',
  undefined
> &
  import('pub-sub-es').Event<
    'lassoEnd' | 'lassoExtend',
    { coordinates: number[] }
  > &
  import('pub-sub-es').Event<'pointOver' | 'pointOut', number> &
  import('pub-sub-es').Event<'select' | 'focus', { points: Array<number> }> &
  import('pub-sub-es').Event<'points', { points: Array<Array<number>> }> &
  import('pub-sub-es').Event<'transitionEnd', import('regl').Regl> &
  import('pub-sub-es').Event<
    'view' | 'draw' | 'drawing',
    Pick<Properties, 'camera' | 'xScale' | 'yScale'> & {
      view: Properties['cameraView'];
    }
  >;
