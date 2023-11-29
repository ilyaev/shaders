#iChannel0 "file://st_cubemap1.jpeg"
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


float hash( vec2 p ) {
	float h = dot(p,vec2(127.1,311.7));
    return fract(sin(h)*43758.5453123);
}
float noise( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );
	vec2 u = f*f*(3.0-2.0*f);
    return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ),
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ),
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
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

vec3 getAlbedoByMaterial(float material, vec3 p, vec3 rd, vec3 normal) {
    vec3 albedo = vec3(1.);
    float size = 8.;
    if (material == 1.) {
        albedo = vec3(0., 1., 0);
        vec3 r = reflect(rd, normal);
        // r.yz *= rot2d(iTime);
        vec3 ref = texture(iChannel0, r.xy).rgb;
        albedo *= ref;
        // albedo = vec3(1.) * step(0.0001, sin(r.x*size)*sin(r.y*size));
    } else if (material == 0.) {

        albedo *= step(0.0001, sin(p.x*size)*sin(p.z*size));
    }
    return albedo;
}

float sea_octave(vec2 uv, float choppy) {
    uv += noise(uv);
    vec2 wv = 1.0-abs(sin(uv));
    vec2 swv = abs(cos(uv));
    wv = mix(wv,swv,wv);
    return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
}

float getWaves(vec3 p) {
    return sdPlane(p, -.5);
    float mh = .1;
    vec3 id = floor(p * 10.);
    float n = n21(id.xz);
    float dP = sea_octave((p.xz + iTime)*.16, 4.)*.3;
    dP += sea_octave((p.xz - iTime)*.16, 4.)*.3;
    return p.y + dP;
}


float smin( float a, float b)
{
    float k = .4;
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}


float getK(vec3 q) {

    float Step = 2.6;

    vec3 c = vec3(0., 0., Step);
    vec3 p = q;
    // if (SINGLE_SCENE != true) {
        // p = mod(q + 0.5 * c, c) - 0.5 * c;
    // }

    vec2 uv = vec2(p.x, p.y);// * rot2d(iTime);

    float segments = 17.;

    float radius = sqrt(dot(uv, uv));
    float angle = atan(uv.y, uv.x);

    float segmentAngle = PI2 / segments;

    float wid = floor((angle + PI) / segmentAngle);

    vec3 pos = vec3(1., .5, 0.);

    angle -= segmentAngle * floor(angle / segmentAngle);

    angle = smin(angle, segmentAngle - angle);

    // angle = abs(angle);

    // angle = mod(angle, segmentAngle);

    p.xy = vec2(cos(angle), sin(angle)) * radius;// + sin(iTime*4. + wid*13.) * 0.1;

    p.y = abs(p.y);
    float d = sdSphere(p - pos, .25);
    // p.xy *= rot2d(iTime);
    // d = sdBox(p - pos, vec3(.8, .2, .3));
    // d = sdBox(p - pos, vec3(.1, .45, abs(sin(p.y)*.2)));
    p -= pos;
    // p.xz *= rot2d(PI + iTime);// iTime*0.);
    p += pos;
    d = sdBox(p - pos, vec3(.1, .45, abs(p.y)/3. + .1));
    // float d1 = sdBox(p - pos, vec3(1.5, .10, p.y/15.));
    vec3 pos1 = vec3(1.,0.,0.6);
    p -= (pos1 - vec3(0., 0., .6));
    // p.xz *= rot2d(iTime + cos(iTime + sin(wid + iTime)));
    p.xz *= rot2d(PI + iTime);
    p += (pos1 - vec3(0., 0., .6));
    float d2 = sdBox(p - pos1, vec3(.05, .1, .6));


    vec3 pos2 = vec3(1.,0.,-0.6);
    p -= (pos2 - vec3(0., 0., -.6));
    p.xz *= rot2d(-PI + iTime);
    p += (pos2 - vec3(0., 0., -.6));
    float d3 = sdBox(p - pos2, vec3(.05, .1, .6));

    return smin(d3, smin(d2, d));//min(d, d1));
}

vec3 getDist(vec3 p) {
    float material = 0.;
    // float dS = sdSphere(p, .5);
    float dP = getWaves(p);
    float dK = getK(p);
    float d = dK;
    // d = min(d, dK);
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

    vec3 lightPos = vec3(1., 1., 1.5);

    if (tr.x < MIN_DIST) {
        vec3 p = camera.ro + camera.rd * distanceTo;
        vec3 normal = getNormalByMaterial(materialID, p);
        vec3 albedo = getAlbedoByMaterial(materialID, p, camera.rd, normal);
        vec3 diffuse = getLightColor(p, normal, lightPos);
        vec3 specular = getSpecularColor(p, normal, lightPos, camera.ro);
        float ambient = .1;
        float fade = 1.;
        // vec3 ref = texture(iChannel0, r.xy).rgb;



        col = clamp(vec3(0.), vec3(1.), (ambient + diffuse + specular) * albedo) * fade;
    }



    // col.rg += camera.rd.xy;

    fragColor = vec4(col, 1.);

}