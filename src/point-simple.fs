const FRAGMENT_SHADER = `precision mediump float;

varying vec4 color;

void main() {
  gl_FragColor = color;
}
`;

export default FRAGMENT_SHADER;
