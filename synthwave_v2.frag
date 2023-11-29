#iChannel0 "file://noise_seamless.jpg"
#define MAX_STEPS 300
#define MIN_DISTANCE 0.01
#define MAX_DISTANCE 16.
#define GRID_SIZE 4.
#define speed 10.
#define MOUNTAIN_COLOR vec3(0.9, 0.4, 0.9)

struct traceResult {
    bool  isHit;
    float distanceTo;
    float material;
    float planeHeight;
    vec3 planeNormal;
};

struct getDistResult {
    float distanceTo;
    float material;
    float planeHeight;
    vec3 planeNormal;
};

float sdPlane(vec3 p, float h) {
    return p.y - h;
}

float sdBackground(vec3 p, float h) {
    return p.z - h;
}

float N21(vec2 p) {
    return fract(sin(p.x*223.32+p.y*5677.)*4332.23);
}

float SmoothNoise(vec2 uv) {
    vec2 lv = fract(uv);
    vec2 id = floor(uv);

    float bl = N21(id);
    float br = N21(id + vec2(1.,0.));
    float b = mix(bl, br, lv.x);

    float tl = N21(id + vec2(0.,1.));
    float tr = N21(id + vec2(1.,1.));
    float t = mix(tl, tr, lv.x);

    float n = mix(b, t, lv.y);
    return n;
}

float getHeightWave(vec2 id) {
    float ax = abs(id.x);
    if (ax < GRID_SIZE) {
        return 0.;
    }
    float n = N21(id);
    float wave = sin(id.y/9. + cos(id.x/3.))*sin(id.x/9. + sin(id.y/4.));

    wave = clamp((wave * .5 + .5) + n*.15 - .6, 0., 1.);
    if (ax < (GRID_SIZE + 5.) && ax >= GRID_SIZE) {
        wave *= (ax - GRID_SIZE + 1.)*.2;
    }
    return (wave*10.);
}


float getHeight(vec2 id) {
    return getHeightWave(id);
    // float n = N21(id/20.);
    float n = SmoothNoise(id/30.*4.);
    // float n = texture(iChannel0, id/10.).x;
    if (abs(id.x) < 4.) {
        return 0.;
    }
    return clamp(n - .5, 0., 1.)*10.;
}

getDistResult getDist(vec3 p) {
    float size = GRID_SIZE;
    vec3 nuv = p * size + vec3(0., 0., iTime * speed);
    vec2 uv = fract(nuv).xz;
    vec2 id = floor(nuv).xz;

    vec2 lv = uv;

    float bl = getHeight(id);
    float br = getHeight(id + vec2(1., 0.));
    float b = mix(bl, br, lv.x);

    float tl = getHeight(id + vec2(0., 1.));
    float tr = getHeight(id + vec2(1., 1.));
    float t = mix(tl, tr, lv.x);

    float height = mix(b,t, lv.y);

    // vec3 n = bl - vec3(br, tl, tr);

    float O = bl;
    float R = br;
    float T = getHeight(id + vec2(0. -1.));
    float B = tl;
    float L = getHeight(id + vec2(-1., 0));

    vec3 n = vec3(2.*(R-L), 2.*(B-T), -4.);


    float d = sdPlane(p, -.5 + 0.3*height);
    // float bg = sdBackground(p, 2.);
    // d = min(d, bg);
    // (bl < 0.01 &&  (br == 0. || tl == 0. || tr == 0.)) ? 0. : height
    getDistResult result;
    result.distanceTo = d;
    result.material = 1.;
    result.planeHeight = height;
    result.planeNormal = normalize(n);
    return result;
}

traceResult trace(vec3 ro, vec3 rd) {
    traceResult result;
    float ds, dt;
    getDistResult dist;
    for(int i = 0 ; i < MAX_STEPS ; i++) {
        vec3 p = ro + rd * ds;
        dist = getDist(p);
        dt = dist.distanceTo;
        ds += dt * .5;
        if (abs(dt) < MIN_DISTANCE || ds > MAX_DISTANCE) {
            break;
        }
    }
    result.isHit = abs(dt) < MIN_DISTANCE;
    result.distanceTo = ds;
    result.material = dist.material;
    result.planeHeight = dist.planeHeight;
    result.planeNormal = dist.planeNormal;
    return result;
}

float getLightDiffuse(vec3 p, float material, float height, vec3 normal) {
    vec3 lightPos = vec3(0., 3., -10.);
    vec3 l = normalize(lightPos - p);
    float dif = clamp(dot(normal, l), 0., 1.);
    return dif;
}

vec3 getAlbedo(vec3 p, float material, float height, vec3 normal) {
    if (height > 0.) {
        return MOUNTAIN_COLOR;
    }
    float size = GRID_SIZE;
    vec3 nuv = p * size+ vec3(0., 0., iTime * speed);
    vec3 uv = fract(nuv) ;
    vec3 id = floor(nuv);

    vec3 col = vec3(0.);

    if (uv.x > .95 || uv.z > .95 || uv.x < .05 || uv.z < .05) {
        col.r += 1.;
    }

    return vec3(col);
}

vec3 getBackground(vec2 uv) {
    vec3 col = vec3(0.4);
    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec2 mouse = iMouse.xy / iResolution.xy;

    vec3 col = vec3(0.);

    vec3 ro = vec3(0., 0., -2.);
    vec3 lookat = vec3(mouse.x*2.-1., 1. - mouse.y - .6, 0.);
    float zoom = 1.;


    vec3 f = normalize(lookat - ro);
    vec3 r = normalize(cross(vec3(0., 1., 0), f));
    vec3 u = cross(f, r);
    vec3 c = ro + f * zoom;
    vec3 i = c + uv.x * r + uv.y * u;

    vec3 rd = normalize(i - ro);

    vec3 p = vec3(0.);

    traceResult tr = trace(ro, rd);

    if (tr.isHit) {

        p = ro + rd * tr.distanceTo;

        vec3 albedo = getAlbedo(p, tr.material, tr.planeHeight, tr.planeNormal);
        float diffuse = getLightDiffuse(p, tr.material, tr.planeHeight, tr.planeNormal);
        float fade = 1. - p.z/(MAX_DISTANCE * .9);

        col = diffuse * albedo * fade;
    }

    vec3 bgColor = getBackground(uv);



    fragColor = vec4(col, 1.);
}