precision mediump float;
#define PI 3.14159265359

#define SECTORS 20.
#define CELLS 20.

mat2 rot2d(float a) {
    return mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
}

float r21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec3 col = vec3(.0);

    vec2 c = vec2(0.);


    float d = length(uv - c);
    float r = .5;

    float cell = floor(d * SECTORS / r);

    uv *= rot2d(sin(cell*4. + iTime));

    float a = (atan(uv.x, uv.y) + PI) / PI;
    float cellX = floor(a * CELLS*(cell*.3));

    vec2 cuv = vec2(cell/SECTORS, cellX/CELLS);

    // cuv *= rot2d(iTime*100.);

    float cd = length(cuv);// length(sin(cuv / cos(iTime)));
    float cc = step(cd, 2.9 * sin(iTime) + 2.9);



    // col += r21(vec2(cell, cellX));
    col += vec3(.9, .3, .1) * cc;

    col *= step(d, r);




    fragColor = vec4(col, 0.);

}