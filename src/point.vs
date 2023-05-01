const createVertexShader = (globalState) => `
precision highp float;

uniform sampler2D colorTex;
uniform float colorTexRes;
uniform float colorTexEps;
uniform sampler2D stateTex;
uniform float stateTexRes;
uniform float stateTexEps;
uniform float devicePixelRatio;
uniform sampler2D encodingTex;
uniform float encodingTexRes;
uniform float encodingTexEps;
uniform float pointSizeExtra;
uniform float pointOpacityMax;
uniform float pointOpacityScale;
uniform float numPoints;
uniform float globalState;
uniform float isColoredByZ;
uniform float isColoredByW;
uniform float isOpacityByZ;
uniform float isOpacityByW;
uniform float isOpacityByDensity;
uniform float isSizedByZ;
uniform float isSizedByW;
uniform float isSizeByDensity;
uniform float colorMultiplicator;
uniform float opacityMultiplicator;
uniform float opacityDensity;
uniform float sizeMultiplicator;
uniform float pointSizeDensity;
uniform float numColorStates;
uniform float pointScale;
uniform mat4 modelViewProjection;
uniform float minHalfResolution;

attribute vec2 stateIndex;
attribute vec2 position;

varying vec4 vColor;
varying vec2 vPosition;
varying float vRadiusSquared;

void main() {
  vec4 state = texture2D(stateTex, stateIndex);

  // Determine color index
  float colorIndexZ =  isColoredByZ * floor(state.z * colorMultiplicator);
  float colorIndexW =  isColoredByW * floor(state.w * colorMultiplicator);

  // Multiply by the number of color states per color
  // I.e., normal, active, hover, background, etc.
  float colorIndex = (colorIndexZ + colorIndexW) * numColorStates;

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

  vColor = texture2D(colorTex, colorTexIndex);

  float radius = 1.0;

  if (isSizeByDensity < 0.5) {
    // Retrieve point size from texture
    float pointSizeIndexZ = isSizedByZ * floor(state.z * sizeMultiplicator);
    float pointSizeIndexW = isSizedByW * floor(state.w * sizeMultiplicator);
    float pointSizeIndex = pointSizeIndexZ + pointSizeIndexW;

    float pointSizeRowIndex = floor((pointSizeIndex + encodingTexEps) / encodingTexRes);
    vec2 pointSizeTexIndex = vec2(
      (pointSizeIndex / encodingTexRes) - pointSizeRowIndex + encodingTexEps,
      pointSizeRowIndex / encodingTexRes + encodingTexEps
    );
    radius = texture2D(encodingTex, pointSizeTexIndex).x + pointSizeExtra;
  } else {
    // Determine density based-point size
    radius = pointSizeDensity + pointSizeExtra;
  }

  // Retrieve opacity
  ${
    (() => {
      // Drawing the inner border of selected points
      if (globalState === 3) return '';

      // Draw points with opacity encoding or dynamic opacity
      return `
        if (isOpacityByDensity < 0.5) {
          float opacityIndexZ = isOpacityByZ * floor(state.z * opacityMultiplicator);
          float opacityIndexW = isOpacityByW * floor(state.w * opacityMultiplicator);
          float opacityIndex = opacityIndexZ + opacityIndexW;

          float opacityRowIndex = floor((opacityIndex + encodingTexEps) / encodingTexRes);
          vec2 opacityTexIndex = vec2(
            (opacityIndex / encodingTexRes) - opacityRowIndex + encodingTexEps,
            opacityRowIndex / encodingTexRes + encodingTexEps
          );
          vColor.a = texture2D(encodingTex, opacityTexIndex)[${1 + globalState}];
        } else {
          vColor.a = min(1.0, opacityDensity + globalState);
        }
      `;
    })()
  }

  vColor.a = min(pointOpacityMax, vColor.a) * pointOpacityScale;

  // To clip coordinats
  radius = radius / minHalfResolution;
  vPosition = position * radius;

  vRadiusSquared = radius * radius;

  // The point center
  gl_Position = modelViewProjection * vec4(state.x + vPosition.x, state.y + vPosition.y, 0.0, 1.0);
}
`;

export default createVertexShader;
