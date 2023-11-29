#iChannel0 "file://noise_seamless.jpg"

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords / iResolution.xy;
    uv.x *= iResolution.x / iResolution.y;

    // float cells = 10.;

    // uv *= cells;

    // vec2 id = floor(uv);
    // uv = fract(uv);


    float n = clamp((texture(iChannel0, fract(uv + iTime/10.)).x - .45) * 3., 0., 1.);

    vec3 col = vec3(n);

    fragColor = vec4(col, 1.);
}