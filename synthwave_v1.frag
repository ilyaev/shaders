#iChannel0 "file://noise_seamless.jpg"
#define MAX_STEPS 200
#define MIN_DISTANCE 0.01
#define MAX_DISTANCE 2.
#define GRID_SIZE 4.
#define speed 10.

float sdPlane(vec3 p, float h) {
    return p.y - h;
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
    if (abs(id.x) < GRID_SIZE) { //(4. + sin(id.y/2. + iTime)*4.)) {
        return 0.;
    }
    float n = N21(id);
    // id.y = id.y;
    float wave = sin(id.y/9. + cos(id.x/3.))*sin(id.x/9. + sin(id.y/4.));
    // wave = clamp(wave * .5 + .5 - .6, 0., 1.);
    // return wave*n*8.;
    wave = clamp((wave * .5 + .5) + n*.15 - .6, 0., 1.);
    return (wave*8.);
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

vec3 getDist(vec3 p) {
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

    float c = mix(b,t, lv.y);

    float d = sdPlane(p, -.5 + 0.3*c);
    return vec3(d, 1., 0.);
}

vec3 trace(vec3 ro, vec3 rd) {
    float ds, dt;
    vec3 dist;
    for(int i = 0 ; i < MAX_STEPS ; i++) {
        vec3 p = ro + rd * ds;
        dist = getDist(p);
        dt = dist.x;
        ds += dt * .5;
        if (abs(dt) < MIN_DISTANCE || dt > MAX_DISTANCE) {
            break;
        }
    }
    return vec3(dt, ds, dist.y);
}

vec3 getAlbedo(vec3 p, float material) {
    float size = GRID_SIZE;
    float c = step(.0001, sin(p.x*size)/sin(p.z*size));
    vec3 nuv = p * size+ vec3(0., 0., iTime * speed);
    vec3 uv = fract(nuv) ;
    vec3 id = floor(nuv);

    vec3 col = vec3(0.);

    col += N21(id.xz/10.) * vec3(0.9, 0.4, 0.9);



    if (id.x < (GRID_SIZE-1.) && id.x > -GRID_SIZE) {
        col = vec3(0.);
    }

    if (uv.x > .95 || uv.z > .95 || uv.x < .05 || uv.z < .05) {
        col.r = 1.;
    }

    return vec3(col);
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

    float point = 1. - step(.05 + .1*mouse.x, length(cross(rd, p - ro))/length(rd));

    // col += point;

    vec3 tr = trace(ro, rd);

    if (tr.x < MIN_DISTANCE) {
        float dist = tr.y;
        float material = tr.z;

        p = ro + rd * dist;

        vec3 albedo = getAlbedo(p, material);

        float fade = 1. - p.z/15.;

        col = albedo * fade;
    }



    fragColor = vec4(col, 1.);
}