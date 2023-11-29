void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy/iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x/iResolution.y;

    vec3 col = vec3(0.2);


    vec2 center = vec2(0.);
    vec2 point = vec2(0., .3);

    float m1 = 10.;
    float m2 = 1.;
    float G = 6.7;

    vec2 fg = normalize(center - point);

    float gm = (m1 * m2) / pow(length(fg), 2.);

    point += fg * gm*(iTime/100.);


    col += step(distance(uv, center), .01);
    col += step(distance(uv, point), .005) * vec3(0.9, .5, .3);

    // col.rg = uv;

    fragColor = vec4(col, 1.);
}