export const createCanvas = (width = 200, height = 200) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const createMouseEvent = (type, x, y) =>
  new MouseEvent(type, {
    view: window,
    bubbles: true,
    cancelable: true,
    screenX: x,
    screenY: y,
    clientX: x,
    clientY: y
  });

export const wait = milliSeconds =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, milliSeconds);
  });
