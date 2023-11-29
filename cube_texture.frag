#define MAX_STEPS 156
#define MIN_DISTANCE 0.001
#define MAX_DISTANCE 10.
#define baseSize .3

struct TraceResult {
    vec3 id;
    float dt;
    float ds;
    float alpha;
    vec3 p;
    vec3 q1;
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
    vec3 baseSpacing = vec3(baseSize * 2.) * 1.5;
    vec3 bounds = vec3(1., 1., 1.);

    vec3 l = bounds;
    vec3 p;
    vec3 q1;


    for(int i = 0 ; i < MAX_STEPS ; i++) {
        p = ro + rd * ds;

        p = withMouse(p);

        p.y += bounds.y / (4.);

        vec3 rc1 = vec3(baseSpacing);
        q1 = p - rc1 * clamp(round(p/rc1), -l, l);

        id = round(p/rc1).xyz;

        dt = getDist(q1);

        ds += dt * .5;

        if (abs(dt) < MIN_DISTANCE || dt > MAX_DISTANCE) {
            break;
        }
    }

    TraceResult res;

    res.id = id;
    res.dt = dt;
    res.ds = ds;
    res.p = p;
    res.q1 = q1;
    res.alpha = length(id.xy) < 1. ? 0. : 1.;

    return res;
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.00001, 0.);
    float d = getDist(p);
    vec3 n = d - vec3(
        getDist(p - e.xyy),
        getDist(p - e.yxy),
        getDist(p - e.yyx)
    );
    return normalize(n);
}

vec2 getCubeUV(vec3 p, vec3 normal) {
    vec2 cuv = vec2(0.);
    if (normal.z != 0.) {
        cuv.xy = vec2(p.x, p.y);
    }
    if (normal.x != 0.) {
        cuv.xy = vec2(p.z, p.y);
    }
    if (normal.y != 0.) {
        cuv = vec2(p.z, p.x);
    }
    return cuv;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = ((fragCoords.xy / iResolution.xy) - .5) * vec2(iResolution.x / iResolution.y, 1.);
    vec2 mouse = iMouse.xy/iResolution.xy;

    vec3 col = vec3(.0);

    vec3 ro = vec3(0., 0. , -4.);
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

        vec3 p = tr.q1;
        vec3 normal = getNormal(p);

        vec2 cuv = getCubeUV(p, normal);

        float n = max(.2, n21(vec2(id.x, id.y+id.z) + 2.));

        col += pow(.1 / distance(cuv, vec2(0.)), 1.1) * vec3(n, fract(n*123.45), fract(n*5678.43));
    }


    fragColor = vec4(col, 1.);
}