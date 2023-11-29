void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - .5 * iResolution.xy) / iResolution.y;

    vec3 ro = vec3(0, 0, -1);

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

    float planeB, planeL, planeR, planeT;

    for(int i = 0 ; i < 100 ; i++) {
        p = ro + rd * dO;

        planeB = p.y + 9.4;
        planeT = -p.y + 9.4;
        planeL = p.x + 12.5;
        planeR = -p.x + 9.4;

        dS = planeB;
        dS = min(dS, planeT);
        dS = min(dS, planeL);
        dS = min(dS, planeR);
        if (dS < .001) {
            break;
        }
        dO += dS;
    }

    if (dS < .001) {
        float x = p.x;
        float y = p.z + t * 15.;
        if (dS == planeL || dS == planeR) {
            y = p.y;
            x = p.z + t * 15.;
            col += step(.2, sin(y)*sin(x));
        } else {
            col += step(.002, sin(y)*sin(x));
        }

    }

    fragColor = vec4(col * (1. - p.z/60.), 1.);

}