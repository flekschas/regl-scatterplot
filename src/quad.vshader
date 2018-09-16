const SHADER = `
precision mediump float;

attribute vec2 aPosition;

varying vec2 vTextureIndex;

void main() {
  // map normalized device coords to texture coords
  vTextureIndex = 0.5 * (1.0 + aPosition);

  gl_Position = vec4(aPosition, 0, 1);
}
`;

export default SHADER;
