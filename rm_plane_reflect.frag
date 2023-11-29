#define t iTime / 2.
#define FAR_DISTANCE 40.
#define sunColor vec3(0.9, 0.3, 0.1)

vec3 getDist(vec3 p) {
    float material = 0.;
    float planeB = p.y + 9.4 + sin(p.x/8. + t*4.)*3.;
    float backPlane = -p.z + 30.4;

    float dS = planeB;

    dS = min(dS, backPlane);

    if (dS == backPlane) {
        material = 1.;
    }

    return vec3(dS, material, 1.);
}

vec4 trace(vec3 ro, vec3 rd) {
    vec3 p;

    float planeB, planeL, planeR, planeT, backPlane;
    float material;
    vec3 dist;

    float dS, dO;

    for(int i = 0 ; i < 100 ; i++) {
        p = ro + rd * dO;

        dist = getDist(p);
        dS = dist.x;
        material = dist.y;

        if (dS < .001 || dS > FAR_DISTANCE) {
            break;
        }
        dO += dS;
    }
    return vec4(dS, dO, dist.x, dist.y);
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.01, 0.);
    float d = getDist(p).x;
    vec3 n = d - vec3(getDist(p - e.xyy).x, getDist(p - e.yxy).x, getDist(p - e.yyx).x);
    return normalize(n);
}

vec3 getColor(vec3 p, float material) {
    vec3 col = vec3(0.);
    if (material == 0.) {
        float x = p.x;
        float y = p.z + t * 25.;
        col += step(.002, sin(y)*sin(x));
    } else if (material == 1.) {
        float h = sin(iTime/3.)*15.;
        float flare = 5.9 - h/3.;
        float size = 15.2 + h /3.;
        // vec3 sky = pow(13.2/(p.y + 13.5), .2) * vec3(0.4, 0.3, 0.9);
        // col = sky;
        col += pow(size/distance(p.xy, vec2(0.,h)), flare) * sunColor;
    }
    return col;
}


void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - .5 * iResolution.xy) / iResolution.y;

    vec3 ro = vec3(0, .2, -1);

    vec3 lookat = vec3(0);

    float zoom = .5;

    vec3 f = normalize(lookat - ro); // forward vector
    vec3 r = normalize(cross(vec3(0,1,0), f)); // right vector UP x F
    vec3 u = cross(f, r); // camera UP
    vec3 c = ro + f * zoom;  // center of virtual screen
    vec3 i = c + uv.x * r + uv.y * u;// intersection point with virtual screen (camera)
    vec3 rd = normalize(i - ro);

    vec3 col = vec3(0);

    vec4 tr = trace(ro, rd);

    float dS = tr.x;
    float dO = tr.y;
    float material = tr.a;

    vec3 p = ro + rd * dO;

    if (dS < .001) {
        col = getColor(p, material);
        if (material == 0.) {
            vec3 normal = getNormal(p);
            vec3 rrd = reflect(rd, normal);
            vec4 rhmap = trace(p + rrd*0.01, rrd);
            vec3 rp = p + rrd*0.01 + rrd * rhmap.y;
            vec3 rcol = getColor(rp, rhmap.a);
            col = col * rcol*4.;
        }

    }

    float fade = (1. - p.z/60.);

    fragColor = vec4(col * fade, 1.);

}