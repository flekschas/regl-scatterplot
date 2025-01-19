export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const createCanvas = (width = 200, height = 200) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Hacky but necessary
  canvas.getBoundingClientRect = () => ({
    width,
    height,
    top: 0,
    right: width,
    bottom: height,
    left: 0,
    x: 0,
    y: 0,
  });

  return canvas;
};

export const createMouseEvent = (type, x, y, args = {}) =>
  new MouseEvent(type, {
    view: window,
    bubbles: true,
    cancelable: true,
    screenX: x,
    screenY: y,
    clientX: x,
    clientY: y,
    ...args,
  });

export const createKeyboardEvent = (type, key, args = {}) =>
  new KeyboardEvent(type, {
    view: window,
    bubbles: true,
    cancelable: true,
    key,
    ...args,
  });

export const flatArrayEqual = (a, b, comparator = (x, y) => x === y) =>
  a.length === b.length && a.every((x, i) => comparator(x, b[i]));

export const wait = (milliSeconds) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliSeconds);
  });

export const capitalize = (s) => `${s[0].toUpperCase}${s.slice(1)}`;

export const getPixelSum = (img, xStart, xEnd, yStart, yEnd) => {
  let pixelSum = 0;
  for (let i = yStart; i < yEnd; i++) {
    for (let j = xStart; j < xEnd; j++) {
      const idx = (i * img.width + j) * 4;
      pixelSum +=
        img.data[idx] +
        img.data[idx + 1] +
        img.data[idx + 2] +
        img.data[idx + 3];
    }
  }
  return pixelSum;
};
