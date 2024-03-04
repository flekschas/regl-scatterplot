const FRAGMENT_SHADER = `
precision highp float;

uniform float relativePointOffset;
uniform float minHalfResolution;

varying vec4 vColor;
varying vec2 vPosition;
varying float vRadiusSquared;

vec4 sample(float d2, float r2) {
  if (d2 > r2) {
    return vec4(vColor.rgb, 0.0);
  }
  return vColor;
}

void main() {
  vec2 p1 = vPosition + vec2(-relativePointOffset, +relativePointOffset);
  vec2 p2 = vPosition + vec2(+relativePointOffset, +relativePointOffset);
  vec2 p3 = vPosition + vec2(+relativePointOffset, -relativePointOffset);
  vec2 p4 = vPosition + vec2(-relativePointOffset, -relativePointOffset);
  float d1 = dot(p1, p1);
  float d2 = dot(p2, p2);
  float d3 = dot(p3, p3);
  float d4 = dot(p4, p4);
  vec4 pc = vec4(0.0);
  pc += sample(d1, vRadiusSquared);
  pc += sample(d2, vRadiusSquared);
  pc += sample(d3, vRadiusSquared);
  pc += sample(d4, vRadiusSquared);
  if (pc.a == 0.0) {
    discard;
  }
  gl_FragColor = 0.25 * pc;
}
`;

export default FRAGMENT_SHADER;
