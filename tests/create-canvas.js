import createWebGl from "gl";

const CONTEXT = createWebGl(1, 1, { preserveDrawingBuffer: true });
const RESIZE = CONTEXT.getExtension("STACKGL_resize_drawingbuffer");

const createContext = (w, h) => {
  RESIZE.resize(w, h);
  return CONTEXT;
};

const createCanvas = (w, h) => {
  return {
    getContext: context => {
      if (context === "webgl") {
        return createContext(w, h);
      } else {
        throw new Error("Only webgl is supported");
      }
    }
  };
};

export default createCanvas;
