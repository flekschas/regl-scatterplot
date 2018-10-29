const VERTEX_SHADER = `
precision mediump float;

attribute vec2 position;
attribute vec4 color;
attribute float extraPointSize;

varying vec4 fragColor;

uniform float basePointSize;
uniform float aspectRatio;
uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

void main() {
  // update the size of a point based on the prop base and extra point size
  gl_PointSize = basePointSize + extraPointSize;

  // send color to the fragment shader
  fragColor = color;

  // scale to normalized device coordinates gl_Position is a special variable
  // that holds the position of a vertex
  gl_Position = projection * view * model * vec4(position, 0.0, 1.0);
}
`;

export default VERTEX_SHADER;
