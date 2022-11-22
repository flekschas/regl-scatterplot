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

type Camera2D = ReturnType<import('camera-2d-simple')>;
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

interface BaseOptions {
  backgroundColor: Color;
  deselectOnDblClick: boolean;
  deselectOnEscape: boolean;
  keyMap: KeyMap;
  mouseMode: MouseMode;
  showPointConnections: boolean;
  showReticle: boolean;
  reticleColor: Color;
  opacity: number;
  opacityByDensityFill: number;
  opacityInactiveMax: number;
  opacityInactiveScale: number;
  height: 'auto' | number;
  width: 'auto' | number;
  gamma: number;
  // Nullifiable
  backgroundImage: null | import('regl').Texture2D | string;
  colorBy: null | DataEncoding;
  sizeBy: null | DataEncoding;
  opacityBy: null | DataEncoding;
  xScale: null | Scale;
  yScale: null | Scale;
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
  points: [number, number][];
  pointsInView: number[];
} & Settable;

// Options for plot.{draw, select, hover}
export interface ScatterplotMethodOptions {
  draw: Partial<{
    transition: boolean;
    transitionDuration: number;
    transitionEasing: (t: number) => number;
  }>;
  hover: Partial<{
    showReticleOnce: boolean;
    preventEvent: boolean;
  }>;
  select: Partial<{
    merge: boolean;
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
}

// PubSub definitions
type PubSubEvent<EventName extends string, Payload extends unknown> = {
  [Key in EventName]: Payload;
};

type EventMap = PubSubEvent<
  | 'init'
  | 'destroy'
  | 'backgroundImageReady'
  | 'select'
  | 'deselect'
  | 'lassoStart'
  | 'transitionStart'
  | 'pointConnectionsDraw',
  undefined
> &
  PubSubEvent<'lassoEnd' | 'lassoExtend', { coordinates: number[] }> &
  PubSubEvent<'pointOver' | 'pointOut', number> &
  PubSubEvent<'points', { points: Array<Array<number>> }> &
  PubSubEvent<'transitionEnd', import('regl').Regl> &
  PubSubEvent<
    'view' | 'draw',
    Pick<Properties, 'camera' | 'xScale' | 'yScale'> & {
      view: Properties['cameraView'];
    }
  >;

export interface PubSub {
  subscribe<EventName extends keyof EventMap>(
    eventName: EventName,
    eventHandler: (payload: EventMap[EventName]) => void,
    times: number
  ): void;
  unsubscribe(eventName: keyof EventMap): void;
  publish<EventName extends keyof EventMap>(
    eventName: EventName,
    payload: EventMap[EventName]
  ): void;
}
