const SHADER = `
precision mediump float;

uniform sampler2D pointState;

varying vec2 index;

void main() {
  vec4 state = texture2D(pointState, index);

  gl_FragColor = state;
}
`;

export default SHADER;
