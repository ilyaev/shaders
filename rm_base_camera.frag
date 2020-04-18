float DistLine(vec3 ro, vec3 rd, vec3 p) {
    return length(cross(rd, p - ro))/length(rd);
}


float DrawPoint(vec3 ro, vec3 rd, vec3 p) {
    float d = DistLine(ro, rd, p);
    return 1. - step(.05, d);
}


void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;
    vec3 col = vec3(0.);

    // uv.y = abs(uv.y);

    vec3 ro = vec3(3.*sin(iTime), 2., -3.*cos(iTime)) + .5;
    vec3 lookat = vec3(.5);
    float zoom = .4;

    vec3 F = normalize(lookat - ro);
    vec3 R = cross(vec3(0., 1., 0), F);
    vec3 U = cross(F, R);
    vec3 C = ro + F*zoom;
    vec3 i = C + uv.x*R + uv.y*U;

    vec3 rd = i - ro;

    vec3 p = vec3(0. + sin(iTime), 0., 3. + cos(iTime));


    col += DrawPoint(ro, rd, vec3(0.,0.,0.));
    col += DrawPoint(ro, rd, vec3(0.,0.,1.));
    col += DrawPoint(ro, rd, vec3(0.,1.,0.));
    col += DrawPoint(ro, rd, vec3(0.,1., 1.));
    col += DrawPoint(ro, rd, vec3(1.,0.,0.));
    col += DrawPoint(ro, rd, vec3(1.,0.,1.));
    col += DrawPoint(ro, rd, vec3(1.,1.,0.));
    col += DrawPoint(ro, rd, vec3(1.,1.,1.));

    fragColor = vec4(col, 1.);

}