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

    float rad = 9.4;

    float dY = rad;
    float dX = rad*(iResolution.x/iResolution.y);

    for(int i = 0 ; i < 100 ; i++) {
        p = ro + rd * dO;
        // dS = (length(vec2(length(p.xz) - 1., p.y)) - .75); //DS for Torus

        // planeB = p.y + 9.4 -  + sin(p.x/3.14/2.9 + 3.14/2. + iTime)*cos(p.z)*.5;;
        // planeT = -p.y + 9.4 + sin(p.x/3.14/2.9 + 3.14/2. + iTime)*7.;
        // planeT = -abs(p.y) + 9.4*cos(0.2225 + p.x/6.95) + sin(p.y);
        // planeT = -abs(p.y*sin(p.x/(6.28*2.))) + rad*cos(p.y/(6.28*2.));


        planeT = -p.y + rad*sin(p.y/dY) + rad*cos(p.x/dX);
        planeB = p.y - rad*sin(p.y/dY) + rad*cos(p.x/dX);
        // planeL = p.x + 12.5;
        // planeR = -p.x + 9.4;

        dS = planeT;
        dS = min(dS, planeB);
        // dS = min(dS, planeL);
        // dS = min(dS, planeR);
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
            // col += step(.2, sin(y)*sin(x));
            col += step(p.y, sin(p.z + iTime*10.) + cos(p.z*2.)*.5);
        } else {
            col += step(.002, sin(y)*sin(x));
            // col += step(.1, sin(y));
        }

    }

    fragColor = vec4(col * (1. - p.z/60.), 1.);

}