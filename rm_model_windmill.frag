#define t iTime
#define MAX_STEPS 100
#define MIN_DIST 0.001
#define FAR_DIST 10.
#define PI 3.1416
#define PI2 PI*2.

struct sCamera {
    vec3 ro;
    vec3 rd;
    vec3 lookat;
    float zoom;
};

float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}

mat2 rot2d(float a) {
    return mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
}

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

float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}


float sdPlane(vec3 p, float y) {
    return p.y - y;
}

float sdBox(vec2 p, vec2 pos, vec2 b) {
    vec2 d = abs(p - pos) - b;
    return length(max(d,vec2(0))) + min(max(d.x,d.y),0.0);
}

vec3 getAlbedoByMaterial(float material, vec3 p, vec3 rd, vec3 normal) {
    vec3 albedo = vec3(1.);
    float size = 8.;
    if (material == 1.) {

        if (normal.x == 0. && normal.y == 0.) {
            albedo = vec3(1.);
        } else {
            albedo = vec3(1.);
        }
    } else if (material == 0.) {
        albedo *= vec3(.1, .5, .0);
    }
    return albedo;
}

float smin( float a, float b)
{
    float k = .4;
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}


vec3 kaleidoscopeUV(vec3 p, float segments) {
    vec2 uv = vec2(p.x, p.y);// * rot2d(iTime);

    float radius = sqrt(dot(uv, uv));
    float angle = atan(uv.y, uv.x);// + sin(iTime*10. + uv.y + sin(uv.x + cos(uv.y)) * 4.)*.2);

    float segmentAngle = PI2 / segments;

    float wid = floor((angle + PI) / segmentAngle);

    // radius += wid/150.;

    angle -= segmentAngle * floor(angle / segmentAngle);
    angle = min(angle, segmentAngle - angle);

    p.xy = vec2(cos(angle), sin(angle)) * radius;

    return p;
}

float sdLineSeg(vec3 p, vec3 a, vec3 b) {
    vec3 ap = p - a;
    vec3 ab = b - a;
    float t = clamp(dot(ap, ab)/dot(ab,ab), 0., 1.);
    vec3 c  = a + ab * t;
    return length(p - c);
}

float getMill(vec3 q) {
    vec3 p = q - vec3(0., 0., 0.);
    float d = 10000.;

    float height = 3.;

    float pole = sdLineSeg(p, vec3(0., 0., 0.), vec3(0., height, 0.)) - .1 - -p.y/45.;
    float sd = sdSphere(p - vec3(0.,height,.2), .1);
    float cabin = sdBox(p - vec3(0., height, -0.097), vec3(.1,  p.z/20. + .05, .2)) - .05;

    p = kaleidoscopeUV(vec3((p.xy - vec2(0., height)) * rot2d(iTime), p.z), 3.);

    vec3 pos1 = vec3(.5, 0., 0.2);
    float mills = sdBox(p - pos1, vec3(.5, .1 - (p.x + .3)/11., .05 - p.x/24. )) - .02;
    p = q;
    d = min(pole, mills);
    d = min(d, sd);
    d = min(d, cabin);

    return d;
}

vec3 getDist(vec3 p) {
    float material = 0.;
    float dK = getMill(p - vec3(0., -2., 0.));
    float d = dK;
    if (d == dK) {
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
        dt += dist.x * .7;
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

vec3 Transform(vec3 p) {
    // p.z += 5.*sin(iTime);
    // p.x += 3.*cos(iTime);
    // p.x += 2.5;
    // p.yz *= rot2d(iTime);
    // p.x -= 2.5;
    return p;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {

    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec2 mouse = iMouse.xy/iResolution.xy;

    vec3 col = vec3(0.);

    sCamera camera = setupCamera(uv, vec3(2.*sin(PI2 * mouse.x),cos((PI/2.)*mouse.y),-2.*cos(PI2 * mouse.x)), vec3(0., 0., 0.), .5);

    vec4 tr = trace(Transform(camera.ro), camera.rd);
    float materialID = tr.a;
    float distanceTo = tr.y;

    vec3 lightPos = vec3(1., 1., 1.5);

    if (tr.x < MIN_DIST) {
        vec3 p = Transform(camera.ro) + camera.rd * distanceTo;
        vec3 normal = getNormalByMaterial(materialID, p);
        vec3 albedo = getAlbedoByMaterial(materialID, p, camera.rd, normal);
        vec3 diffuse = getLightColor(p, normal, lightPos);
        vec3 specular = getSpecularColor(p, normal, lightPos, camera.ro);
        float ambient = .1;
        float fade = 1.;

        col = clamp(vec3(0.), vec3(1.), (ambient + diffuse + specular) * albedo) * fade;
    }



    // col.rg += camera.rd.xy;

    fragColor = vec4(col, 1.);

}