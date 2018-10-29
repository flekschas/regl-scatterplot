const VERTEX_SHADER = `
precision mediump float;

uniform sampler2D colorTex;
uniform float colorTexRes;
uniform float pointSize;
uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

// per vertex attributes
attribute vec2 position;
attribute float colorIndex;

// variables to send to the fragment shader
varying vec4 color;

void main() {
  // texture index
  vec2 colorTexIndex = vec2(
    fract(colorIndex / colorTexRes),
    floor(colorIndex / colorTexRes) / colorTexRes
  );

  // color (= state) at the current index
  color = texture2D(colorTex, colorTexIndex);

  // The fourth value represents the point size
  gl_PointSize = pointSize;
  gl_Position = projection * view * model * vec4(position, 0.0, 1.0);
}
`;

export default VERTEX_SHADER;
