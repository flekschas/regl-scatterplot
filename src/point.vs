const VERTEX_SHADER = `
precision highp float;

uniform sampler2D colorTex;
uniform float colorTexRes;
uniform sampler2D stateTex;
uniform float stateTexRes;
uniform sampler2D encodingTex;
uniform float encodingTexRes;
uniform float pointSizeExtra;
uniform float numPoints;
uniform float globalState;
uniform float isColoredByZ;
uniform float isColoredByW;
uniform float isOpacityByZ;
uniform float isOpacityByW;
uniform float isSizedByZ;
uniform float isSizedByW;
uniform float colorMultiplicator;
uniform float opacityMultiplicator;
uniform float sizeMultiplicator;
uniform float numColorStates;
uniform float pointScale;
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
    stateRowIndex / stateTexRes + eps
  );

  vec4 state = texture2D(stateTex, stateTexIndex);

  gl_Position = projection * view * model * vec4(state.x, state.y, 0.0, 1.0);

  // Determine color index
  float colorIndexZ =  isColoredByZ * floor(state.z * colorMultiplicator);
  float colorIndexW =  isColoredByW * floor(state.w * colorMultiplicator);
  float colorIndex = colorIndexZ + colorIndexW;
  // Multiply by the number of color states per color
  // I.e., normal, active, hover, background, etc.
  colorIndex *= numColorStates;
  // Half a "pixel" or "texel" in texture coordinates
  eps = 0.5 / colorTexRes;
  float colorLinearIndex = colorIndex + globalState;
  // Need to add cEps here to avoid floating point issue that can lead to
  // dramatic changes in which color is loaded as floor(3/2.9999) = 1 but
  // floor(3/3.0001) = 0!
  float colorRowIndex = floor((colorLinearIndex + eps) / colorTexRes);

  vec2 colorTexIndex = vec2(
    (colorLinearIndex / colorTexRes) - colorRowIndex + eps,
    colorRowIndex / colorTexRes + eps
  );

  color = texture2D(colorTex, colorTexIndex);

  // Retrieve point size
  float pointSizeIndexZ = isSizedByZ * floor(state.z * sizeMultiplicator);
  float pointSizeIndexW = isSizedByW * floor(state.w * sizeMultiplicator);
  float pointSizeIndex = pointSizeIndexZ + pointSizeIndexW;

  eps = 0.5 / encodingTexRes;
  float pointSizeRowIndex = floor((pointSizeIndex + eps) / encodingTexRes);
  vec2 pointSizeTexIndex = vec2(
    (pointSizeIndex / encodingTexRes) - pointSizeRowIndex + eps,
    pointSizeRowIndex / encodingTexRes + eps
  );
  float pointSize = texture2D(encodingTex, pointSizeTexIndex).x;

  // Retrieve opacity
  float opacityIndexZ = isOpacityByZ * floor(state.z * opacityMultiplicator);
  float opacityIndexW = isOpacityByW * floor(state.w * opacityMultiplicator);
  float opacityIndex = opacityIndexZ + opacityIndexW;

  eps = 0.5 / encodingTexRes;
  float opacityRowIndex = floor((opacityIndex + eps) / encodingTexRes);
  vec2 opacityTexIndex = vec2(
    (opacityIndex / encodingTexRes) - opacityRowIndex + eps,
    opacityRowIndex / encodingTexRes + eps
  );
  color.a = texture2D(encodingTex, opacityTexIndex).y;

  gl_PointSize = pointSize * pointScale + pointSizeExtra;
}
`;

export default VERTEX_SHADER;
