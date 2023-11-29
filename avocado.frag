precision mediump float;
#define PI 3.14159265359

float CELLS = 100.0;




float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 CENTER = vec2(CELLS/2., CELLS/2.);
    float ratio = iResolution.x / iResolution.y;

    vec2 guv = CELLS * fragCoord.xy / iResolution.xy;
    guv.x *= ratio;

    vec2 cell = floor(guv);
    vec2 uv = fract(guv);

    vec3 color = vec3(0.);

    // float dist = distance(cell, CENTER) + sin(cell.x*2.)*cos(cell.y*2.);
    float dist = distance(cell, CENTER + vec2(sin(iTime*10. + cell.x/8.), cos(iTime*10. + cell.y/8.)));

    if (dist < 20. + sin(iTime)*cos(cell.x*uv.y/12.) * 29.) {
        // color +=  1.0 - vec3(dist)/38.;
        color +=  0.2 / pow(dist/38., 0.8);
    }

    float dist2 = distance(cell, vec2(0., 0.) + abs(sin(iTime*2.)*100.));
    if (dist2 < 50.) {
        // color = mix(color, 1.0 - vec3(dist2/50.), .9);
    }

    // color += vec3(rand(cell));

    fragColor = vec4(color * vec3(abs(sin(iTime/2.)), guv.x/38., 0.), 1.0);

}