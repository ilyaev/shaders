float n21 (vec2 p) {
    return fract(sin(p.x*124.43 + p.y*5432.)*44433.);
}

vec3 getColorByIndex(float id) {
    float n = n21(vec2(id));
    vec3 color = vec3(sin(n+iTime), fract(n*10.23), fract(n*453.223));
    return color;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 col = vec3(0.);

    float circles = 15.;

    float a = atan(uv.x, uv.y) / 6.24 + .5;

    float len = length(uv);

    float d = len + iTime*0. + a/circles;

    float nd = d * circles;

    float id = floor(nd);
    float df = fract(nd);

    col += 1. - step(.9, df);

    vec3 color = getColorByIndex(id);
    vec3 color1 = getColorByIndex(id + 1.);

    color = mix(color, color1, 1. - a);

    // color = vec3(step(.1,df)*sin(a));

    uv.x = a * 4. + .44;
    uv.y = df;

    color *= vec3(step(.01, sin(uv.x*20.*id + iTime*21.) / cos(uv.y*circles/9.)));

    float fade = 1.;//smoothstep(.0, .1, pow(length(uv),2.));

    fragColor = vec4(fade * col * color, 1.);

}