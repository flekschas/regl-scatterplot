const VERTEX_SHADER = `
precision mediump float;

uniform mat4 projectionViewModel;

attribute vec2 position;

varying vec2 uv;

void main () {
  uv = position;
  gl_Position = projectionViewModel * vec4(-1.0 + 2.0 * uv.x, 1.0 - 2.0 * uv.y, 0, 1);
}
`;

export default VERTEX_SHADER;
