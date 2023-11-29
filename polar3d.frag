void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 col = vec3(0.);

    vec3 ro = vec3(0., 0., -3);
    vec3 lookat = vec3(0., 0., 0.);
    float zoom = 1.;

    vec3 f = normalize(lookat - ro);
    vec3 r = cross(vec3(.0, 1., 0.), f);
    vec3 u = cross(f, r);

    vec3 c = ro + f * zoom;
    vec3 i = c + uv.x*r + uv.y*u;
    vec3 rd = normalize(i - ro);


    float ds, dt;
    for(int i = 0 ; i < 100 ; i++) {
        vec3 p = ro + rd * dt;

        dt = length(p) - .1;
        ds += dt;

        if (abs(dt) < 0.001 || dt > 10.) {
            break;
        }

    }


    fragColor = vec4(col, 1.);
}