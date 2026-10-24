export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  uniform sampler2D uLight;
  uniform sampler2D uDark;
  uniform vec2 uTexSize;
  uniform vec2 uMouse;
  uniform float uOn;
  uniform float uAspect;
  uniform float uMix;
  uniform float uReveal;
  uniform float uLens;
  uniform float uLensR;
  uniform float uCells;

  varying vec2 vUv;

  const float BIAS = -0.45;
  const float BAND = 0.24;
  const float WIPE = 0.38;
  const float MAG = 1.8;
  const float FADE_FROM = 0.84;
  const float CORNER = 0.017;
  const vec3 INK = vec3(0.00304);

  float smooth01(float x) {
    x = clamp(x, 0.0, 1.0);
    return x * x * (3.0 - 2.0 * x);
  }

  // Diagonal wipe, top-left to bottom-right: 0 = light, 1 = dark.
  float wipeAt(vec2 uv) {
    float diag = (uv.x * uAspect + (1.0 - uv.y)) / (uAspect + 1.0);
    return smooth01((uMix * (1.0 + WIPE) - diag) / WIPE);
  }

  vec3 shot(vec2 uv) {
    vec3 col = texture(uLight, uv, BIAS).rgb;
    if (uMix > 0.0) {
      col = mix(col, texture(uDark, uv, BIAS).rgb, wipeAt(uv));
    }
    return col;
  }

  // Ink dots on paper; dot area follows how dark the cell is.
  vec3 halftone(vec2 uv) {
    vec2 cells = vec2(uCells, uCells / uAspect);
    vec2 g = vec2(uv.x, 1.0 - uv.y) * cells;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    vec2 cuv = vec2((id.x + 0.5) / cells.x, 1.0 - (id.y + 0.5) / cells.y);
    float lod = log2(uTexSize.x / cells.x);

    vec3 c = textureLod(uLight, cuv, lod).rgb;
    if (uMix > 0.0) {
      c = mix(c, textureLod(uDark, cuv, lod).rgb, wipeAt(cuv));
    }

    float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float r = 0.6 * sqrt(clamp(1.0 - luma, 0.0, 1.0));
    float w = max(fwidth(g.x), 0.0001);
    float dotA = 1.0 - smoothstep(r - w, r + w, length(f));
    return mix(vec3(1.0), INK, dotA);
  }

  void main() {
    vec2 uv = vUv;
    vec3 col = shot(uv);

    if (uReveal < 1.0) {
      float front = uReveal * (1.0 + BAND);
      float r = smooth01((front - (1.0 - uv.y)) / BAND);
      col = mix(halftone(uv), col, r);
    }

    float ringA = 0.0;
    vec3 ringCol = INK;
    if (uLens > 0.001) {
      float e = smooth01(uLens);
      float R = uLensR * e;
      float dist = length((uv - uMouse) * vec2(uAspect, 1.0));
      float px = max(fwidth(dist), 0.00001);
      vec3 magnified = shot(uMouse + (uv - uMouse) / mix(1.0, MAG, e));
      col = mix(col, magnified, 1.0 - clamp((dist - R) / px + 0.5, 0.0, 1.0));
      ringA = clamp(1.0 - abs(dist - R) / px, 0.0, 1.0) * e;
      if (uMix > 0.0) {
        ringCol = mix(INK, vec3(1.0), wipeAt(uv));
      }
    }

    col = mix(col, vec3(1.0), smooth01((1.0 - uv.y - FADE_FROM) / (1.0 - FADE_FROM)));
    col = mix(col, ringCol, ringA);

    vec2 hb = vec2(uAspect, 1.0) * 0.5 - CORNER;
    vec2 dd = abs((uv - 0.5) * vec2(uAspect, 1.0)) - hb;
    float cd = length(max(dd, 0.0)) - CORNER;
    float aa = max(fwidth(cd), 0.00001);
    float inCorner = step(0.0, min(dd.x, dd.y));
    float alpha = mix(1.0, clamp(0.5 - cd / aa, 0.0, 1.0), inCorner) * uOn;

    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;
