export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
};

export const createCanvas = (width = 200, height = 200) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
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

export const flatArrayEqual = (a, b, comparator = (x, y) => x === y) =>
  a.length === b.length && a.every((x, i) => comparator(x, b[i]));

export const wait = (milliSeconds) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliSeconds);
  });
