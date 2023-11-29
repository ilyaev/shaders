precision mediump float;
#define PI 3.14159265359
#define MAX_TRACE_STEPS 100
#define FAR_DISTANCE 100.
#define SURF_DIST 0.01

mat2 Rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

float smin( float a, float b)
{
    float k = .4;
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float sdCircle(vec3 p, vec3 pos, float radius) {
    return distance(p, pos) - radius;
}

float sdBox(vec3 p, vec3 s) {
    p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, max(p.y, p.z)), 0.);
}

vec3 map(vec3 p) {
    float d = p.y;
    // float d = sdCircle(p, vec3(0.,0., 0.), 0.1);
    // d = min(d, sdCircle(p, vec3(0., 1.,6.), 1.));
    d = min(d, sdBox(p-vec3(0.,1.,0.), vec3(1.)));
    return vec3(d, 0., 0.);
}

vec4 trace(vec3 ro, vec3 rd, int steps) {
    float dO=0.;

    for(int i=0; i<MAX_TRACE_STEPS; i++) {
    	vec3 p = ro + rd*dO;
        float dS = map(p).x;
        dO += dS;
        if(dO>FAR_DISTANCE || dS<SURF_DIST) break;
    }

    return vec4(dO);
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.01, 0.);
    float d = map(p).x;
    vec3 n = d - vec3(map(p - e.xyy).x, map(p - e.yxy).x, map(p - e.yyx).x);
    return normalize(n);
}

float getLight(vec3 p) {
    vec3 lightPos = vec3(0., 5., 6.);
    lightPos.xy += vec2(sin(iTime), cos(iTime));
    vec3 l = normalize(lightPos - p);
    vec3 n = getNormal(p);

    float dif = clamp(dot(n, l), 0., 1.);
    float d = trace(p + n * SURF_DIST * 2., l, 256).x;
    if (d < length(lightPos - p)) {
        dif *= 0.8;
    }
    return dif;
}

vec3 R(vec2 uv, vec3 p, vec3 l, float z) {
    vec3 f = normalize(l-p),
        r = normalize(cross(vec3(0,1,0), f)),
        u = cross(f,r),
        c = p+f*z,
        i = c + uv.x*r + uv.y*u,
        d = normalize(i-p);
    return d;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;

    // vec3 rayOrigin = vec3(0., 1., 0.);
    // vec3 rayDirection = normalize(vec3(uv.x, uv.y, 1.));

    // vec4 traceMap = trace(rayOrigin, rayDirection, 256);

    vec3 color = vec3(0.);

    vec3 ro = vec3(0, 4, -5);
    ro.yz *= Rot(iMouse.x*3.14+1.);
    ro.xz *= Rot(iMouse.y*6.2831);

    vec3 rd = R(uv, ro, vec3(0,1,0), 1.);

    vec4 traceMap = trace(ro, rd, 256);

    float d = traceMap.x;

    if (d < FAR_DISTANCE) {

        // vec3 p = rayOrigin + rayDirection * d;
        vec3 p = ro + rd * d;

        float dif = getLight(p);

        color = vec3(dif); //d < 0.01 ? 1. : 0.);
    }


    fragColor = vec4(color, 1.0);
}