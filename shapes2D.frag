precision mediump float;
#define PI 3.14159265359
#define MAX_TRACE_STEPS 256
#define FAR_DISTANCE 5.
#define MAX_OBJECTS 8

mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float smin( float a, float b)
{
    // return min(a,b);
    float k = .2;
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float sdCircle(vec2 p, vec2 pos, float radius) {
    return distance(p, pos) - radius;
}

float sdBox(vec2 p, vec2 pos, vec2 b) {
    vec2 d = abs(p - pos) - b;
    return length(max(d,vec2(0))) + min(max(d.x,d.y),0.0);
}

vec3 deformSquareTunnel(vec2 p, float speed) {
    float a = atan(p.y,p.x);

    float r = pow( pow(p.x*p.x,4.) + pow(p.y*p.y,4.0), 1.0/8.0 );
    // float r = length(p);

    vec2 uv = vec2( 0.4/r + speed, a/3.1415927);
    return vec3(uv, r);
}

vec3 deformRoundTunnel(vec2 p, float speed) {
    float a = atan(p.y,p.x);

    float r = length(p);

    vec2 uv = vec2( a/3.1415927, 0.3/r + speed);
    return vec3(uv, r);
}

vec3 deformHall(vec2 p, float speed) {
    vec2 uv = vec2(p.x/abs(p.y), 1./abs(p.y) + speed);

    return vec3(uv, abs(p.y));
}

vec3 deformWave1(vec2 p, float speed) {
    float a = atan(p.y,p.x);

    // float r = pow( pow(p.x*p.x,4.0) + pow(p.y*p.y,4.0), 1.0/8.0 );
    float r = length(p);

    vec2 uv = vec2(r * cos(a+r)+speed, r * sin(a+r)  +speed);
    return vec3(uv, 1.);
}

vec3 deformWhirl(vec2 p, float speed) {
    float a = atan(p.y,p.x);

    float r = length(p);
    // float r = pow( pow(p.x*p.x,4.0) + pow(p.y*p.y,4.0), 1.0/8.0 );

    vec2 uv = vec2(0.5 * a/PI, sin(7. * r) + speed*4.);
    return vec3(uv, r);
}

vec3 deformFlowerTunnel(vec2 p, float speed) {
    float a = atan(p.y,p.x);
    float r = length(p);

    vec2 uv = vec2(1./(r+0.5+0.5*sin(5.*a)) + speed, a*3./PI);
    return vec3(uv, r);
}

vec3 deformWave2(vec2 p, float speed) {
    float r = length(p);

    vec2 uv = vec2(p.x*cos(2.*r) - p.y*sin(2.*r) + speed, p.y*cos(2.*r) + p.x*sin(2.*r) + speed);
    return vec3(uv, r);
}

vec3 deform(vec2 p, float speed) {
    float a = atan(p.y,p.x);
    float r = length(p);

    vec2 uv = vec2(0.3/(r + 0.5*p.x) + speed, 3.*a/PI);
    return vec3(uv, r);
}




vec3 checkerBoard(vec2 p, float size, float t) {
    vec3 tunnel = deformRoundTunnel(p, iTime * .2);
    vec2 uv = tunnel.xy;

    vec2 nuv = floor((uv + vec2(0., 0.)) * size);
    if (mod(nuv.x + nuv.y, 2.) == 0.) {
        return vec3(1.) * tunnel.z;
    } else {
        return vec3(0.);
    }
}

float opSubtraction( float d1, float d2 ) { return max(-d1,d2); }

float opIntersection( float d1, float d2 ) { return max(d1,d2); }

float opSmoothSubtraction( float d1, float d2, float k ) {
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float opSmoothIntersection( float d1, float d2, float k ) {
    float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) + k*h*(1.0-h);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy / .5 - 1.;
    uv.x *= iResolution.x / iResolution.y;

    float d = -1.;

    float radius = 0.5 + sin(iTime*2.) * 0.3;
    vec2 center = vec2(0.);

    vec3 color = checkerBoard(uv, 9., iTime);

    // vec3 tunnel = deformSquareTunnel(uv, 0.);
    // uv = tunnel.xy + vec2(-1.,.0);

    // vec3 tunnel = deformHall(uv, 0.);
    // uv = tunnel.xy - vec2(0.,2.);



    for (int i = 0 ; i < MAX_OBJECTS ; i++) {
        float a = (PI * 2. / float(MAX_OBJECTS)) * float(i) + iTime;

        vec2 pos = vec2(center.x + radius * sin(a), center.y + radius * cos(a));
        float df = sdCircle(uv, pos, 0.1 + 0.01 * float(i));
        // float df = sdBox(uv, pos, vec2(0.1));
        // float df = opIntersection(sdCircle(uv, pos, 0.1),  sdBox(uv, pos-vec2(0.,0.1), vec2(0.1)));
        // float df = opSmoothSubtraction(sdCircle(uv, pos, 0.1),  sdBox(uv, pos-vec2(0.,0.2), vec2(0.05)), 0.1);
        if (d == -1.) {
            d = df;
        } else {
            d = smin(d, df);
        }
    }



    float distMagnitude = 1.0 - smoothstep(0.,0.01,d);
    if (distMagnitude <= 0.9 && distMagnitude > 0.01) {
        color *= clamp(0.7, 1., distMagnitude);
    } else if (distMagnitude > 0.9) {
        color = distMagnitude * vec3(1., 0.3, 0.1);
    }


    fragColor = vec4(color, 1.0);
}