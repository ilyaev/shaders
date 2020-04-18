#define MAX_STEPS 156
#define MIN_DISTANCE 0.001
#define MAX_DISTANCE 10.
#define baseSize .1

struct TraceResult {
    vec3 id;
    float dt;
    float ds;
    float alpha;
};

mat2 rot2d(float a) {
    return mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
}

float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    //  return fract(sin(n.x*123.231 + n.y*4432.342)*33344.22);
}

vec3 getIdColor(vec3 id) {
    float n = max(.2, n21(vec2(id.x, id.y)));
    vec3 rcol = vec3(n, fract(n*567.433), fract(n*1689.33));
    return rcol;
}

vec3 withMouse(vec3 p) {
        vec2 mouse = iMouse.xy/iResolution.xy;
        float a = mouse.y * 3.14 * 2.;
        p.yz *= mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
        float aa = mouse.x * 3.14 * 2.;
        p.xy *= mat2(vec2(sin(aa), cos(aa)), vec2(-cos(aa), sin(aa)));
        return p;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float getDist(vec3 p) {
    return sdBox(p, vec3(baseSize));
}

TraceResult trace(vec3 ro, vec3 rd) {
    float ds,dt;
    float n;
    vec3 id, shift;
    vec3 baseSpacing = vec3(baseSize * 2.) * 1.6;
    vec3 bounds = vec3(10., 30., 0.);
    vec3 l = bounds;


    for(int i = 0 ; i < MAX_STEPS ; i++) {
        vec3 p = ro + rd * ds;

        p = withMouse(p);

        p.y += bounds.y / (4.);

        // p.y -= iTime;//mod(iTime/5., baseSpacing.y*2.);

        // p.yz *= rot2d(3.14/6.);// * p.x + iTime);
        // p.yxz /= 6.;

        vec3 rc1 = vec3(baseSpacing);
        vec3 q1 = p - rc1 * clamp(round(p/rc1), -l, l);

        id = round(p/rc1).xyz;

        float h = n21(id.xy)*.3;//+ vec2(0, floor(iTime)));// * (sin(iTime*10.) +.5);

        h += (sin(id.y/10. + sin(id.x/5.) + iTime)*.5 + .5) * .2;

        q1.z -= h/2.;

        // dt = length(q1) - baseSize;

        // q1.y += iTime/10.;

        dt = sdBox(q1, vec3(baseSize, baseSize, baseSize + (.5*h)));// * (10. * abs(sin(id.x/20. + iTime)))));

        ds += dt * .5;

        if (abs(dt) < MIN_DISTANCE || dt > MAX_DISTANCE) {
            break;
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
        vec3 rcol = getIdColor(id + vec3(0., floor(iTime*0.), 0.));
        col += rcol;
    }


    fragColor = vec4(col, 1.);
}