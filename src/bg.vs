const VERTEX_SHADER = `
precision mediump float;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

attribute vec2 position;

varying vec2 uv;

void main () {
  uv = position;
  gl_Position = projection * view * model * vec4(1.0 - 2.0 * position, 0, 1);
}
`;

export default VERTEX_SHADER;
