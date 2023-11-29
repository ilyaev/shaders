#iChannel0 "file://st_texture_disp_1.png"
#iChannel1 "file://st_cubemap1.jpeg"
#define MAX_STEPS 200
#define MAX_DIST 15.
#define SURF_DIST .001

#define S smoothstep
#define T iTime

mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float sdBox(vec3 p, vec3 s) {
    p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, max(p.y, p.z)), 0.);
}

float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    //  return fract(sin(n.x*123.231 + n.y*4432.342)*33344.22);
}

vec3 renderSquareTunnel(vec3 p) {
// p.y -= .3;
    // p.xy *= Rot(iTime);



    float Step = 1.;

    vec3 c = vec3(0., 0., Step);
    vec3 q = mod(p + 0.5 * c, c) - 0.5 * c;
    float id = round(p.z / Step);

    float n = n21(vec2(id, 1.)) - .1;

    float wS = clamp(n21(vec2(floor(iTime*3.*(n + .5)), id)), .5, 1.);
    float wN = clamp(n21(vec2(floor(iTime*3.*(n + .5)) + 1., id)), .5, 1.);

    float lS = clamp(n21(vec2(floor(iTime) + 100., id)), .5, 1.);
    float lN = clamp(n21(vec2(floor(iTime) + 100. + 1., id)), .5, 1.);

    float Width = .1 -.05 * mix(lS, lN, fract(iTime));
    float Wide = 1. * mix(wS, wN, fract(iTime*3.*(n + .5)));// + sin(iTime) * .2;



    // Width *= clamp(n + .2, .3, 1.);

    q.xy *= Rot(id * 1. + sin(iTime) * .5 + iTime*clamp((n - .5)*3., 0., 1.));

    float left = sdBox(abs(q) - vec3(0., Wide, 0.), vec3(1., Width, Width));
    float right = sdBox(abs(q) - vec3(Wide, 0., 0.), vec3(Width, 1., Width));
    // p.y += .3;

    float d = min(left, right);
    if (n > 0.5) {
        d = max(left, right);
    }

    // d = max(d, -center);
    // d = min(d, center);

    return vec3(d, id, 0.0);
}

vec3 renderWormWhole(vec3 p) {

    // p.y -= .3;
    // p.xy *= Rot(iTime);
    float Step = 1.;
    float Width = .2;
    float Wide = .8;// + sin(iTime) * .2;
    vec3 c = vec3(0., 0., Step);
    vec3 q = mod(p + 0.5 * c, c) - 0.5 * c;
    float id = round(p.z / Step);

    float n = n21(vec2(id, 1.));

    q.xy *= Rot(id * 1. + sin(iTime) * .5 + iTime*clamp((n - .5)*3., 0., 1.));

    float left = sdBox(abs(q) - vec3(0., Wide*n, 0.), vec3(1., Width, Width));
    float right = sdBox(abs(q) - vec3(Wide*n, 0., 0.), vec3(Width, 1., Width));
    // p.y += .3;

    float d = min(left, right);
    if (n > 0.5) {
        d = max(left, right);
    }

    vec2 uv = vec2(atan(p.x + id/2., p.z)/6.2832 + .5, .7*q.y/3. + .5);
    float disp = texture(iChannel0, uv).r;
    disp *= smoothstep(1.4, 1., abs(q.y));

    float center = length(q) - .5 - disp * .3;

    d = max(d, -center);
    // d = min(d, center);

    return vec3(d, id, 0.0);
}

vec3 GetDist(vec3 p) {
    return renderSquareTunnel(p);
}

vec3 RayMarch(vec3 ro, vec3 rd) {
	float dO=0.;
    vec3 res = vec3(0.);

    for(int i=0; i<MAX_STEPS; i++) {
    	vec3 p = ro + rd*dO;
        res = GetDist(p);
        float dS = res.x;
        dO += dS*.7;
        if(dO>MAX_DIST || abs(dS)<SURF_DIST) break;
    }

    return vec3(dO, res.y, res.z);
}

vec3 GetNormal(vec3 p) {
	float d = GetDist(p).x;
    vec2 e = vec2(.001, 0);

    vec3 n = d - vec3(
        GetDist(p-e.xyy).x,
        GetDist(p-e.yxy).x,
        GetDist(p-e.yyx).x);

    return normalize(n);
}

vec3 GetRayDir(vec2 uv, vec3 p, vec3 l, float z) {
    vec3 f = normalize(l-p),
        r = normalize(cross(vec3(0,1,0), f)),
        u = cross(f,r),
        c = f*z,
        i = c + uv.x*r + uv.y*u,
        d = normalize(i);
    return d;
}

vec3 Transform(vec3 p) {
     return p + vec3(0.,0.,-iTime*5.);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
	vec2 m = iMouse.xy/iResolution.xy;

    vec3 ro = vec3(0, 3, -3);
    ro.yz *= Rot(-m.y*3.14+1.);
    ro.xz *= Rot(-m.x*6.2831);

    vec3 rd = GetRayDir(uv, ro, vec3(0,0.,0), 1.);
    vec3 col = vec3(0);

    vec3 rm = RayMarch(Transform(ro), rd);
    float d = rm.x;
    float id = abs(rm.y);

    if(d<MAX_DIST) {
        vec3 p = Transform(ro) + rd * d;
        vec3 n = GetNormal(p);
        vec3 r = reflect(rd, n);
        vec3 ref = texture(iChannel0, Transform(r).xy).rgb;

        float dif = dot(n, normalize(vec3(1,2,3)))*.5+.5;
        col = vec3(dif) * ref * clamp(vec3(sin(id*10.) + .2, cos(id*20.), cos(id)/sin(id)), vec3(0.0, .3, 0.), vec3(1., .1, 0.3));
    }

    col = pow(col, vec3(.4545));	// gamma correction
    // col *= p;

    fragColor = vec4(col,1.0);
}