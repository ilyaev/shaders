float getDot(vec3 ro, vec3 rd, vec3 p) {
    float d = length(cross(rd, p - ro))/length(rd);
    return 1. - step(0.05, d);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv -= 0.5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 col = vec3(0.);

    vec3 ro = vec3(3.*sin(iTime), 2., -3.*cos(iTime)) + .5;
    vec3 lookat = vec3(.5);
    float zoom = .4;

    vec3 f = normalize(lookat - ro);
    vec3 r = cross(vec3(0., 1., 0), f);
    vec3 u = cross(f, r);
    vec3 c = ro + f * zoom;
    vec3 i = c + uv.x*r + uv.y * u;

    vec3 rd = i - ro;


    col += getDot(ro, rd, vec3(0., 0., 0.));
    col += getDot(ro, rd, vec3(0., 0., 1.));
    col += getDot(ro, rd, vec3(0., 1., 0.));
    col += getDot(ro, rd, vec3(0., 1., 1.));
    col += getDot(ro, rd, vec3(1., 0., 0.));
    col += getDot(ro, rd, vec3(1., 0., 1.));
    col += getDot(ro, rd, vec3(1., 1., 0.));
    col += getDot(ro, rd, vec3(1., 1., 1.));

    fragColor = vec4(col, 1.);

}