void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - .5 * iResolution.xy) / iResolution.y;

    vec3 ro = vec3(0, 3, -3);

    vec3 lookat = vec3(0);

    float zoom = .5;

    float t = iTime / 2.;

    vec3 f = normalize(lookat - ro); // forward vector
    vec3 r = normalize(cross(vec3(0,1,0), f)); // right vector
    vec3 u = cross(f, r); // camera UP
    vec3 c = ro + f * zoom;  // center of virtual screen
    vec3 i = c + uv.x * r + uv.y * u;// intersection point with virtual screen (camera)
    vec3 rd = normalize(i - ro);

    vec3 col = vec3(0);

    float dS, dO;
    vec3 p;

    for(int i = 0 ; i < 100 ; i++) {
        p = ro + rd * dO;
        dS = (length(vec2(length(p.xz) - 1., p.y)) - .75); //DS for Torus
        if (dS < .001) {
            break;
        }
        dO += dS;
    }

    if (dS < .001) {
        float x = atan(p.x, p.z);
        float y = atan(length(p.xz) - 1., p.y);
        // float bands = sin(y*10.+ x*20.);
        // float ripples = sin((x*10.- y*20.)*3.)*.5 + .5;
        // float waves = sin(x*2.- y*6. + t *20.);
        // float b1 = smoothstep(-.2, .2, bands);
        // float b2 = smoothstep(-.2, .2, bands-.5);
        // float m = b1*(1.-b2);
        // m = max(m, ripples * b2 * clamp(0.,1., waves));
        col += y;
    }

    fragColor = vec4(col, 1.);

}