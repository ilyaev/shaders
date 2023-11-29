#define MAX_STEPS 156
#define MIN_DISTANCE 0.001
#define MAX_DISTANCE 10.
#define defaultBaseSize .3
#define bounds vec3(10.0, 10.0, 0.)
#define OBJ_RECT 1.
#define OBJ_HEX 2.

struct TraceResult {
    vec3 id;
    float dt;
    float ds;
    float alpha;
    float h;
    vec3 p;
    vec3 q1;
    float obj;
};

struct DistResult {
    float d;
    vec3 id;
    vec3 q1;
    vec3 p;
    float h;
    float obj;
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


float sdHexPrism( vec3 p, vec2 h )
{
  const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
  p = abs(p);
  p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;
  vec2 d = vec2(
       length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x), h.x))*sign(p.y-h.x),
       p.z-h.y );
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdCone( vec3 p, vec2 c )
{
  // c is the sin/cos of the angle
  float q = length(p.xy);
  return dot(c,vec2(q,p.z));
}

DistResult getDist(vec3 p) {
    vec3 baseSpacing = vec3(defaultBaseSize * 4.);

    vec3 l = bounds;
    vec3 rc1 = vec3(baseSpacing);

    vec3 id = round(p/rc1);

    vec3 q1 = p - rc1 * clamp(id, -l, l);

    float n = n21(id.xy);

    // n = 1.;

    float baseSize = defaultBaseSize;// * (.5 + max(.5,n));

    float h = baseSize;

    h += n*.5;
    q1.z -= n*.5;

    // h *= 3.; // single

    float d;

    float obj = OBJ_RECT;

    bool isPrism = fract(n*4553.33) > .7;
    // isPrism = true;

    if (isPrism) {
        d = sdHexPrism(q1, vec2(baseSize, h));
        obj = OBJ_HEX;
    } else {
        d = sdBox(q1, vec3(baseSize, baseSize, h));
        // float h1 = h/2.;
        // float n1 = fract(n*322233.);
        // if (n1 > .7) {
        //     d = min(sdHexPrism((q1 - vec3(0., 0., h * 1.25)), vec2(baseSize/1.3, h1)), d);
        // } else if (n1 > .1) {
        //     d = min(sdBox((q1 - vec3(0., 0., h * 1.25)), vec3(vec2(baseSize/1.3), h1)), d);
        // }
    }

    if (n > .4) {
        // d = length(q1);
    }



    DistResult r;
    r.d = d;
    r.id = id;
    r.q1 = q1;
    r.p = p;
    r.h = h;
    r.obj = obj;
    return r;
}

TraceResult trace(vec3 ro, vec3 rd) {
    float ds,dt;
    float n;
    vec3 id, shift;
    // vec3 baseSpacing = vec3(baseSize * 4.);

    // vec3 l = bounds;
    vec3 p;
    vec3 q1;

    DistResult dist;


    for(int i = 0 ; i < MAX_STEPS ; i++) {
        p = ro + rd * ds;

        p = withMouse(p);

        // p.y += bounds.y / (4.);

        // vec3 rc1 = vec3(baseSpacing);
        // id = round(p/rc1);
        // q1 = p - rc1 * clamp(id, -l, l);

        // q1 - p = -rc1 * id
        // id = -(q1 - p) / rc1;



        dist = getDist(p);

        dt = dist.d;
        id = dist.id;
        q1 = dist.q1;

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
    res.h = dist.h;
    res.obj = dist.obj;
    res.alpha = length(id.xy) < 1. ? 0. : 1.;

    return res;
}

vec3 getNormal(vec3 p, float d) {
    vec2 e = vec2(0.00001, 0.);
    vec3 n = d - vec3(
        getDist(p - e.xyy).d,
        getDist(p - e.yxy).d,
        getDist(p - e.yyx).d
    );
    return normalize(n);
}


vec3 getCubeUV(vec3 p, vec3 normal, vec2 size) {
    vec2 cuv = vec2(0.);
    if (normal.z != 0.) {
        // roof
        cuv.xy = vec2(p.x, p.y);
        size.y = size.x;
    }
    if (normal.x != 0.) {
        cuv.xy = vec2(p.y, p.z);
    }
    if (normal.y != 0.) {
        cuv = vec2(p.x, p.z);
    }

    cuv /= size*2.;

    cuv += vec2(.5, .5);

    float r = size.x / size.y;

    cuv -= vec2((r-1.)*.03, 0.);

    cuv.x *= r;

    return vec3(cuv, r);// + .5;// + vec2(.5, r);
}


vec2 getHexUV(vec3 p, vec3 normal, vec2 size) {
    // p.zy *= rot2d(3.14);

    float x = atan(p.x, p.y) / 6.28;// + 3.14/4.5;
    float y = p.z/size.y;//acos(p.z/length(p));
    // y /= (3.14/2.);
    vec2 cuv = vec2(x, y);
    cuv += vec2(.5, .5);

    float r = size.x / size.y;

    // cuv -= vec2((r-1.)*.03, 0.);

    // cuv.x *= r;
    return cuv;
    // return (p*abs(normal)).xy;
}

vec3 buildingTexture2(vec3 p, vec2 uv, vec3 normal, vec3 bid, float xr, float obj) {
    // uv = fract(uv);
    vec3 col = vec3(0.15);
    // uv += .5;

    // col.rg = uv;

    float frameWidth = .03;

    float frame;

    if (obj == OBJ_RECT) {
        frame = step(uv.x, frameWidth) + step(uv.y, frameWidth) + step((1. - frameWidth) * xr, uv.x) + step((1. - frameWidth), uv.y);
        uv *= 40. * defaultBaseSize / xr;
    } else if (obj == OBJ_HEX) {
        vec2 huv = uv;
        frame = step(fract(huv.x*6. + .53), .1);
        // col.r = huv.x;
        float scaleY = 20. * defaultBaseSize / xr;
        uv *= vec2(scaleY*(6.*xr), scaleY);
    }

    col += frame;

    if (normal.z == 0. && frame == 0.) {

        vec2 id = floor(uv);
        uv = fract(uv);

        float n = n21(id + bid.xy + 22.*floor(normal.xy));
        if (n > .7) {
            col += vec3(1., .9, .45);
        }
        // col.rg += uv * (1. - frame);
    }

    return col;
}


vec3 buildingTexture(vec3 p, vec2 uv, vec3 normal, vec3 bid) {
    vec2 guv = uv;
    uv *= 10. / defaultBaseSize;
    vec2 id = floor(uv);
    uv = fract(uv) - .5;

    float n = n21(id.xx + bid.x);
    float n1 = n21(id.yy + bid.y);
    float n2 = n21(id.xy * (bid.xy + 1.));

    vec3 col = vec3(0.15);

    if (normal.z != 0.) {
        // roof
        float d = length(guv);
        // col += step(d, baseSize*.9) - step(d, baseSize*.8);
        if (d < defaultBaseSize * .8) {
            // col = vec3(0.);
        }
    } else {
        if (n > .5 || n1 > .5) {
            col = vec3(0.9, .3, .1);
        } else if (n2 > .7) {
            col = vec3(.9, .9, .1);
        }
    }
    return col;
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

        vec3 p = tr.p;
        vec3 normal = getNormal(p, tr.dt);

        vec2 size = vec2(defaultBaseSize, tr.h);

        vec3 cuvA = getCubeUV(tr.q1, normal, size);
        vec2 cuv = cuvA.xy;
        if (tr.obj == OBJ_HEX) {
            cuv = getHexUV(tr.q1, normal, size);
        }


        // col += buildingTexture(p, cuv, normal, id);
        col += buildingTexture2(p, cuv, normal, id, cuvA.z, tr.obj);
    }


    fragColor = vec4(col, 1.);
}