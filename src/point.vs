const VERTEX_SHADER = `
precision mediump float;

uniform sampler2D colorTex;
uniform float colorTexRes;
uniform sampler2D stateTex;
uniform float stateTexRes;
uniform float pointSize;
uniform float pointSizeExtra;
uniform float numPoints;
uniform float globalState;
uniform float isColoredByCategory;
uniform float isColoredByValue;
uniform float maxColor;
uniform float numColorStates;
uniform float scaling;
uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

attribute float stateIndex;

// variables to send to the fragment shader
varying vec4 color;

void main() {
  // First get the state
  float eps = 0.5 / stateTexRes;
  float stateRowIndex = floor((stateIndex + eps) / stateTexRes);
  vec2 stateTexIndex = vec2(
    (stateIndex / stateTexRes) - stateRowIndex + eps,
    stateRowIndex / stateTexRes
  );

  vec4 state = texture2D(stateTex, stateTexIndex);

  gl_Position = projection * view * model * vec4(state.x, state.y, 0.0, 1.0);

  // Determine color index
  float colorIndexCat = state.z * isColoredByCategory;
  float colorIndexVal = floor(state.w * maxColor) * isColoredByValue;
  float colorIndex = colorIndexCat + colorIndexVal;
  // Multiply by the number of color states per color
  // I.e., normal, active, hover, background, etc.
  colorIndex *= numColorStates;
  // Half a "pixel" or "texel" in texture coordinates
  eps = 0.5 / colorTexRes;
  float colorLinearIndex = colorIndex + globalState;
  // Need to add cEps here to avoid floating point issue that can lead to
  // dramatic changes in which color is loaded as floor(3/2.9) = 1 but
  // floor(3/3.0001) = 0!
  float colorRowIndex = floor((colorLinearIndex + eps) / colorTexRes);

  vec2 colorTexIndex = vec2(
    (colorLinearIndex / colorTexRes) - colorRowIndex + eps,
    colorRowIndex / colorTexRes
  );

  color = texture2D(colorTex, colorTexIndex);

  // The final scaling consists of linear scaling in [0, 1] and log scaling
  // in [1, [
  float finalScaling = min(1.0, scaling) + log2(max(1.0, scaling));

  gl_PointSize = pointSize * finalScaling + pointSizeExtra;
}
`;

export default VERTEX_SHADER;
