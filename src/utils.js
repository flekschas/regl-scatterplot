/**
 * L2 distance between a pair of 2D points
 * @param   {number}  x1  X coordinate of the first point
 * @param   {number}  y1  Y coordinate of the first point
 * @param   {number}  x2  X coordinate of the second point
 * @param   {number}  y2  Y coordinate of the first point
 * @return  {number}  L2 distance
 */
export const dist = (x1, y1, x2, y2) =>
  Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

/**
 * Convert a HEX-encoded color to an RGB-encoded color
 * @param   {string}  hex  HEX-encoded color string.
 * @param   {boolean}  isNormalize  If `true` the returned RGB values will be
 *   normalized to `[0,1]`.
 * @return  {array}  Triple holding the RGB values.
 */
export const hexToRgb = (hex, isNormalize = false) =>
  hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`
    )
    .substring(1)
    .match(/.{2}/g)
    .map(x => parseInt(x, 16) / 255 ** isNormalize);

/**
 * Promised-based image loading
 * @param   {string}  src  Remote image source, i.e., a URL
 * @return  {object}  Promise resolving to the image once its loaded
 */
export const loadImage = (src, isCrossOrigin = false) =>
  new Promise((accept, reject) => {
    const image = new Image();
    if (isCrossOrigin) image.crossOrigin = 'anonymous';
    image.src = src;
    image.onload = () => {
      accept(image);
    };
    image.onerror = error => {
      reject(error);
    };
  });

/**
 * Convert a HEX-encoded color to an RGBA-encoded color
 * @param   {string}  hex  HEX-encoded color string.
 * @param   {boolean}  isNormalize  If `true` the returned RGBA values will be
 *   normalized to `[0,1]`.
 * @return  {array}  Triple holding the RGBA values.
 */
export const hexToRgba = (hex, isNormalize = false) => [
  ...hexToRgb(hex, isNormalize),
  255 ** !isNormalize
];

/**
 * Tests if a string is a valid HEX color encoding
 * @param   {string}  hex  HEX-encoded color string.
 * @return  {boolean}  If `true` the string is a valid HEX color encoding.
 */
export const isHex = hex => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex);

/**
 * Tests if a number is in `[0,1]`.
 * @param   {number}  x  Number to be tested.
 * @return  {boolean}  If `true` the number is in `[0,1]`.
 */
export const isNormFloat = x => x >= 0 && x <= 1;

/**
 * Tests if an array consist of normalized numbers that are in `[0,1]` only.
 * @param   {array}  a  Array to be tested
 * @return  {boolean}  If `true` the array contains only numbers in `[0,1]`.
 */
export const isNormFloatArray = a => Array.isArray(a) && a.every(isNormFloat);

/**
 * Tests if a variable is a string
 * @param   {*}  s  Variable to be tested
 * @return  {boolean}  If `true` variable is a string
 */
export const isString = s => typeof s === 'string' || s instanceof String;

/**
 * Tests if a number is an interger and in `[0,255]`.
 * @param   {number}  x  Number to be tested.
 * @return  {boolean}  If `true` the number is an interger and in `[0,255]`.
 */
export const isUint8 = x => Number.isInteger(x) && x >= 0 && x <= 255;

/**
 * Tests if an array consist of Uint8 numbers only.
 * @param   {array}  a  Array to be tested.
 * @return  {boolean}  If `true` the array contains only Uint8 numbers.
 */
export const isUint8Array = a => Array.isArray(a) && a.every(isUint8);

/**
 * Tests if an array is encoding an RGB color.
 * @param   {array}  rgb  Array to be tested
 * @return  {boolean}  If `true` the array hold a triple of Uint8 numbers or
 *   a triple of normalized floats.
 */
export const isRgb = rgb =>
  rgb.length === 3 && (isNormFloatArray(rgb) || isUint8Array(rgb));

/**
 * Tests if an array is encoding an RGBA color.
 * @param   {array}  rgb  Array to be tested
 * @return  {boolean}  If `true` the array hold a quadruple of Uint8 numbers or
 *   a quadruple of normalized floats.
 */
export const isRgba = rgba =>
  rgba.length === 4 && (isNormFloatArray(rgba) || isUint8Array(rgba));

/**
 * Get the max value of an array. helper method to be used with `Array.reduce()`.
 * @param   {number}  max  Accumulator holding the max value.
 * @param   {number}  x  Current value.
 * @return  {number}  Max value.
 */
export const arrayMax = (max, x) => (max > x ? max : x);

/**
 * Normalize an array
 * @param   {array}  a  Array to be normalized.
 * @return  {array}  Normalized array.
 */
export const normNumArray = a => a.map(x => x / a.reduce(arrayMax, -Infinity));

/**
 * Convert a color to an RGBA color
 * @param   {*}  color  Color to be converted. Currently supports:
 *   HEX, RGB, or RGBA.
 * @param   {boolean}  isNormalize  If `true` the returned RGBA values will be
 *   normalized to `[0,1]`.
 * @return  {array}  Quadruple defining an RGBA color.
 */
export const toRgba = (color, isNormalize) => {
  if (isRgba(color))
    return isNormalize && !isNormFloatArray(color)
      ? normNumArray(color)
      : color;
  if (isRgb(color))
    return [
      ...(isNormalize ? normNumArray(color) : color),
      255 ** !isNormalize
    ];
  if (isHex(color)) return hexToRgba(color, isNormalize);
  console.warn(
    'Only HEX, RGB, and RGBA are handled by this function. Returning white instead.'
  );
  return isNormalize ? [1, 1, 1, 1] : [255, 255, 255, 255];
};
