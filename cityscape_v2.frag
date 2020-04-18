#define COLOR_WINDOW vec3(1., .9, .45)
#define COLOR_WINDOW_TINT vec3(0.9, .3, .1)
#define COLOR_BUILDING_BASE vec3(0.3,.5, .1)
#define COLOR_ROAD_DELIMETER vec3(0.87, .72, .14)
#define COLOR_ROAD vec3(0.1)
#define MAX_STEPS 156
#define MIN_DISTANCE 0.001
#define MAX_DISTANCE 10.
#define defaultBaseSize .3
#define defaultBaseSpacing 2.5
#define bounds vec3(2.0, 2.0, 0.)
#define BLD_RECT 1.
#define BLD_HEX 2.
#define BLD_TUBE 4.
#define OBJ_FLOOR 3.
#define CELL_SIZE (defaultBaseSize + defaultBaseSpacing/2.)
#define BULDING_BASE_SIZE .4


// #iUniform float my_scalar = 1.0 in { 0.0, 5.0 } // This will expose a slider to edit the value

struct DistBuilding {
    float d;
    vec3 size;
    float height;
    vec3 q1;
    float objId;
};

struct DistResult {
    float d;
    vec3 id;
    vec3 q1;
    vec3 p;
    float h;
    float obj;
    DistBuilding building;
};

struct TraceResult {
    vec3 id;
    float dt;
    float ds;
    float h;
    vec3 p;
    vec3 q1;
    DistResult dist;
    float obj;
};




float hexDist(vec2 uv) {
    uv = abs(uv);
    return max(uv.x, dot(uv, normalize(vec2(1., 1.73))));
}


mat2 rot2d(float a) {
    return mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
}

float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

vec3 getColorById(vec3 id) {
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

float sdCappedCylinder( vec3 p, float h, float r )
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(h,r);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
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

DistBuilding distBuilding(vec3 q1, vec3 id) {
    DistBuilding res;
    float n = n21(id.xy);
    float n1 = fract(n*4553.33);
    float n2 = fract(n*54445.33);

    float baseSize = defaultBaseSize;

    float h = baseSize;

    h += n*.5;
    q1.z -= n*.5;
    q1.z -= defaultBaseSize;

    float d;

    float obj = BLD_RECT;

    if (n1 > .7) {
        obj = BLD_HEX;
    } else if (n2 > .8) {
        obj = BLD_TUBE;
    }

    vec3 size = vec3(baseSize, baseSize, h);

    if (obj == BLD_HEX) {
        d = sdHexPrism(q1, vec2(size.x, size.z));

    } else if (obj == BLD_TUBE) {
        float tmp = q1.z;
        q1.z = q1.y;
        q1.y = tmp;
        d = sdCappedCylinder(q1, baseSize, size.z);
    } else {
        if (n1 > .3) {
            size.x *= .5;
            size.y *= 1.5;
        } else if (n2 > .5) {
            size.y *= .5;
            size.x *= 1.5;
        }
        d = sdBox(q1, size);
    }

    res.d = d;
    res.q1 = q1;
    res.size = size;
    res.objId = obj;
    res.height = size.z;

    return res;
}

DistBuilding distBuildingCluster(vec3 p, vec3 cid) {
    DistBuilding res;
    vec3 q1 = p;
    // float n = n21(id.xy);
    // vec3 baseSpacing = vec3(defaultBaseSize + defaultBaseSpacing/2.);

    // vec3 l = vec3(1.,0.,0.);
    // vec3 rc1 = vec3(baseSpacing);

    // vec3 id = round(p/rc1);

    // vec3 q1 = p - rc1 * clamp(id, -l, l);
    return distBuilding(q1, cid);
}


DistResult getDist(vec3 p) {
    vec3 baseSpacing = vec3(defaultBaseSize + defaultBaseSpacing/2.);

    vec3 l = bounds;
    vec3 rc1 = vec3(baseSpacing);

    vec3 id = round(p/rc1);

    vec3 q1 = p - rc1 * clamp(id, -l, l);

    DistBuilding building = distBuildingCluster(q1, id);

    float d = building.d;
    float obj = building.objId;
    q1 = building.q1;

    float floord = p.z;

    if (floord < d) {
        obj = OBJ_FLOOR;
    }

    d = min(d, floord);


    DistResult r;
    r.d = d;
    r.id = id;
    r.q1 = q1;
    r.building = building;
    r.p = p;
    r.obj = obj;
    return r;
}

TraceResult trace(vec3 ro, vec3 rd) {
    float ds,dt;
    float n;
    vec3 id, shift;
    vec3 p;
    vec3 q1;

    DistResult dist;


    for(int i = 0 ; i < MAX_STEPS ; i++) {
        p = ro + rd * ds;

        p = withMouse(p);

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
    res.obj = dist.obj;
    res.dist = dist;

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


vec3 getCubeUV(vec3 p, vec3 normal, vec3 fsize) {
    vec2 cuv = vec2(0.);
    vec2 size = fsize.yz;
    if (normal.z != 0.) {
        // roof
        cuv.xy = vec2(p.x, p.y);
        size = fsize.xy;
        // size.y = size.x;
    }
    if (normal.x != 0.) {
        cuv.xy = vec2(p.y, p.z);
        size = fsize.yz;
    }
    if (normal.y != 0.) {
        cuv = vec2(p.x, p.z);
        size = fsize.xz;
    }

    cuv /= size*2.;

    cuv += vec2(.5, .5);

    float r = size.x / size.y;

    cuv -= vec2((r-1.)*.03, 0.);

    cuv.x *= r;

    return vec3(cuv, r);
}

vec2 getTubeUV(vec3 p, vec3 normal, vec2 size) {
    float x = atan(p.x, p.z) / 6.28;
    float y = p.y/size.y;

    vec2 cuv = vec2(x, y);
    if (normal.z != 0.) {
        cuv = p.xz / size.x;
    }
    return cuv;
}

vec2 getHexUV(vec3 p, vec3 normal, vec2 size) {

    float x = atan(p.x, p.y) / 6.28;
    float y = p.z/size.y;

    vec2 cuv = vec2(x, y);

    if (normal.z != 0.) {
        cuv = p.xy / size.x;
    }

    cuv += vec2(.5, .5);

    return cuv;
}

vec3 allWindowsSkyscraperTexture(vec3 p, vec2 uv, vec3 normal, vec3 bid, float xr, float obj, float w, vec3 size) {
    vec3 col = vec3(0.15);

    float frameWidth = .03;

    float frame;

    if (obj == BLD_RECT) {
        if (normal.z == 0.) {
            frame = step(uv.x, frameWidth) +  step((1. - frameWidth) * xr, uv.x) + step((1. - frameWidth), uv.y);
            frame += step(uv.y, frameWidth);
        } else {
            if (size.x > size.y) {
                frame = step(uv.x, frameWidth - .15) +  step((.95 - frameWidth) * xr, uv.x) + step((1. - frameWidth), uv.y);
            } else {
                frame = step(uv.x, frameWidth) +  step((1. - frameWidth) * xr, uv.x) + step((1. - frameWidth), uv.y);
            }
            frame += step(uv.y, frameWidth);
        }
        uv *= 40. * w / xr;
    } else if (obj == BLD_HEX) {
        vec2 huv = uv;
        if (normal.z == 0.) {
            frame = step(fract(huv.x*6. + .53), .1);
            frame += step(1.46, huv.y);
        } else {
            frame = step(1. - frameWidth * 2., hexDist((uv - .5)*rot2d(3.14)));
        }
        float scaleY = 20. * defaultBaseSize / xr;
        uv *= vec2(scaleY*(6.*xr), scaleY);
    } else if (obj == BLD_TUBE) {
        vec2 huv = uv;
        if (normal.z != 0.) {
            frame = step(length(huv), 1.1) - step(length(huv), 1. - frameWidth * 2.);
        } else {
            frame = step(1. - frameWidth * 2., huv.y);
        }
        float scaleY = 20. * defaultBaseSize / xr;
        uv *= vec2(scaleY*(6.*xr), scaleY);
    }

    col += frame;

    if (normal.z == 0. && frame == 0.) {
        col = vec3(0.);
        vec2 id = floor(uv);
        uv = fract(uv);
        float n = n21(id + bid.xy + 22.*floor(normal.xy));
        float borders = (step(uv.x, .3) + step(uv.y, .3));
        if (n > .7 && abs(sin(bid.x + bid.y + fract(n*23422.)*110. + iTime/50.)) > fract(n*123.22)) {
            col += COLOR_WINDOW * (1. - borders);
            col += borders * COLOR_WINDOW_TINT;

        } else {
            if (borders != 0.) {
                col = vec3(0.2);
            }
        }

    }

    return col;
}


vec3 floorTexture(vec3 p, vec3 q1) {
    vec3 col = vec3(0.);

    vec2 uv = mod((p.xy - CELL_SIZE / 2.), CELL_SIZE) / CELL_SIZE - .5;
    vec2 roadUV = mod((p.xy), CELL_SIZE) / CELL_SIZE;

    float roadX = step(BULDING_BASE_SIZE, roadUV.x) - step(1. - BULDING_BASE_SIZE, roadUV.x);
    float roadY = step(BULDING_BASE_SIZE, roadUV.y) - step(1. - BULDING_BASE_SIZE, roadUV.y);

    float road = max(roadX, roadY);


    col += road * COLOR_ROAD;

    // col.rg = roadUV;

    vec2 baseUV = abs(uv);
    col += step(max(baseUV.x, baseUV.y), BULDING_BASE_SIZE) * COLOR_BUILDING_BASE;

    uv = fract((uv + .26)*8.);

    if (roadX == 0.) {
        uv.x /= 4.;
    }
    if (roadY == 0.) {
        uv.y /= 4.;
    }

    col += step(max(uv.x, uv.y), .1) * road * COLOR_ROAD_DELIMETER;

    return col;
}

vec3 getBuildingTexture(TraceResult tr) {
    vec3 col = vec3(0.);

    vec3 id = tr.id;
    float objId = tr.obj;

    vec3 p = tr.p;
    vec3 normal = getNormal(p, tr.dt);

    float baseSize = normal.x == 0. ? tr.dist.building.size.x : tr.dist.building.size.y;

    vec2 size = vec2(baseSize, tr.dist.building.height);

    vec3 cubeUV = getCubeUV(tr.q1, normal, tr.dist.building.size);
    vec2 uv = cubeUV.xy;

    if (objId == BLD_HEX) {
        uv = getHexUV(tr.q1, normal, size);
    }
    if (objId == BLD_TUBE) {
        uv = getTubeUV(tr.q1, normal, size);
    }

    col += allWindowsSkyscraperTexture(p, uv, normal, id, cubeUV.z, tr.obj, baseSize, tr.dist.building.size);

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
        float objId = tr.obj;

        if (objId == OBJ_FLOOR) {
            col += floorTexture(tr.p, tr.q1);
        } else {
            col += getBuildingTexture(tr);
        }

    }


    fragColor = vec4(col, 1.);
}