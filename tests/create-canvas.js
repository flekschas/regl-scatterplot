import browserEnv from "browser-env";
import createWebGl from "gl";

browserEnv();

const CONTEXT = createWebGl(1, 1, { preserveDrawingBuffer: true });
const RESIZE = CONTEXT.getExtension("STACKGL_resize_drawingbuffer");

const createContext = (w, h) => {
  RESIZE.resize(w, h);
  return CONTEXT;
};

const createCanvas = (w, h) => {
  // Create fake canvas element
  const canvas = document.createElement("canvas");

  const getContext = context => {
    if (context === "webgl") {
      return createContext(w, h);
    } else {
      throw new Error("Only webgl is supported");
    }
  };

  // Overwrite `getContext()` to add support for the WebGL context
  canvas.getContext = getContext;

  // Duplicated `addEventListener()` needed for the `wheel` package
  canvas.attachEvent = addEventListener;
  canvas.detachEvent = removeEventListener;

  return canvas;
};

export default createCanvas;
