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
  // color index
  vec2 colorTexIndex = vec2(
    fract((colorIndex + globalState) / colorTexRes),
    floor((colorIndex + globalState) / colorTexRes) / colorTexRes
  );

  // color (= state) at the current index
  color = texture2D(colorTex, colorTexIndex);

  // position index
  vec2 posTexIndex = vec2(
    fract(positionIndex / positionTexRes),
    floor(positionIndex / positionTexRes) / positionTexRes
  );

  vec4 pos = texture2D(positionTex, posTexIndex);

  // The fourth value represents the point size
  gl_Position = projection * view * model * vec4(pos.r, pos.a, 0.0, 1.0);

  gl_PointSize = pointSize;
}
`;

export default VERTEX_SHADER;
