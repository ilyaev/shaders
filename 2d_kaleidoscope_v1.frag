precision mediump float;
#define PI 3.14159265359
#define PI2 6.28309265359
#define TUNNEL_SPEED .4


float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}

vec3 renderPlasma(vec2 uv) {
    for(float i = 1.0; i < 3.0; i++){
        uv.x += .6 / i * cos(i * 2.5* uv.y + iTime);
        uv.y += 0.6 / i * cos(i * 3.5 * uv.y + iTime);
    }
    // uv.x -= iTime/100.;
    vec3 col = .5 + 0.5*sin(iTime*5. + uv.yyy + vec3(iTime,2. + iTime,4. + iTime));
    return col/(2.1*abs(cos(iTime-uv.x)));
    // return col/(2.1*abs(cos(uv.x * 2.)));
}

vec3 renderField(vec2 uv, float index) {
    vec3 col = vec3(.0);

    vec2 ouv = uv;
    float l = pow(TUNNEL_SPEED/length(uv), .30);
    float a = atan(uv.x, uv.y) + iTime*.3;

    float warp = iTime / 3.;

    // uv = vec2(a - sin(abs(uv.x*uv.y)/58.), l + warp);
    // uv = vec2(a - abs(uv.y/30.)*sin(iTime*5.)*cos(iTime*3. + uv.x/2.), l + warp);
    // uv = vec2(a, l + warp + uv.x*uv.y/10.);
    uv = vec2(a, l + warp);

    ouv = uv;

    vec2 cells = vec2(10., 10.);

    uv *= cells;

    vec2 id = floor(uv);
    uv = fract(uv);

    float n = n21(id + index * 100.);
    float n1 = fract(n*123.543 + index * 2.);
    float n2 = fract(n*4435.332 + index * 4.);

    if (index == 2.) {
        // col.rgb = renderPlasma(ouv/2.)*l/15.; //*smoothstep(0.3, .9, ouv.x);
    }

    if ((n + n1) < .5) {
        return col.rgb + vec3(.1, 0., 0.);
    }

    if ((n + n1) > 1.5) {
        return col.rgb + vec3(0., .1, 0.);
    }

    float star = step(uv.x, n) - step(uv.x, n-.05);
    star *= step(uv.y, n1) - step(uv.y, n1-(.3*n2));

    col.rgb += vec3(star) * (1. - l/2.);
    // col.rgb = vec3(step(length(uv - vec2(n1,n2)), .1*n2)) * .4;



    return col;
}

vec3 renderTunnelTexture(vec2 uv) {

    // uv.y += sin(iTime)*.02;
    // uv.x += cos(iTime/2.)*.05;

    vec3 col = vec3(0.);
    col.rgb =
        renderField(uv, 0.)
        + renderField(uv*13., 1.)
        + renderField(uv/3., 2.);

    return col;
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

    float _SegmentCount = 3.;//floor(n21(vec2(floor(iTime), 122.)) * 16.);// + sin(iTime);

    vec2 mouse = iMouse.xy/iResolution.xy;

    vec2 shiftUV = (fragCoord.xy-.5*iResolution.xy)/iResolution.y;

    // shiftUV.xy *= rot2d(iTime*.3);


    float radius = sqrt(dot(shiftUV, shiftUV));
    float angle = atan(shiftUV.y, shiftUV.x) + mouse.x;

    float segmentAngle = PI2 / _SegmentCount;

    float wid = floor((angle + PI) / segmentAngle);

    angle -= segmentAngle * floor(angle / segmentAngle);

    angle = min(angle, segmentAngle - angle);

    // angle = abs(angle);

    // angle = mod(angle, segmentAngle);

    vec2 uv = vec2(cos(angle), sin(angle)) * radius;// + sin(iTime) * 0.1;

    // uv = max(min(uv, 2.0 - uv), -uv);


    vec2 cells = vec2(1.);

    uv = fract(uv * cells);
    vec2 id = floor(uv * cells);



    vec3 color = vec3(0.); //vec3(n21(vec2(wid, 3.2)));

    vec2 pos = vec2(.7 + cos(iTime) * .2);
    float dc = sdCircle(uv, pos, 0.05);

    vec2 p1 = vec2(0.);
    vec2 p2 = vec2(sin(mouse.x * PI), cos(mouse.x * PI));// * .2;

    vec2 p3 = vec2(0., mouse.y);
    vec2 p4 = vec2(mouse.y, 0.);

    dc = distanceFromSegment(uv, p1, p2);
    float dco = distanceFromSegment(shiftUV, p1, p2);

    float dc1 = distanceFromSegment(uv, p3, p4);
    float dco1 = distanceFromSegment(shiftUV, p3, p4);

    // color +=  1.0 - smoothstep(0.,0.01,dc);
    color +=  1.0 - smoothstep(0.,0.01,dc1);
    // color += (1.0 - smoothstep(0.,0.01,dco)) * vec3(0.9, .3, .1);
    // color += (1.0 - smoothstep(0.,0.01,dc1)) * vec3(0.9, .3, .1);

    color += renderTunnelTexture(uv);

    // float iter = floor(iTime);

    // for (float i = 0. ; i < 10. ; i++) {
    //     vec2 p1 = vec2(rand(vec2(i, 3. + iter)), rand(vec2(i, 2. + iter)));
    //     vec2 p2 = vec2(rand(vec2(i, 4. + iter)), rand(vec2(i, 1. + iter)));

    //     vec2 p3 = vec2(rand(vec2(i, 3. + iter + 1.)), rand(vec2(i, 2. + iter + 1.)));
    //     vec2 p4 = vec2(rand(vec2(i, 4. + iter + 1.)), rand(vec2(i, 1. + iter + 1.)));

    //     p1.x -= .5;
    //     p1.y -= .5;

    //     p3.x -= .5;
    //     p3.y -= .5;

    //     float st = max(fract(iTime) - .5, 0.) * 2.;

    //     p1 = mix(p1, p3, st);
    //     p2 = mix(p2, p4, st);

    //     dc = distanceFromSegment(uv, p1, p2);
    //     float dco = distanceFromSegment(shiftUV, p1, p2);
    //     color +=  1.0 - smoothstep(0.,0.01,dc);
    //     // color += (1.0 - smoothstep(0.,0.03,dco)) * vec3(0.9, .3, .1);


    //     float d = sdCircle(uv, mix(p2-p1, p4-p3, st), .0);
    //     // color +=  pow(.03/d, 3.3) * vec3(0.9, .3, .1);// 1.0 - smoothstep(0.,0.01,d);

    // }

    // dc = distanceFromSegment(uv, p1, p2);
    // float dco = distanceFromSegment(shiftUV, p1, p2);

    // color +=  1.0 - smoothstep(0.,0.01,dc);
    // color += (1.0 - smoothstep(0.,0.01,dco)) * vec3(0.9, .3, .1);

    // color += renderPlasmaOriginal(uv);

    // color += renderPlasmaOriginal(uv);





    fragColor = vec4(color, 1.0);
}