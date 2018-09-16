const SHADER = `
precision mediump float;

uniform sampler2D uParticleState;

varying vec2 vTextureIndex;

void main() {
  vec4 state = texture2D(uParticleState, vTextureIndex);

  gl_FragColor = state;
}
`;

export default SHADER;
