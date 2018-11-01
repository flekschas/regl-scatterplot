const VERTEX_SHADER = `
precision mediump float;

uniform sampler2D colorTex;
uniform float colorTexRes;
uniform sampler2D positionTex;
uniform float positionTexRes;
uniform float pointSize;
uniform float numPoints;
uniform float globalState;
uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

// per vertex attributes
attribute float colorIndex;
attribute float positionIndex;

// variables to send to the fragment shader
varying vec4 color;

void main() {
  // Half a "pixel" or "texel" in texture coordinates
  float cEps = 0.5 / colorTexRes;
  float colorLinearIndex = colorIndex + globalState;
  // Need to add cEps here to avoid floating point issue that can lead to
  // dramatic changes in which color is loaded as floor(3/2.9) = 1 but
  // floor(3/3.0001) = 0!
  float colorRowIndex = floor((colorLinearIndex + cEps) / colorTexRes);

  vec2 colorTexIndex = vec2(
    (colorLinearIndex / colorTexRes) - colorRowIndex,
    colorRowIndex / colorTexRes
  );

  color = texture2D(colorTex, colorTexIndex);

  float pEps = 0.5 / positionTexRes;
  float posRowIndex = floor((positionIndex + pEps) / positionTexRes);
  vec2 posTexIndex = vec2(
    (positionIndex / positionTexRes) - posRowIndex,
    posRowIndex / positionTexRes
  );

  vec4 pos = texture2D(positionTex, posTexIndex);

  // The fourth value represents the point size
  gl_Position = projection * view * model * vec4(pos.r, pos.a, 0.0, 1.0);

  gl_PointSize = pointSize;
}
`;

export default VERTEX_SHADER;
