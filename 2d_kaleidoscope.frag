precision mediump float;
#define PI 3.14159265359
#define PI2 6.28309265359

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

vec3 renderPlasmaOriginal(vec2 uv) {
    for(float i = 1.0; i < 10.0; i++){
        uv.x += 0.6 / i * cos(i * 2.5* uv.y + iTime);
        uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
    }
    vec3 col = 0.5 + 0.5*sin(iTime+uv.xyx+vec3(0,2,4));
    return col/(2.1*abs(cos(iTime-uv.y-uv.x)));
}

float distanceFromSegment(vec2 U, vec2 A, vec2 B)
{
	vec2 UA = U - A;
    vec2 BA = (B - A);

    float s = dot(UA, BA) / length(BA);
    s = s / length(BA);
    s = clamp(s, 0., 1.);
    return length(UA - s*BA);
}


float sdCircle(vec2 p, vec2 pos, float radius) {
    return distance(p, pos) - radius;
}

mat2 rot2d(float a) {
    return mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {

    float _SegmentCount = 3.;// + sin(iTime);

    vec2 shiftUV = (fragCoord.xy-.5*iResolution.xy)/iResolution.y;

    shiftUV.xy *= rot2d(iTime*.3);


    float radius = sqrt(dot(shiftUV, shiftUV));
    float angle = atan(shiftUV.y, shiftUV.x);

    float segmentAngle = PI2 / _SegmentCount;

    angle -= segmentAngle * floor(angle / segmentAngle);

    angle = min(angle, segmentAngle - angle);

    vec2 uv = vec2(cos(angle), sin(angle)) * radius;// + 0.05;

    uv = max(min(uv, 2.0 - uv), -uv);

    vec3 color = vec3(0.);

    vec2 pos = vec2(.7 + cos(iTime) * .2);
    float dc = sdCircle(uv, pos, 0.05);

    // vec2 p1 = abs(vec2(0.) + vec2(cos(iTime) * .1, sin(iTime) * .1));
    // vec2 p2 = abs(vec2(.3) + vec2(sin(iTime) * .3, cos(iTime) * .3));

    float iter = floor(iTime);

    for (float i = 0. ; i < 10. ; i++) {
        vec2 p1 = vec2(rand(vec2(i, 3. + iter)), rand(vec2(i, 2. + iter)));
        vec2 p2 = vec2(rand(vec2(i, 4. + iter)), rand(vec2(i, 1. + iter)));

        vec2 p3 = vec2(rand(vec2(i, 3. + iter + 1.)), rand(vec2(i, 2. + iter + 1.)));
        vec2 p4 = vec2(rand(vec2(i, 4. + iter + 1.)), rand(vec2(i, 1. + iter + 1.)));

        p1.x -= .5;
        p1.y -= .5;

        p3.x -= .5;
        p3.y -= .5;

        float st = max(fract(iTime) - .5, 0.) * 2.;

        p1 = mix(p1, p3, st);
        p2 = mix(p2, p4, st);

        dc = distanceFromSegment(uv, p1, p2);
        float dco = distanceFromSegment(shiftUV, p1, p2);
        color +=  1.0 - smoothstep(0.,0.01,dc);
        color += (1.0 - smoothstep(0.,0.03,dco)) * vec3(0.9, .3, .1);


        float d = sdCircle(uv, mix(p2-p1, p4-p3, st), .03);
        color +=  1.0 - smoothstep(0.,0.01,d);

    }

    // dc = distanceFromSegment(uv, p1, p2);
    // float dco = distanceFromSegment(shiftUV, p1, p2);

    // color +=  1.0 - smoothstep(0.,0.01,dc);
    // color += (1.0 - smoothstep(0.,0.01,dco)) * vec3(0.9, .3, .1);

    // color += renderPlasmaOriginal(uv);

    // color *= renderPlasmaOriginal(shiftUV);





    fragColor = vec4(color, 1.0);
}