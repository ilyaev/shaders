precision mediump float;
#define PI 3.14159265359

float CIRCLES = 110.0;
float CELLS = 10.;

mat2 rot2d(float a) {
    return mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
}

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec3 col = vec3(.0);

    float d = fract(length(uv) * CIRCLES);
    float row = floor(length(uv) * CIRCLES);

    uv *= rot2d(iTime * sin(row + 1.));

    float a = (atan(uv.x, uv.y) + PI) / PI;

    float cell = floor(a * CELLS);

    col += rand(vec2(row, cell)) * .3;

    fragColor = vec4(col, 0.);

}