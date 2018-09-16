const FRAGMENT_SHADER = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision mediump float;

// this value is populated by the vertex shader
varying vec4 vFragColor;

void main() {
  float r = 0.0, delta = 0.0, alpha = 1.0;
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  r = dot(cxy, cxy);

  #ifdef GL_OES_standard_derivatives
    delta = fwidth(r);
    alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
  #endif

  // gl_FragColor is a special variable that holds the color of a pixel
  gl_FragColor = vec4(
    vFragColor[0], vFragColor[1], vFragColor[2], alpha * vFragColor[3]
  );
}
`;

export default FRAGMENT_SHADER;
