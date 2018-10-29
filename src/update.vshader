const SHADER = `
precision mediump float;

attribute vec2 position;

varying vec2 index;

void main() {
  // map normalized device coords to texture coords
  index = 0.5 * (1.0 + position);

  gl_Position = vec4(position, 0, 1);
}
`;

export default SHADER;
