#define t iTime
#define MAX_STEPS 100
#define MIN_DIST 0.001
#define FAR_DIST 10.
#define PI 3.1416
#define PI2 PI*2.
#define MAT_GLOBE 1.
#define MAT_GLOBE_RINGS 2.
#define MAT_RED 3.
#define MAT_BLUE 4.


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

float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}


float sdSphere(vec3 p, float radius) {
    return length(p) - radius;
}

float sdPlane(vec3 p, float x, float y) {
    return p.y - y;
}

float sdTorus(vec3 p, vec2 r) {
    float x = length(p.xz) - r.x;
    return length(vec2(x, p.y)) - r.y;
}

float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}

mat2 rot2d(float a) {
    return mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
}

vec3 getAlbedoByMaterial(float material, vec3 p) {
    vec3 albedo = vec3(1.);
    if (material == MAT_GLOBE) {
        albedo = vec3(0.94, .82, 0.21);
    } else if (material == 0.) {
        float size = 8.;
        albedo *= step(0.0001, sin(p.x*size)*sin(p.z*size));
    } else if (material == MAT_RED) {
        albedo = vec3(0.9, .3 ,.1);
    } else if (material == MAT_BLUE) {
        albedo = vec3(0.1, .2, .9);
    }
    return albedo;
}

float getRings(vec3 p) {
    float d = 100000.;
    float t = iTime * .5;
    for(float i = 1.0 ; i <= 4.0 ; i++) {
        float n = n21(vec2(i, i));
        p.xy *= rot2d(PI * n + t);
        p.yz *= rot2d(PI * fract(n*10.23) + t*fract(n*567.43));
        d = min(d, sdTorus(p, vec2(.55 + (i - 1.)*0.03, .02)));
    }
    return d;
}

vec3 getDist(vec3 p) {
    float material = 0.;
    float dP = sdPlane(p, 0., -.5) ;// mix(sdPlane(p, 0., -.5), sdSphere(p + vec3(sin(iTime), 0., cos(iTime)), .1), -.3);

    float spline = sin(abs(p.y)*2.9 + 1.35) * .4;


    float dRR = sdBox(p, vec3(.04, .5, .3 * spline));
    float dRRh = sdBox(p, vec3(.02, .47, .2));
    dRR = max(dRR, -dRRh);
    float dRB = sdBox(p, vec3(.3 * spline, .45, .04));
    float dRBh = sdBox(p, vec3(.2, .42, .02));
    dRB = max(dRB, -dRBh);
    dRR = max(dRR, -dRBh);
    dRB = max(dRB, -dRRh);

    p -= vec3(0., 1.2, 0.);

    float dS = sdSphere(p, .5); //mix(sdSphere(p, .5), sdBox(p, vec3(.5)), abs(sin(iTime)));
    float dR = getRings(p);


    float d = min(dS, dP);
    d = min(d, dR);
    d = min(d, dRR);
    d = min(d, dRB);

    if (d == dS) {
        material = MAT_GLOBE;
    } else if (d == dR) {
        material = MAT_GLOBE_RINGS;
    } else if (d == dRR) {
        material = MAT_RED;
    } else if (d == dRB) {
        material = MAT_BLUE;
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

vec3 getLightColor(vec3 p, vec3 n, vec3 lightPos) {
    // vec3 lightPos = ;
    vec3 l = normalize(lightPos - p);
    float dif = clamp(0., 1., dot(n,l));

    float distanceToLight = trace(p + n * (MIN_DIST*2.), l).x;
    if (distanceToLight < length(lightPos - p)) {
        dif *= .5;
    }

    return vec3(dif);
}

vec3 getSpecularColor(vec3 p, vec3 n, vec3 lightPos, vec3 viewPos) {
    vec3 spec = vec3(0.);
    float specularStrength = 0.5;

    vec3 viewDir = normalize(p - viewPos);
    vec3 reflectDir = reflect(normalize(lightPos - p), n);
    float specValue = pow(max(dot(viewDir, reflectDir), 0.), 32.);


    return spec + specularStrength * specValue;
}

vec3 getNormalByMaterial(float material, vec3 p) {
    vec3 normal = vec3(0., 1., 0.);
    if (material == 1.) {
        normal = getNormal(p);
    }
    return normal;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {

    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec2 mouse = iMouse.xy/iResolution.xy;

    vec3 col = vec3(0.);

    sCamera camera = setupCamera(uv, vec3(2.*sin(PI2 * mouse.x),cos((PI/2.)*mouse.y),-2.*cos(PI2 * mouse.x)), vec3(0.), .5);

    vec4 tr = trace(camera.ro, camera.rd);
    float materialID = tr.a;
    float distanceTo = tr.y;

    vec3 lightPos = vec3(1., 1., -1.5);

    if (tr.x < MIN_DIST) {
        vec3 p = camera.ro + camera.rd * distanceTo;
        vec3 normal = getNormalByMaterial(materialID, p);
        vec3 albedo = getAlbedoByMaterial(materialID, p);
        vec3 diffuse = getLightColor(p, normal, lightPos);
        vec3 specular = getSpecularColor(p, normal, lightPos, camera.ro);
        float ambient = .1;
        float fade = 1.;
        col = clamp(vec3(0.), vec3(1.), (ambient + diffuse + specular) * albedo) * fade;
    }



    // col.rg += camera.rd.xy;

    fragColor = vec4(col, 1.);

}