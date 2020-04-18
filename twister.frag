#define MAX_STEPS 256
#define MIN_DISTANCE 0.001
#define MAX_DISTANCE 10.

struct TraceResult {
    vec3 id;
    float dt;
    float ds;
    float alpha;
};

float dPoint(vec3 ro, vec3 rd, vec3 p) {
    return length(cross(rd, p - ro))/length(rd);
}

float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    // return fract(sin(p.x*123.231 + p.y*4432.342)*33344.22);
}

vec3 getIdColor(vec3 id) {
    float n = max(.2, n21(vec2(id.x + id.y, id.z)));
    vec3 rcol = vec3(n, fract(n*4567.433), fract(n*45689.33));
    return rcol;
}

TraceResult trace(vec3 ro, vec3 rd) {
    float ds,dt;
    float n;
    vec3 id, shift;
    float baseSize = .05;
    vec3 baseSpacing = vec3(baseSize * 4.);
    vec3 bounds = vec3(2., 2., 10.);
    vec3 l = bounds;
    vec2 mouse = iMouse.xy/iResolution.xy;

    for(int i = 0 ; i < MAX_STEPS ; i++) {
        vec3 p = ro + rd * ds;

        float a = mouse.y * 3.14 * 2.;
        p.yz *= mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
        float aa = mouse.x * 3.14 * 2.;
        p.xy *= mat2(vec2(sin(aa), cos(aa)), vec2(-cos(aa), sin(aa)));

        vec3 rc1 = vec3(baseSpacing);
        vec3 q1 = p - rc1 * clamp(round(p/rc1), -l, l);


        id = round(p/rc1).xyz;

        // float pa = sin(id.z + iTime * id.z*.05)*6.28;
        float pa = sin((id.z + bounds.z/2.)/50. + iTime/2.)*6.28;

        rc1.xy *= (1. + (sin(id.z/5. + iTime*3.) * .5 + .5)*2.);
        p.xy *= mat2(vec2(sin(pa), cos(pa)), vec2(-cos(pa), sin(pa)));


        q1 = p - rc1 * clamp(round(p/rc1), -l, l);
        id = round(p/rc1).xyz;

        dt = length(q1) - baseSize;//- (.05 * fract(n*123.22));


        ds += dt * .5;
        if (abs(dt) < MIN_DISTANCE || dt > MAX_DISTANCE) {
            if (length(id.xy) > 2.6) {
                break;
            } else {
                //break;
                // ds += baseSize * 2. * length(vec3(vec2(id.xy), id.z + bounds.z / 1.2))/3.;
            }
        }
    }

    TraceResult res;

    res.id = id;
    res.dt = dt;
    res.ds = ds;
    res.alpha = length(id.xy) < 1. ? 0. : 1.;

    return res;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = ((fragCoords.xy / iResolution.xy) - .5) * vec2(iResolution.x / iResolution.y, 1.);
    vec2 mouse = iMouse.xy/iResolution.xy;

    vec3 col = vec3(.0);

    vec3 ro = vec3(0., 0. , -3.);
    vec3 lookat = vec3(0., 0., 0.);
    float zoom = .5;

    vec3 f = normalize(lookat - ro);
    vec3 r = normalize(cross(vec3(0., 1., 0.), f));
    vec3 u = cross(f, r);

    vec3 c = ro + f * zoom;
    vec3 I = c + uv.x * r + uv.y * u;

    vec3 rd = normalize(I - ro);

    TraceResult tr = trace(ro, rd);

    if (tr.dt < MIN_DISTANCE) {
        vec3 id = tr.id;
        vec3 rcol = getIdColor(id);
        col += rcol;
        // if (tr.alpha > 0.) {
        //     col += rcol;
        // } else {
        //     TraceResult tr = trace(ro + rd*(tr.ds+.1), rd);
        //     if (tr.dt < MIN_DISTANCE && tr.dt > 0.) {
        //         vec3 id = tr.id;
        //         vec3 rcol = getIdColor(id);
        //         if (tr.alpha > 0.) {
        //             col += rcol;
        //         }
        //     }
        // }
    }


    // col.rg = uv;

    fragColor = vec4(col, 1.);
}