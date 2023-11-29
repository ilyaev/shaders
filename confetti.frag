#define MAX_STEPS 156
#define MIN_DISTANCE 0.001
#define MAX_DISTANCE 10.
#define LAYERS 1.
#define LAYER_SIZE 6.

struct TraceResult {
    vec3 id;
    float dt;
    float ds;
    float alpha;
};

float dPoint(vec3 ro, vec3 rd, vec3 p) {
    return length(cross(rd, p - ro))/length(rd);
}

float n21shake(vec2 p) {
    //return fract(sin(dot(n, vec2(12.9898, 4.1414 + iTime*0.00001))) * 43758.5453);
     return fract(sin(p.x*123.231 + p.y*1432.342 + iTime*0.01)*15344.22);
}

float n21(vec2 p) {
    //return fract(sin(dot(n, vec2(12.9898, 4.1414 + iTime*0.00001))) * 43758.5453);
     return fract(sin(p.x*123.231 + p.y*1432.342)*15344.22);
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
    vec3 bounds = vec3(LAYER_SIZE, LAYER_SIZE, LAYERS);
    vec3 l = bounds;
    vec2 mouse = iMouse.xy/iResolution.xy;

    TraceResult res;
    res.alpha = 1.;

    for(int i = 0 ; i < MAX_STEPS ; i++) {
        vec3 p = ro + rd * ds;

        float a = mouse.y * 3.14 * 2. + 3.14/2.;
        p.yz *= mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
        float aa = mouse.x * 3.14 * 2.;
        p.xy *= mat2(vec2(sin(aa), cos(aa)), vec2(-cos(aa), sin(aa)));

        vec3 rc1 = vec3(baseSpacing);
        vec3 q1 = p - rc1 * clamp(round(p/rc1), -l, l);


        id = round(p/rc1).xyz;

        float pa = sin(id.z + iTime * id.z*.05)*6.28;


        // z-layer interval scale
        rc1.xy *= (1. + (sin(id.z/5. + iTime*3.) * .5 + .5)*2.);
        // z-layer rotation
        p.xy *= mat2(vec2(sin(pa), cos(pa)), vec2(-cos(pa), sin(pa)));

        q1 = p - rc1 * clamp(round(p/rc1), -l, l);
        id = round(p/rc1).xyz;

        float n = n21(vec2(id.x * id.y, id.z * id.x*id.z));

        float maxShift = baseSize * 2.;
        vec3 shift = vec3(maxShift * (n - .5), maxShift * (fract(n*567.43) - .5), maxShift * (fract(n*12567.43) - .5));

        dt = length(q1 + shift) - baseSize;


        ds += dt * .5;
        if (abs(dt) < MIN_DISTANCE || dt > MAX_DISTANCE) {
           // if (length(id.xy) > 1.6 && fract(n*718.54) > .5) {
                break;
           // } else {
             //    ds += .1;
           // }
        }
    }



    res.id = id;
    res.dt = dt;
    res.ds = ds;

    return res;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = ((fragCoords.xy / iResolution.xy) - .5) * vec2(iResolution.x / iResolution.y, 1.);
    vec2 mouse = iMouse.xy/iResolution.xy;

    vec3 col = vec3(.0);

    // vec3 ro = vec3(0.+sin(iTime), 0. + cos(iTime) , -3. + sin(iTime));
    vec3 ro = vec3(0., 0., -3.);
    vec3 lookat = vec3(0., 0., 0.);
    float zoom = .6;

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
    }


    // col.rg = uv;

    fragColor = vec4(col, 1.);
}