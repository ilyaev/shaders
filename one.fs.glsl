varying vec3 vUv;
uniform float t;
uniform float rad;
uniform vec2 u_resolution;

float plot(vec2 st, float pct) {
//   return  smoothstep(pct - 0.02, pct, st.y) - smoothstep(pct, pct + 0.02, st.y);
     return step(pct, st.y) - step(pct + 0.005, st.y);
}

vec3 green = vec3(0.0,1.0,0.0);

void main() {
    vec2 st = vUv.xy / u_resolution + vec2(0.5, 0.5);

    // float y = st.x;

    // vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // float y = pow(st.x, 5.0 * abs(sin(t)));
    // float y = sin(st.x) ;

    // float y = smoothstep(0.0,0.5,st.x) - smoothstep(0.5,1.0,st.x);

    float y1 = sin(t*3.0 + st.x * 5.0);
    float y2 = cos(t*3.0 - st.x * 20.0);
    // float y2 = cos(st.x * 50.0) / 2.0;

    float y = y1 * y2 * 0.15 + 0.2;

    vec3 color = vec3(y);

    float pct = plot(st, y);

    color = (1.0 - pct) * color; // gradient

    color = color + pct * green; // plot

	gl_FragColor = vec4(color, 1.0);
}