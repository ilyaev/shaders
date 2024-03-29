// Shpere triplanar texturing (polarless)

#iChannel0 "file://st_texture2.jpeg"
// #iChannel0::WrapMode "Clamp"
// #iChannel0::MagFilter "Nearest"
#define MAX_STEPS 100
#define MAX_DIST 100.
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


float GetDist(vec3 p) {
    float d = sdBox(p, vec3(1));
    d = length(p) - 1.5;
    return d;
}

vec3 Transform(vec3 p) {
    // p.xy *= Rot(iTime * .4);
    return p;
}

float RayMarch(vec3 ro, vec3 rd) {
	float dO=0.;

    for(int i=0; i<MAX_STEPS; i++) {
    	vec3 p = Transform(ro + rd*dO);
        float dS = GetDist(p);
        dO += dS;
        if(dO>MAX_DIST || abs(dS)<SURF_DIST) break;
    }

    return dO;
}

vec3 GetNormal(vec3 p) {
	float d = GetDist(p);
    vec2 e = vec2(.001, 0);

    vec3 n = d - vec3(
        GetDist(p-e.xyy),
        GetDist(p-e.yxy),
        GetDist(p-e.yyx));

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

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
	vec2 m = iMouse.xy/iResolution.xy;

    vec3 ro = vec3(0, 3, -3);
    ro.yz *= Rot(-m.y*3.14+1.);
    ro.xz *= Rot(-m.x*6.2831);

    vec3 rd = GetRayDir(uv, ro, vec3(0,0.,0), 1.);
    vec3 col = vec3(0);

    float d = RayMarch(ro, rd);

    if(d<MAX_DIST) {
        vec3 p = Transform(ro + rd * d);
        vec3 n = GetNormal(p);
        vec3 r = reflect(rd, n);

        float dif = dot(n, normalize(vec3(1,2,3)))*.5+.5;
        col = vec3(dif);

        // uv = fragCoord/iResolution.xy;
        // uv = p.xz * .5 + .5;
        vec3 colXZ = texture(iChannel0, p.xz * .5 + .5).xyz;
        vec3 colYZ = texture(iChannel0, p.yz * .5 + .5).xyz;
        vec3 colXY = texture(iChannel0, p.xy * .5 + .5).xyz;

        n = abs(n);

        n *= pow(n, vec3(20.));
        n /= n.x + n.y + n.z;

        col = n.z * colXY + colXZ * n.y + colYZ * n.x;
        // col = n;
    }

    // col = pow(col, vec3(.4545));	// gamma correction
    // uv = fragCoord/iResolution.xy;
    // col = texture(iChannel0, uv*.1 + .2).xyz;

    fragColor = vec4(col,1.0);
}