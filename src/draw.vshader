const VERTEXSHADER = `
precision mediump float;

// values that are the same for all vertices
uniform sampler2D uParticleState;
// uniform sampler2D uColorState;
uniform float uParticlesRes;
uniform float uSpan;
uniform float uPointSize;
uniform mat4 uCamera;

// per vertex attributes
attribute float aIndex;

// variables to send to the fragment shader
varying vec4 vFragColor;

vec2 normalizeCoords(vec2 position) {
  return vec2(position[0] * uSpan, position[1] * uSpan);
}

void main() {
  // texture index
  vec2 textureIndex = vec2(
    fract(aIndex / uParticlesRes),
    floor(aIndex / uParticlesRes) / uParticlesRes
  );

  // color (= state) at the current index
  vec4 state = texture2D(uParticleState, textureIndex);

  // The first two values represent the x and y position
  vec2 position = vec2(state.x, state.y);

  // The third value represents RGBA
  vFragColor = vec4(1.0, 0.0, 0.0, 0.5);

  // The fourth value represents the point size
  gl_PointSize = uPointSize;
  gl_Position = uCamera * vec4(normalizeCoords(position), 0.0, 1.0);
}
`;

export default VERTEXSHADER;
