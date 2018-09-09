const VERTEX_SHADER = `
precision mediump float;

// per vertex attributes
attribute vec2 position;
attribute vec4 color;
attribute float extraPointSize;

// variables to send to the fragment shader
varying vec4 fragColor;

// values that are the same for all vertices
uniform float span;
uniform float basePointSize;
uniform mat4 camera;

vec2 normalizeCoords(vec2 position) {
  return vec2(position[0] * span, position[1] * span);
}

void main() {
  // update the size of a point based on the prop base and extra point size
  gl_PointSize = basePointSize + extraPointSize;

  // send color to the fragment shader
  fragColor = color;

  // scale to normalized device coordinates gl_Position is a special variable
  // that holds the position of a vertex
  gl_Position = camera * vec4(normalizeCoords(position), 0.0, 1.0);
}
`;

export default VERTEX_SHADER;
