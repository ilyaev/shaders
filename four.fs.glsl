precision mediump float;
varying vec3 vUv;
uniform float t;
uniform float rad;
uniform vec2 u_resolution;

const float PI = 3.1415926535897932384626433832795;
const float PI_2 = 1.57079632679489661923;
const float PI_4 = 0.785398163397448309616;
const float PI2 = PI * 2.0;

mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main() {
    vec2 st = vUv.xy / u_resolution; //gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    // st.y -= 0.

    float l = length(st);

    // float color = sin(st.x * 80.0 + cos(sin(t + st.x*2.0) + st.y * 2.9) * 10.0);

    // float color = sin(st.x * 80.0 + cos(cos(t + (st.x + st.y ) * 2.0)) * 10.0);

    float color = sin(t*10.0 - l * 40.0);


    // color *= sin(l * 20.0);

    // color += cos(st.x * 40.0 + sin(cos(t + st.x*5.0) + st.y * 6.9) * 5.0);

    // color += cos(t + st.y *15.0);

    color *= l;

    gl_FragColor = vec4(vec3(color), 1.0);
}