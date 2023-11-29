#define MAX_STEPS 128
#define MAX_DISTANCE 10.
#define MIN_DISTANCE 0.001

float n21(vec2 p) {
    return fract(sin(p.x*123.453 + p.y*4567.543) * 67894.432 );
}

float hexDist(vec2 uv) {
    uv = abs(uv);
    return max(uv.x, dot(uv, normalize(vec2(1., 1.73))));
}

vec4 hexCoords(vec2 uv) {


    vec2 r = vec2(1., 1.73);
    vec2 h = r * .5;

    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;

    vec2 gv;

    if (length(a) < length(b)) {
        gv = a;
    } else {
        gv = b;
    }

    float x = atan(gv.x, gv.y);
    float y = .5 - hexDist(gv);

    vec2 id = uv - gv;

    return vec4(x, y, id.xy);
}

vec3 getTexture(vec2 uv) {
    vec3 col = vec3(0.);

    float size = 3.;

    vec2 ouv = uv;

    vec2 id = floor(uv*size);
    uv = fract(uv*size) - .5;

    vec3 c = vec3(0.);

    for(int x = -1 ; x <= 1 ; x++) {
        for(int y = -1 ; y <= 1 ; y++) {
            vec2 offset = vec2(x, y);
            vec2 nid = id + offset;
            float n = n21(nid);
            if (n > .2) {
                float n1 = fract(n*123.456);
                float n2 = fract(n*5678.543);
                vec3 color = vec3(n, n1, n2);
                vec2 shift = vec2(n1 - .5, n2 - .5)*sin(iTime + n*n1 + n2);
                c = max(c, ((0.01 + 0.02*n2)/length(uv - offset - shift)) * color);
            }
        }
    }

    // c /= 1.9;


    col += c;
    // col += .05/length(uv);

    // col += clamp(vec3(n,n1,n2), vec3(0.), vec3(0., 1., 0.));

    // col += vec3(0., 1., 0);

    if (uv.x > .47 || uv.y > .47) {
        // col.rgb = vec3(1.);
    } else {

    }

    // col = vec3(.2/length(abs(ouv + 1.)));

    // col += 1.2/distance(vec2(ouv.x, sin(iTime)*6.), vec2(0.,0.));

    // col.rg = uv;
    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {

    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    // uv = abs(uv);
    // uv = fract(uv) - vec2(0.6, 0.3);

    vec2 mouse = iMouse.xy / iResolution.xy;

    vec3 col = vec3(0.);

    vec3 ro = vec3(0., 0., -2.);
    vec3 lookat = vec3(0., 0., 3.);
    float zoom = 1.;

    vec3 f = normalize(lookat - ro);
    vec3 r = normalize(cross(vec3(0., 1., 0.), f));
    vec3 u = cross(f, r);
    vec3 c = ro + f * zoom;
    vec3 i = c + uv.x * r + uv.y * u;

    vec3 rd = normalize(i - ro);


    float ds, dt = 0.;
    vec3 p;

    for(int i = 0 ; i < MAX_STEPS ; i++) {
        p = ro + rd * ds;
        dt = length(p) - .8;
        ds += dt;
        if (abs(dt) < MIN_DISTANCE || ds > MAX_DISTANCE) {
            break;
        }
    }

    if (dt < MIN_DISTANCE) {
        float x = acos(p.y/length(p));
        // float y = mod(atan(p.z, p.x) + iTime/3., -6.28);
        float y = atan(p.z, p.x) + iTime/3.;
        vec2 uv = vec2(x, y);
        col += getTexture(uv);
        // col += step(hexDist(uv + vec2(-3.14/2., 1.6 - iTime + sin(iTime))), .1) - step(hexDist(uv + vec2(-3.14/2., 1.6 - iTime + sin(iTime))), .09);

        vec4 hex = hexCoords(uv*3.);// + vec2(iTime, iTime*1.2));//*(1. + (sin(iTime)*.5 + .5)*5.));
        // col += step(hex.y, .02 * clamp(sin(iTime), 0., .1)*4.);

        float t = iTime*3.;// + hex.z*hex.w*10.;

        float b = smoothstep(.9, 1., sin(t + sin(t)/cos(t + sin(t*3.+t))) * .5 + .5);

        col += pow(.005/hex.y, .7) * vec3(0.,1.,1.) * b;
        col += vec3(n21(hex.ba + 100.))*.6;

        // col.rg = hex.zw / 14.;

        // col += .2/length(uv);
    }


    // float d = length(cross(rd, vec3(0. + sin(iTime), 0.+cos(iTime), 0. + sin(iTime)) - ro))/length(rd);

    // col += step(d, 0.1);


    fragColor = vec4(clamp(col, 0., 1.), 1.);

}