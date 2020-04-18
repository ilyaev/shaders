float DistLine(vec3 ro, vec3 rd, vec3 p) {
    return length(cross(rd, p - ro))/length(rd);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;
    vec3 col = vec3(0.);

    vec3 ro = vec3(0., 0., -2.);
    vec3 rd = vec3(uv.x, uv.y, 0.) - ro;

    vec3 p = vec3(0. + sin(iTime), 0., 3. + cos(iTime));

    float d = DistLine(ro, rd, p);

    col += 1. - step(.1, d);

    fragColor = vec4(col, 1.);

}