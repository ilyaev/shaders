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
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(0.0);

    st -= vec2(0.5);
    st = rotate2d(t + 2.0*cos(sin(t + exp(st.y)*2.0))) * st;
    st += vec2(0.5);

    st = fract(st * 2.0);


    gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);
}