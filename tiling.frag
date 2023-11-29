precision mediump float;
#define PI 3.14159265359
#define speed 2.

float Hash21(vec2 p) {
    p = fract(p * vec2(233.34, 856.43));
    p += dot(p, p + 32.57);
    return fract(p.x * p.y);
}


vec3 Grid(vec2 ouv) {
    vec3 col = vec3(0.);
    float cols = 16.;



    vec2 nuv = ouv * cols + vec2(0., iTime * speed);

    vec2 cell = floor(nuv);

    float ratio = 1.;




    float rows = cols;// + sin(iTime)*8.;//cell.x/2. + 1.;
    rows *= clamp(.1, 1., Hash21(vec2(cell.x + 1.)));
    nuv = ouv * vec2(cols, rows) + vec2(0., iTime * speed);
    vec2 uv = fract(nuv);
    cell = floor(nuv);
    ratio = rows/cols;



    if (uv.x > .98 || uv.y > .98) {
        // col.r = 1.;
    }

    uv -= .5;
    uv.x *= ratio;

    vec2 center = vec2(0.);
    float size = Hash21(cell)*0.015 * sin(iTime*5. + cell.x + cell.y);
    col += smoothstep(.0,0.99,.01 + size/distance(uv, center) * sin(vec3(0.9, 0.9, 0.9)));

    // col.rg += uv;

    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y + .5;

    vec3 col = vec3(0.);


    col = Grid(uv);

    // col += .01/length(uv);


    fragColor = vec4(col, 1.);
}