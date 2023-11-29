float n21(vec2 p) {
    return fract(sin(p.x*123.231 + p.y*4432.342)*33344.22);
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    uv /= 2.5;

    vec3 col = vec3(0.);

    float cells = 35.;


    // uv = fract(uv * vec2(5., 1.)) - .5;

    float a = atan(uv.x, uv.y) / 6.28 + .5 + iTime/8.;
    float l = length(uv);

    uv = vec2(a, l);

    float id = mod(floor(uv.x * cells), cells);
    uv.x = fract(uv.x * cells) - .5;

    uv.y *= cells;

    float d = length(uv - vec2(0.,5.56));

    float n = n21(vec2(id));// + floor(iTime*5.));

    float rad = .4 * max(.3, fract(n*23421.22));
    vec3 rcol = vec3(n, fract(n*123.3), fract(n*5678.32));

    // col += step(d, rad) * rcol;
    rcol = vec3(sin(id/5. + iTime*3.)*.5 + .5) * rcol;
    col += (rad*.2)/d * rcol * step(d, rad);


    fragColor = vec4(col, 1.);
}