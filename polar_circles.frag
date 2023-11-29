

void mainImage (out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 col = vec3(0.);

    float a = atan(uv.x, uv.y) / 6.28 + .5 - iTime/10.;
    float l = length(uv);

    // col += fract(a*3.14) * fract(l*13.);

    uv = vec2(fract(a*3.), fract(l*10.));

    float lid = floor(l*10.);
    float aid = floor(a);


    uv -= .5;

    // uv.x *= iTime;
    uv.x *= (lid + 1.);
    uv.y *= (aid + 1.);
    // uv.y *= (lid/5. + 1.);
    // uv.y /= aid;

    col += step(.9, 0.1/length(uv));




    fragColor = vec4(col, 1.);

}