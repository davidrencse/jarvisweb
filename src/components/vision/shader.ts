export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

/*
 * One full-frame pass over two screenshots:
 *  - a scan transition that paints the incoming shot's Sobel edges first, then its pixels;
 *  - an edge view (Sobel magnitude over a dim luma base) for "vision" mode and for
 *    everything outside a focused region;
 *  - a pointer lens that magnifies and flips between edge and pixel view.
 */
export const fragmentShader = /* glsl */ `
  uniform sampler2D uA;
  uniform sampler2D uB;
  uniform float uAspA;
  uniform float uAspB;
  uniform float uFrame;
  uniform vec2 uTexA;
  uniform vec2 uTexB;
  uniform float uProg;
  uniform float uVision;
  uniform vec4 uFocus;
  uniform float uFocusOn;
  uniform vec2 uMouse;
  uniform float uLens;
  uniform float uLensR;
  uniform float uTime;
  uniform float uOn;

  varying vec2 vUv;

  const float BAND = 0.18;
  const float MAG = 1.75;

  float luma(vec3 c) {
    return dot(sqrt(max(c, 0.0)), vec3(0.2126, 0.7152, 0.0722));
  }

  vec2 fitUv(vec2 c, float ia, out float inside) {
    vec2 s = ia > uFrame ? vec2(1.0, uFrame / ia) : vec2(ia / uFrame, 1.0);
    vec2 u = (c - 0.5) / s + 0.5;
    vec2 q = step(vec2(0.0), u) * step(u, vec2(1.0));
    inside = q.x * q.y;
    return u;
  }

  vec3 tapA(vec2 c) {
    float i;
    vec2 u = fitUv(c, uAspA, i);
    return texture(uA, u).rgb * i;
  }

  vec3 tapB(vec2 c) {
    float i;
    vec2 u = fitUv(c, uAspB, i);
    return texture(uB, u).rgb * i;
  }

  float lumB(vec2 u) {
    return luma(texture(uB, u).rgb);
  }

  float sobelB(vec2 c) {
    float i;
    vec2 u = fitUv(c, uAspB, i);
    vec2 t = uTexB;
    float tl = lumB(u + t * vec2(-1.0, 1.0));
    float tc = lumB(u + t * vec2(0.0, 1.0));
    float tr = lumB(u + t * vec2(1.0, 1.0));
    float ml = lumB(u + t * vec2(-1.0, 0.0));
    float mr = lumB(u + t * vec2(1.0, 0.0));
    float bl = lumB(u + t * vec2(-1.0, -1.0));
    float bc = lumB(u + t * vec2(0.0, -1.0));
    float br = lumB(u + t * vec2(1.0, -1.0));
    float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
    float gy = -bl - 2.0 * bc - br + tl + 2.0 * tc + tr;
    return clamp(length(vec2(gx, gy)) * 1.35, 0.0, 1.0) * i;
  }

  vec3 edgeView(vec2 c, vec3 base) {
    float e = sobelB(c);
    return vec3(e * 0.95 + luma(base) * 0.14);
  }

  void main() {
    vec2 c = vUv;
    float y = 1.0 - c.y;
    vec3 b = tapB(c);

    // Scan transition, top to bottom.
    vec3 col = b;
    if (uProg < 1.0) {
      vec3 a = tapA(c);
      float d = uProg * (1.0 + BAND) - y;
      float m = smoothstep(0.0, BAND, d);
      float inBand = step(0.0, d) * (1.0 - m);
      col = mix(a, b, m);
      col = mix(col, vec3(sobelB(c)), inBand * 0.92);
      col += vec3(0.85) * exp(-abs(d) * 700.0) * step(0.001, uProg);
    }

    // Focus rect: soft edge, about 2px.
    vec2 px = vec2(fwidth(c.x), fwidth(c.y)) * 2.0;
    vec2 lo = smoothstep(uFocus.xy - px, uFocus.xy, c);
    vec2 hi = 1.0 - smoothstep(uFocus.zw, uFocus.zw + px, c);
    float inFocus = lo.x * lo.y * hi.x * hi.y;

    float w = max(uVision, uFocusOn) * (1.0 - inFocus * uFocusOn);
    vec3 view = edgeView(c, col);

    // Detector sweep in vision mode.
    float sweep = fract(uTime * 0.11);
    view += vec3(sobelB(c)) * exp(-abs(y - sweep) * 38.0) * 0.55 * uVision;
    view += vec3(0.5) * exp(-abs(y - sweep) * 900.0) * uVision * 0.5;

    col = mix(col, view, w);

    // Lens.
    if (uLens > 0.001) {
      vec2 off = (c - uMouse) * vec2(uFrame, 1.0);
      float dist = length(off);
      float aa = max(fwidth(dist), 0.00001);
      float R = uLensR * uLens;
      vec2 lc = uMouse + (c - uMouse) / mix(1.0, MAG, uLens);
      vec3 lb = tapB(lc);
      vec3 inside = mix(edgeView(lc, lb) * 1.15, lb, step(0.5, w));
      float disk = clamp((R - dist) / aa + 0.5, 0.0, 1.0);
      col = mix(col, inside, disk);

      float ring = clamp(1.0 - abs(dist - R) / aa, 0.0, 1.0);
      float tick = step(abs(off.x), aa) + step(abs(off.y), aa);
      float ticks = clamp(tick, 0.0, 1.0) * step(R, dist) * step(dist, R + 0.022);
      float cross = clamp(tick, 0.0, 1.0) * step(dist, 0.012) * step(0.004, dist);
      col = mix(col, vec3(1.0), clamp(ring + ticks + cross * disk, 0.0, 1.0) * uLens * 0.9);
    }

    gl_FragColor = vec4(col, uOn);
    #include <colorspace_fragment>
  }
`;
