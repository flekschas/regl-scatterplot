export const dist = (x1, y1, x2, y2) =>
  Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

export const hexToRgb = (hex, isNormalize = false) =>
  hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => "#" + r + r + g + g + b + b
    )
    .substring(1)
    .match(/.{2}/g)
    .map(x => parseInt(x, 16) / Math.pow(255, isNormalize));

export const hexToRgba = (hex, isNormalize = false) => [
  ...hexToRgb(hex, isNormalize),
  Math.pow(255, !isNormalize)
];

export const isHex = hex => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex);

export const isNumeric = x => typeof x === "number";

export const isNormFloat = x => x >= 0 && x <= 1;

export const isNormFloatArray = x => Array.isArray(x) && x.every(isNormFloat);

export const isUint8 = x => Number.isInteger(x) && x >= 0 && x <= 255;

export const isUint8Array = x => Array.isArray(x) && x.every(isUint8);

export const isRgb = rgb =>
  rgb.length === 3 && (isNormFloat(rgb) || isUint8Array(rgb));

export const isRgba = rgba =>
  rgba.length === 4 && (isNormFloat(rgba) || isUint8Array(rgba));

export const arrayMax = (max, x) => (max > x ? max : x);

export const normNumArray = a => a.map(x => x / a.reduce(arrayMax, -Infinity));

export const toRgba = (color, isNormalize) => {
  if (isRgba(color)) return isNormalize ? normNumArray(color) : color;
  if (isRgb(color))
    return [
      ...(isNormalize ? normNumArray(color) : color),
      Math.pow(255, !isNormalize)
    ];
  if (isHex(color)) return hexToRgba(color, isNormalize);
  console.warn(
    "Only HEX, RGB, and RGBA are handled by this function. Returning white instead."
  );
  return isNormalize ? [1, 1, 1, 1] : [255, 255, 255, 255];
};
