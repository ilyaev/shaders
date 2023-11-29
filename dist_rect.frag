float rectDist(vec2 uv, vec2 size) {
    uv = abs(uv);
    return max(uv.x/size.x, uv.y/size.y);
}


void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    float scale = 13.;


    vec3 col = vec3(0.);

    // float a = rectDist(uv, size)*scale;

    // uv *= mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));

    float d = rectDist(uv, vec2(1., 1.));

    float df = fract(d*scale + iTime);




    col += df;//step(df, 0.2) - step(df, .13);

    fragColor = vec4(col, 1.);

}