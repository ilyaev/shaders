precision mediump float;
#define PI 3.14159265359
#define PI2 6.28309265359


float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}

mat2 rot2d(float a) {
    return mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
}

vec3 wheelOfFortune(vec2 uv, float segments) {
    float angle = atan(uv.y, uv.x);
    float segmentAngle = PI2 / segments;
    float wid = floor((angle + PI) / segmentAngle);
    float n = n21(vec2(wid, 3.2));
    vec3 color = vec3(n, fract(n * 10.423), fract(n* 123123.342));
    return color;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord ) {

    float _SegmentCount = 18.;
    vec2 mouse = iMouse.xy/iResolution.xy;

    vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y;

    vec3 color = vec3(0.);

    color += wheelOfFortune(uv * rot2d(iTime), 6.);
    color += wheelOfFortune((uv + vec2(sin(iTime)*.1, cos(iTime)*.1)) * rot2d(-iTime), 6.);
    color += wheelOfFortune((uv + vec2(cos(iTime)*.2, sin(iTime)*.2)) * rot2d(-iTime*2.), 6.);

    fragColor = vec4(color/3., 1.0);
}