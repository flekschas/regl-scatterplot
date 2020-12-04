const VERTEX_SHADER = `
precision highp float;

uniform sampler2D colorTex;
uniform float colorTexRes;
uniform float colorTexEps;
uniform sampler2D stateTex;
uniform float stateTexRes;
uniform float stateTexEps;
uniform float devicePixelRatio;
uniform sampler2D pointSizeTex;
uniform float pointSizeTexRes;
uniform float pointSizeTexEps;
uniform float pointSizeExtra;
uniform float numPoints;
uniform float globalState;
uniform float isColoredByCategory;
uniform float isColoredByValue;
uniform float isSizedByCategory;
uniform float isSizedByValue;
uniform float maxColorTexIdx;
uniform float numColorStates;
uniform float maxPointSizeTexIdx;
uniform float scaling;
uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

attribute float stateIndex;

// variables to send to the fragment shader
varying vec4 color;

void main() {
  // First get the state
  float stateRowIndex = floor((stateIndex + stateTexEps) / stateTexRes);
  vec2 stateTexIndex = vec2(
    (stateIndex / stateTexRes) - stateRowIndex + stateTexEps,
    stateRowIndex / stateTexRes + stateTexEps
  );

  vec4 state = texture2D(stateTex, stateTexIndex);

  gl_Position = projection * view * model * vec4(state.x, state.y, 0.0, 1.0);

  // Determine color index
  float colorIndexCat = state.z * isColoredByCategory;
  float colorIndexVal = floor(state.w * maxColorTexIdx) * isColoredByValue;
  // Multiply by the number of color states per color
  // I.e., normal, active, hover, background, etc.
  float colorIndex = (colorIndexCat + colorIndexVal) * numColorStates;
  // Half a "pixel" or "texel" in texture coordinates
  float colorLinearIndex = colorIndex + globalState;
  // Need to add cEps here to avoid floating point issue that can lead to
  // dramatic changes in which color is loaded as floor(3/2.9999) = 1 but
  // floor(3/3.0001) = 0!
  float colorRowIndex = floor((colorLinearIndex + colorTexEps) / colorTexRes);

  vec2 colorTexIndex = vec2(
    (colorLinearIndex / colorTexRes) - colorRowIndex + colorTexEps,
    colorRowIndex / colorTexRes + colorTexEps
  );

  color = texture2D(colorTex, colorTexIndex);

  // The final scaling consists of linear scaling in [0, 1] and log scaling
  // in [1, [
  float finalScaling = min(1.0, scaling) + log2(max(1.0, scaling));

  // Determine point size
  float pointSizeIndexCat = state.z * isSizedByCategory;
  float pointSizeIndexVal = floor(state.w * maxPointSizeTexIdx) * isSizedByValue;
  float pointSizeIndex = pointSizeIndexCat + pointSizeIndexVal;

  float pointSizeRowIndex = floor((pointSizeIndex + pointSizeTexEps) / pointSizeTexRes);
  vec2 pointSizeTexIndex = vec2(
    (pointSizeIndex / pointSizeTexRes) - pointSizeRowIndex + pointSizeTexEps,
    pointSizeRowIndex / pointSizeTexRes + pointSizeTexEps
  );
  float pointSize = texture2D(pointSizeTex, pointSizeTexIndex).x;

  gl_PointSize = pointSize * finalScaling + pointSizeExtra * devicePixelRatio;
}
`;

export default VERTEX_SHADER;
