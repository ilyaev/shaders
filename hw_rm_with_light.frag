#define t iTime
#define MAX_STEPS 256
#define MIN_DIST 0.001
#define FAR_DIST 10.

struct sCamera {
    vec3 ro;
    vec3 rd;
    vec3 lookat;
    float zoom;
};

sCamera setupCamera(vec2 uv, vec3 ro, vec3 lookat, float zoom) {
    sCamera camera;
    camera.ro = ro;
    camera.lookat = lookat;
    camera.zoom = zoom;


    vec3 f = normalize(lookat - ro);
    vec3 r = normalize(cross(vec3(0., 1., 0.), f));
    vec3 u = cross(f, r);
    vec3 c = ro + f * zoom;
    vec3 i = c + uv.x*r + uv.y * u;
    vec3 rd = normalize(i - ro);

    camera.rd = rd;

    return camera;
}

float sdSphere(vec3 p, float radius) {
    return length(p) - radius;
}

float sdPlane(vec3 p, float x, float y) {
    return p.y - y;
}

vec3 getAlbedoByMaterial(float material, vec3 p) {
    vec3 albedo = vec3(1.);
    if (material == 1.) {
        albedo = vec3(0., 1., 0);
    } else if (material == 0.) {
        float size = 8.;
        albedo *= step(0.0001, sin(p.x*size)*sin(p.z*size));
    }
    return albedo;
}

vec3 getDist(vec3 p) {
    float material = 0.;
    float dS = sdSphere(p, .5);
    float dP = sdPlane(p, 0., -.5);
    float d = min(dS, dP);
    if (d == dS) {
        material = 1.;
    }
    return vec3(d, material, 0.);
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.01, 0.);
    float d = getDist(p).x;
    vec3 n = d - vec3(
        getDist(p - e.xyy).x,
        getDist(p - e.yxy).x,
        getDist(p - e.yyx).x
    );
    return normalize(n);
}

vec4 trace(vec3 ro, vec3 rd) {

    float dt, d;
    vec3 p;

    vec3 dist;

    for(int i = 0 ; i < MAX_STEPS ; i++) {
        p = ro + rd * dt;
        dist = getDist(p);
        dt += dist.x;
        if (dist.x < MIN_DIST || dist.x > FAR_DIST) {
            break;
        }
    }

    return vec4(dist.x, dt, dist.xy);
}

vec3 getLightColor(vec3 p, vec3 n) {
    vec3 lightPos = vec3(.5, .5, -1.);
    vec3 l = normalize(lightPos - p);
    float dif = clamp(0., 1., dot(n,l));
    return dif * vec3(1.);
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {

    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 col = vec3(0.);

    sCamera camera = setupCamera(uv, vec3(0.,0.,-2), vec3(0.), .5);

    vec4 tr = trace(camera.ro, camera.rd);

    if (tr.x < MIN_DIST) {
        vec3 p = camera.ro + camera.rd * tr.y;
        vec3 normal = getNormal(p);
        vec3 albedo = getAlbedoByMaterial(tr.a, p);
        vec3 diffuse = getLightColor(p, normal);
        col = albedo * diffuse;
    }



    // col.rg += camera.rd.xy;

    fragColor = vec4(col, 1.);

}