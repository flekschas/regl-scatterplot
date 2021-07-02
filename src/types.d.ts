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
} & {
  [Key in Category | Value]?: ArrayLike<number>;
};

export type Points = number[][] | PointsObject;

type Nullifiable = {
  backgroundImage: null | import('regl').Texture2D | string;
  colorBy: null | DataEncoding;
  sizeBy: null | DataEncoding;
  opacityBy: null | DataEncoding;
  xScale: null | Scale;
  yScale: null | Scale;
  pointConnectionColorBy: null | PointDataEncoding;
  pointConnectionOpacityBy: null | PointDataEncoding;
  pointConnectionSizeBy: null | PointDataEncoding;
};

type PointOptions = {
  pointColor: ColorMap;
  pointColorActive: Color;
  pointColorHover: Color;
  pointOutlineWidth: number;
  pointSize: number | Array<number>;
  pointSizeSelected: number;
  pointConnectionColor: ColorMap;
  pointConnectionColorActive: Color;
  pointConnectionColorHover: Color;
  pointConnectionOpacity: number | Array<number>;
  pointConnectionOpacityActive: number;
  pointConnectionSize: number | Array<number>;
  pointConnectionSizeActive: number;
  pointConnectionMaxIntPointsPerSegment: number;
  pointConnectionTolerance: number;
};

type CameraOptions = {
  cameraTarget: [number, number];
  cameraDistance: number;
  cameraRotation: number;
  cameraView: Float32Array;
};

type LassoOptions = {
  lassoColor: Color;
  lassoLineWidth: number;
  lassoMinDelay: number;
  lassoMinDist: number;
  lassoClearEvent: 'lassoEnd' | 'deselect';
  lassoInitiator: boolean;
  lassoInitiatorParentElement: HTMLElement;
};

export type Settable = {
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
  height: 'auto' | number;
  width: 'auto' | number;
  gamma: number;
} & PointOptions &
  CameraOptions &
  LassoOptions &
  Nullifiable;

export type Properties = {
  canvas: HTMLCanvasElement;
  regl: import('regl').Regl;
  syncEvents: boolean;
  version: string;
  lassoInitiatorElement: HTMLElement;
  camera: Camera2D;
  performanceMode: boolean;
  opacityByDensityDebounceTime: number;
} & Settable;

// Options for plot.{draw, select, hover, deselect}

export type ScatterPlotOptions = {
  draw: Partial<{
    transition: boolean;
    transitionDuration: number;
    transitionEasing: string;
  }>;
  hover: Partial<{
    showReticleOnce: boolean;
    preventEvent: boolean;
  }>;
  select: Partial<{
    merge: boolean;
    preventEvent: boolean;
  }>;
};

// PubSub definitions

type PubSubEvent<EventName extends string, Payload extends unknown> = {
  [Key in EventName]: Payload;
};

type DrawPayload = Pick<Properties, 'camera' | 'xScale' | 'yScale'> & {
  view: Properties['cameraView'];
};

type EventMap = PubSubEvent<
  | 'init'
  | 'destroy'
  | 'backgroundImageReady'
  | 'deselect'
  | 'lassoStart'
  | 'transitionStart'
  | 'pointConnectionsDraw',
  undefined
> &
  PubSubEvent<'view' | 'draw', DrawPayload> &
  PubSubEvent<'lassoEnd' | 'lassoExtend', { coordinates: number[] }> &
  PubSubEvent<'pointOver' | 'pointOut', number> &
  PubSubEvent<'points', { points: number[][] }> &
  PubSubEvent<'transitionEnd', import('regl').Regl>;

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
