#iKeyboard
#define CAMERA_RANGE 8.
#define CAMERA_TIME_SCALE .1
#define COLOR_WINDOW vec3(1., .9, .45)
#define COLOR_WINDOW_TINT vec3(0.9, .3, .1)
#define COLOR_BUILDING_BASE vec3(0.3,.5, .1)
#define COLOR_ROAD_DELIMETER vec3(0.87, .72, .14)
#define COLOR_ROAD vec3(0.1)
#define COLOR_ROAD_SIDEWALK vec3(.7)
#define MAX_STEPS 256
#define MIN_DISTANCE 0.0001
#define MAX_DISTANCE 10.
#define defaultBaseSize .3
#define defaultBaseSpacing 2.5
#define bounds vec3(7.0, 7.0, 0.)
#define BLD_RECT 1.
#define BLD_HEX 2.
#define BLD_TUBE 4.
#define OBJ_FLOOR 3.
#define OBJ_CAMERA 5.
#define OBJ_DOME 6.
#define CELL_SIZE (defaultBaseSize + defaultBaseSpacing/2.)
#define BULDING_BASE_SIZE .4
#define PI 3.14

vec2 mouse;

struct Camera {
    float z;
    float x;
    float y;
    float verticalAngle;
    float horizontalAngle;
    float rotation;
};

Camera camera;

bool isScripted = true;

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

float smoothNoise(vec2 uv) {
    vec2 lv = smoothstep(0., 1., fract(uv));
    vec2 id = floor(uv);

    float bl = n21(id);
    float br = n21(id + vec2(1.,0.));
    float b = mix(bl, br, lv.x);

    float tl = n21(id + vec2(0.,1.));
    float tr = n21(id + vec2(1.,1.));
    float t = mix(tl, tr, lv.x);

    float n = mix(b, t, lv.y);
    return n;
}

float noise(vec2 uv, int level) {
    float n = 0.;
    float d = 1.;
    if (level > 0) {
	    n += smoothNoise(uv * 4.);
    }
    if (level > 1) {
	    n += smoothNoise(uv * 8.) * .5;
        d += .5;
    }
    if (level > 2) {
    	n += smoothNoise(uv * 16.) * .25;
        d += .25;
    }
    if (level > 3) {
	    n += smoothNoise(uv * 32.) * .125;
        d += .125;
    }
    if (level > 4) {
	    n += smoothNoise(uv * 64.) * .025;
        d += .0625;
    }
    return n / d;
}

vec3 getColorById(vec3 id) {
    float n = max(.2, n21(vec2(id.x, id.y)));
    vec3 rcol = vec3(n, fract(n*567.433), fract(n*1689.33));
    return rcol;
}

vec3 withMouse(vec3 p) {
        vec2 mouse = iMouse.xy/iResolution.xy;
        float a = max(mouse.y, .505) * 3.14 * 2.;
        p.yz *= rot2d(a);
        float aa = mouse.x * 3.14 * 2.;
        p.xy *= rot2d(aa);
        return p;
}

vec3 setSceneAngle(vec3 p) {
    vec2 mouse = iMouse.xy/iResolution.xy;
    p.yz *= rot2d(PI);
    p.xy *= rot2d(camera.horizontalAngle);
    p.x += CELL_SIZE / 2.;
    p.y += CELL_SIZE / 2.;
    // p.xy -= .77;
    p += vec3(camera.x, camera.y, camera.z);
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
    float n2 = fract(n*145.33);

    float obj = BLD_RECT;

    if (n1 > .7) {
        obj = BLD_HEX;
    } else if (n2 > .8) {
        obj = BLD_TUBE;
    }

    float baseSize = defaultBaseSize;

    float h = baseSize;

    if (obj == BLD_TUBE && n1 < .2 ) {
        n = (sin(q1.x + (n1*50.)) * .5 + .5);
    }

    float ah = n * .5;

    h += ah;
    q1.z -= ah;
    q1.z -= defaultBaseSize;

    float d;



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

        if (n < .6) {
            vec3 q2,nsize, nsize3, q3, d3;
            if (n2 < .2 && size.x == size.y) {
                d = sdBox(q1, size);
                q2 = vec3(q1.x, q1.y, q1.z - size.z);
                nsize = vec3(size.xy/1.5, size.z*2.);
                q3 = vec3(q1.x, q1.y, q1.z - size.z - size.z / 1.8);
                nsize3 = vec3(size.xy/(1.5*1.5), size.z*2. + size.z / 1.8);
            } else {
                q1 += vec3(0.1, -0.08, 0.);
                d = sdBox(q1, size);
                float extraH = size.z + size.z * n1;
                q2 = vec3(q1.x - .18, q1.y + .18, q1.z - extraH);
                nsize = vec3(size.xy, size.z + extraH);
                if (n1 > .4) {
                    nsize.xy = nsize.yx;
                }
            }

            float d2 = sdBox(q2, nsize);
            if (d2 < d) {
                q1 = q2;
                size = nsize;
                d = d2;
            }

            if (nsize3.x != 0.) {
                float d3 = sdBox(q3, nsize3);
                if (d3 < d) {
                    q1 = q3;
                    size = nsize3;
                    d = d3;
                }
            }

        } else {
            d = sdBox(q1, size);
        }
    }

    res.d = d;
    res.q1 = q1;
    res.size = size;
    res.objId = obj;
    res.height = size.z;

    return res;
}


DistResult getDist(vec3 p) {
    vec3 baseSpacing = vec3(defaultBaseSize + defaultBaseSpacing/2.);

    vec3 l = bounds;
    vec3 rc1 = vec3(baseSpacing);

    vec3 id = round(p/rc1);

    vec3 q1 = p - rc1 * clamp(id, -l, l);

    DistBuilding building = distBuilding(q1, id);

    float d = building.d;
    float obj = building.objId;
    q1 = building.q1;

    // d = 1000000.;
    float floord = p.z;

    if (floord < d) {
        obj = OBJ_FLOOR;
    }

    d = min(d, floord);

    float skyD = -(length(p) - 30.);

    if (skyD < d) {
        obj = OBJ_DOME;
        d = skyD;
    }

    if (!isScripted) {
        vec3 cameraQ = vec3(-p.x + CELL_SIZE / 2., -p.y + CELL_SIZE / 2., p.z-.3) + vec3(camera.x, camera.y, camera.z);
        cameraQ.xy *= rot2d(-camera.horizontalAngle);
        float cd = sdBox(cameraQ, vec3(.1, .2, .1));
        if (cd < d) {
            p = cameraQ;
            obj = OBJ_CAMERA;
        }

        d = min(d, cd);
    }


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

        if (isScripted) {
            p = setSceneAngle(p);
        } else {
            p = withMouse(p);
        }

        dist = getDist(p);

        dt = dist.d;
        id = dist.id;
        q1 = dist.q1;

        ds += dt * .4;

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
    vec2 wuv = uv;

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

        float bn = fract(n21(bid.xy)*567.85);
        float distToBuilding = distance(bid*CELL_SIZE, vec3(camera.x, camera.y, camera.z));

        bool isLight = bn > .6 && distToBuilding > 6. ? true : false;
        col = vec3(0.);
        vec2 id = floor(uv);
        uv = fract(uv);
        float n = n21(id + bid.xy + 22.*floor(normal.xy));
        float borders = (step(uv.x, .3) + step(uv.y, .3));
        if (!isLight && n > .7 && abs(sin(bid.x + bid.y + fract(n*23422.)*110. + iTime/50.)) > fract(n*123.22)) {
            col += COLOR_WINDOW * (1. - borders);
            col += borders * COLOR_WINDOW_TINT;
        } else {
            if (borders != 0.) {
                col = vec3(0.2);
                if (isLight) {
                    vec2 lights = vec2(sin(wuv.x + iTime + fract(bn * 3322.)*10.), sin(wuv.y + iTime + fract(bn * 3322.)*10.));
                    if (bn > .85) {
                        col.rb += lights;
                    } else {
                        col.rg += lights;
                    }
                }
            }
        }

    }

    return col;
}

vec3 domeTexture(vec3 p) {
    vec3 q1 = p;
    q1.yz *= rot2d(PI);
    p = q1;
    vec3 col = vec3(.01);
    float x = acos(p.y/length(p));
    float y = atan(p.z, p.x) / 6.28;
    vec2 uv = vec2(x, y) + .5;

    float rize = .1 + sin(iTime/6.)*.1;

    vec2 muv = uv*vec2(1., 5.);
    vec2 id = floor(muv);
    muv = fract(muv) - .5;
    muv += vec2(rize, 0.);

    bool isMoon = false;

    if (id.y == 2.) {
        float ml = length(muv)*1.5;
        vec3 mc = step(ml, .1) * vec3(noise(5. + muv*4. + iTime/50., 5));
        if (ml > .1) {
            mc += pow(.05 / length(muv), 6.0);
        }
        if (ml < .15) {
            isMoon = true;
        }
        col += mc * vec3(.9, .6, .1);
    }

    vec2 suv = uv * vec2(30., 150.);
    vec2 sid = floor(suv);
    suv = fract(suv) - .5;

    float n = n21(sid);
    if (n > .7 && !isMoon) {
        col += step(length(suv + vec2(fract(n*3432.33) - .5, fract(n*78953.2) - .5)), .04*fract(n*123.123));
    }

    return col;
}

vec3 floorTexture(vec3 p, vec3 q1) {
    vec3 col = vec3(0.);

    vec2 uv = mod((p.xy - CELL_SIZE / 2.), CELL_SIZE) / CELL_SIZE - .5;
    vec2 roadUV = mod((p.xy), CELL_SIZE) / CELL_SIZE;
    vec2 blockID = floor(p.xy / CELL_SIZE);

    if (abs(blockID.x) > bounds.x || abs(blockID.y) > bounds.y) {
        return COLOR_BUILDING_BASE;
    }

    float roadX = step(BULDING_BASE_SIZE, roadUV.x) - step(1. - BULDING_BASE_SIZE, roadUV.x);
    float roadY = step(BULDING_BASE_SIZE, roadUV.y) - step(1. - BULDING_BASE_SIZE, roadUV.y);

    float road = max(roadX, roadY);


    col += road * COLOR_ROAD;

    // col.rg = roadUV;
    // col.rg = uv;

    vec2 baseUV = abs(uv);
    col += step(max(baseUV.x, baseUV.y), BULDING_BASE_SIZE*.9) * COLOR_BUILDING_BASE;

    uv = fract((uv + .26)*8.);

    if (roadX == 0.) {
        uv.x /= 4.;
    }
    if (roadY == 0.) {
        uv.y /= 4.;
    }

    col += step(max(uv.x, uv.y), .1) * road * COLOR_ROAD_DELIMETER;

    if (col.x == 0.) {
        col = COLOR_ROAD_SIDEWALK;
    }

    vec2 zebraUV = roadUV * 12.;
    vec2 zebraID = floor(zebraUV);
    zebraUV = fract(zebraUV);

    float n = n21(blockID);

    if (zebraID.x == 3. && road > 0. && n > .7) {
        col += step(fract((zebraUV - .08)*vec2(1., 3.)).y + .1, .4);
    }
    if (zebraID.y == 3. && road > 0. && fract(n*123.33) > .7) {
        col += step(fract((zebraUV - .08)*vec2(3., 1.)).x + .1, .4);
    }

    return col;
}

vec3 getBuildingTexture(TraceResult tr, vec3 normal) {
    vec3 col = vec3(0.);

    vec3 id = tr.id;
    float objId = tr.obj;

    vec3 p = tr.p;

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

vec2 getCameraIterationPosition(float iteration) {
    if (iteration == 0.) {
        return vec2(0.);
    }
    float n = n21(vec2(iteration));

    float m = CAMERA_RANGE;
    return round(vec2((n - .5) * m, (fract(n*113.43) - .5) * m));
}

vec2 cameraNextPosition() {
    float t = iTime * CAMERA_TIME_SCALE;

    vec2 center = vec2(.0);

    float iterationDuration = 1.;

    float iteration = floor(t / iterationDuration) + 1.;
    float stepSize = 1.;

    vec2 prevPosition = getCameraIterationPosition(iteration - 1.)*CELL_SIZE*stepSize;
    vec2 nextPosition = getCameraIterationPosition(iteration)*CELL_SIZE*stepSize;


    float iterationTime = mod(t, iterationDuration) / iterationDuration;

    float iterationSteps = 2.;
    float stepDuration = iterationDuration / iterationSteps;
    float iterationStep = floor(iterationTime / stepDuration) + 1.;

    float iterationStepTime = mod(iterationTime, stepDuration) / stepDuration;

    vec2 f = (nextPosition - prevPosition) * vec2(iterationStepTime);

    if (iterationStep == 1.) {
        f.y = 0.;
    } else if (iterationStep == 2.) {
        prevPosition.x = nextPosition.x;
        f.x = 0.;
    }


    center = prevPosition + f;

    return center;
}

void scriptCamera() {
    float t = iTime / 18.;

    vec2 nextPosition = cameraNextPosition();

    camera.x = nextPosition.x;
    camera.y = nextPosition.y;

    camera.z = .5 - cos(iTime/2.) * .5;

    float verticalA = 1.0;
    float horizA = 0.;
    horizA = sin(t*8.);

    verticalA = 1. - (sin(t*8.)*.02 + .01);

    camera.rotation = sin(iTime) * PI/64.;

    camera.horizontalAngle = horizA;
    camera.verticalAngle = verticalA;
}

void setupCamera() {
    camera.x = 0.;
    camera.y = 0.;
    camera.z = 0.;
    camera.rotation = 0.;
    scriptCamera();
}

vec3 getLightColor(vec3 p, vec3 n, vec3 lightPos) {
    // vec3 lightPos = ;
    vec3 l = normalize(lightPos - p);
    float dif = clamp(0., 1., dot(n,l));
    TraceResult tr = trace(p + n * (MIN_DISTANCE*2.), l);
    float distanceToLight = tr.ds;
    if (distanceToLight < length(lightPos - p)) {
        dif *= .5;
    }

    return vec3(dif);
}



void mainImage(out vec4 fragColor, in vec2 fragCoords) {

    mouse = iMouse.xy/iResolution.xy;
    isScripted = true;//false; //!isKeyDown(Key_Shift);

    setupCamera();

    vec2 uv = ((fragCoords.xy / iResolution.xy) - .5) * vec2(iResolution.x / iResolution.y, 1.);

    vec3 col = vec3(.0);

    float a = 0.;

    vec3 ro = vec3(0., 1. , 0.1);
    vec3 lookat = vec3(0., 1.*camera.verticalAngle, 0.);

    if (!isScripted) {
        ro = vec3(0., 0. , -4.);
        lookat = vec3(0., 0., 0.);
    }

    float zoom = .9;
    vec3 up = vec3(0., 1., 0.);
    up.xy *= rot2d(PI / 2. + camera.rotation);

    vec3 f = normalize(lookat - ro);
    vec3 r = normalize(cross(up, f));
    vec3 u = cross(f, r);

    vec3 c = ro + f * zoom;
    vec3 I = c + uv.x * r + uv.y * u;

    vec3 rd = normalize(I - ro);

    TraceResult tr = trace(ro, rd);

    if (tr.dt < MIN_DISTANCE) {
        float objId = tr.obj;
        vec3 normal;

        if (objId == OBJ_FLOOR) {
            col += floorTexture(tr.p, tr.q1);
            normal = vec3(0., -1., 0.);
        } else if (objId == OBJ_CAMERA) {
            col += mix(vec3(0., 0., 1.), vec3(1., 0., 0.), (.7 + tr.dist.p.y*10.));
        } else if (objId == OBJ_DOME) {
            col += domeTexture(tr.p);
        } else {
            normal = getNormal(tr.p, tr.dt);
            col += getBuildingTexture(tr, normal);
            // getLightColor(tr.p, normal, vec3(camera.x, camera.y, camera.z));
        }

    }

    float d = length(tr.p - vec3(camera.x, camera.y, camera.z))/(1. + camera.z/8.);
    float fog = 2.2 - d/1.8;

    fragColor = vec4(min(vec3(1.), col), 1.);
    if (tr.obj != OBJ_DOME) {
        fragColor *= fog;
    }
}