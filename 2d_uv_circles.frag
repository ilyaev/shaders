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

vec3 getCellColor(vec2 cell) {
    float n = rand(cell);
    if (n > .5) {
        return vec3(0.3*n, .3*n, .1*n);
    }
    return vec3(0., 0.1, n);
    // return vec3(rand(cell)) * .3;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec3 col = vec3(.0);

    float d = fract(length(uv) * CIRCLES);
    float row = floor(length(uv) * CIRCLES);

    CIRCLES -= row/1.5;

    d = fract(length(uv) * CIRCLES);
    row = floor(length(uv) * CIRCLES);

    uv *= rot2d(sin(row + 1.) * iTime*.5); // * iTime

    float a = (atan(uv.x, uv.y) + PI) / PI;

    // CELLS *= rand(vec2(row, 2.));

    float cell = floor(a * CELLS);
    vec2 cuv = vec2(d, fract(a * CELLS));

    float nextCell = cell + 1.;
    if (nextCell == CELLS*2.) {
        nextCell = 0.;
    }

    vec3 c1 = getCellColor(vec2(row, cell));
    vec3 c2 = getCellColor(vec2(row, nextCell));
    // vec3 c3 = getCellColor(vec2(row + 1., cell));

    vec3 c = mix(c1, c2, cuv.y);
    // c = mix(c1, c3, cuv.x);

    col += c;

    col *= 2.6/pow(length(uv), 1.)*0.1;

    fragColor = vec4(col, 0.);

}