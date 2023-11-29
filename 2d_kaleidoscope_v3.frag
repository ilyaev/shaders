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

vec3 wheelOfFortune(vec2 uv, float segments, bool vignete) {
    float t = iTime * 0.;
    float angle = atan(uv.y, uv.x) - t*.3;
    float segmentAngle = PI2 / segments;
    float wid = floor((angle + PI) / segmentAngle);
    float n = n21(vec2(wid, 3.2));
    vec3 color = vec3(n, fract(n*10.2), fract(n*123.33));
    if (vignete) {
        color = vec3(n, fract(n * 10.23) + sin(t + uv.y * 6.), fract(n* 123123.342) + cos(t + uv.x*6.1));
    }
    return color;
}

vec3 bars(vec2 uv) {
    vec3 color = vec3(0.);

    float bn = 10.;
    vec2 cuv = fract(uv * vec2(1., bn));
    vec2 id = floor(uv * vec2(1., bn));

    float n = n21(vec2(1.,id.y) + 43443.22);

    color += vec3(n, fract(n*43.32), fract(n * 4433.22));

    return color;
}

vec3 toruses(vec2 uv, float layer) {
    float scale = 10.;

    uv *= rot2d(iTime/3.);

    vec2 cuv = fract(uv * vec2(scale));
    vec2 id = floor(uv * vec2(scale));

    float n = n21(id + layer*100. + floor(iTime));
    float n1 = n21(id + layer*100. + floor(iTime) + 1.);

    vec2 center = vec2(0.5 + mix(n, n1, fract(iTime))*.6 - .3, .5 + mix(fract(n * 123.22), fract(n1 * 123.22), fract(iTime))*.6 - .3);

    float d = sdCircle(cuv, center, .0);

    // vec3 c4 = (1. - smoothstep(0., .05, abs(d - .3))) * vec3(0.9, .3, .1);
    vec3 c4 = pow(.06/d, 3.3) * vec3(1.);

    // c4 *= vec3(.9, .3, .1);
    c4 *= vec3(n, fract(n * 234.22), fract(n*43534.33));

    return c4;

}

vec3 background2(vec2 uv) {
    vec3 color = vec3(0.);

    float t = floor(iTime);//iTime * 0.;

    vec3 c1 = max(vec3(.0, .4, .6), wheelOfFortune(uv + vec2(sin(t)*.1, cos(t)*.1), 16., true));
    vec3 c2 = wheelOfFortune(uv - .5, 16., true);
    vec3 c3 = wheelOfFortune(uv + .5, 16., true);

    vec3 c4 = toruses(uv, 1.) + toruses(uv / 2., 2.) + toruses(uv * 2., 3.);
    c4 = vec3(0.);

    vec3 c5 = bars(uv*rot2d(t + uv.y*uv.x) + t*.1 + vec2(0., t*.1));

    color += (c1 * c2 / c3 + c5+c4) / 4.;

    // color = (mix(mix(c1, c2, .5), c3, .5) + c4 + c5) / 2.;

    return color;
}

vec3 background(vec2 uv) {
    vec3 color = vec3(0.);

    vec3 c1 = wheelOfFortune(uv * rot2d(iTime), 5., true);
    vec3 c2 = wheelOfFortune(uv + vec2(sin(iTime) * .1, cos(iTime*.3) * .1) * rot2d(-iTime), 15., true);
    vec3 c3 = wheelOfFortune(uv - vec2(sin(iTime*.6) * .2, cos(iTime) * .2) * rot2d(-iTime), 15., true);

    // color = max(c1,color);
    // color = max(c2, color);
    // color = max(c3, color);

    color = (c1 * c2 / c3) / 3.;

    // color /= 3.;

    return color;
}

vec3 background5(vec2 uv) {
    vec3 color = vec3(0.);
    vec3 c1 = wheelOfFortune(uv * rot2d(iTime), 6., true);

    float width = .5;

    float t = iTime;

    float sign = -1.;
    if (mod(floor(t), 2.) == 0.) {
        sign = 1.;
    }

    // vec2 shift = vec2(vec2(-width, mix(width * sign, width * sign * -1., max(0., fract(t) - .9)*7.6)));

    // vec2 shift = vec2(vec2(-width, mix(width * sign, width * sign * -1., max(0., fract(t) - .5)*2.)));

    vec2 shift = vec2(-.2);

    uv += shift;
    uv *= rot2d(iTime);
    uv -= shift;
    vec3 c2 = wheelOfFortune(uv + shift, 18., true);

    vec3 c3 = wheelOfFortune(uv + vec2(sin(iTime*.6) * .1, cos(iTime*.3) * .1) * rot2d(-iTime), 15., true);


    color += (c1 / c2 * c3) / 2.;

    return color;
}

vec3 background3(vec2 uv) {
    vec3 color = vec3(0.);

    vec3 c1 = wheelOfFortune(uv * rot2d(iTime), 5., true);
    vec3 c2 = wheelOfFortune(uv + vec2(sin(iTime) * .1, cos(iTime*.3) * .1) * rot2d(-iTime), 15., true);
    vec3 c3 = wheelOfFortune(uv - vec2(sin(iTime*.6) * .2, cos(iTime) * .2) * rot2d(-iTime), 15., true);

    // color = max(c1,color);
    // color = max(c2, color);
    // color = max(c3, color);

    vec3 c4 = bars(uv + vec2(100.)) + bars(uv*rot2d(PI));

    color = (c1 * c2 / c3 + c4) / 3.;

    // color /= 3.;

    return color;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {

    float _SegmentCount = 7.;//floor(n21(vec2(floor(iTime), 122.)) * 16.);// + sin(iTime);

    vec2 mouse = iMouse.xy/iResolution.xy;

    vec2 shiftUV = (fragCoord.xy-.5*iResolution.xy)/iResolution.y;

    // shiftUV *= rot2d(iTime*.8);


    float radius = sqrt(dot(shiftUV, shiftUV));
    float angle = atan(shiftUV.y, shiftUV.x) + mouse.x;

    float segmentAngle = PI2 / _SegmentCount;

    float wid = floor((angle + PI) / segmentAngle);

    angle -= segmentAngle * floor(angle / segmentAngle);

    angle = min(angle, segmentAngle - angle);

    vec2 uv = vec2(cos(angle), sin(angle)) * radius;// + sin(iTime) * 0.1;


    vec3 color = vec3(0.);

    color += background5(uv);
    // color += background5(shiftUV * rot2d(iTime * 0.));
    // color += background3(uv * rot2d(iTime*.3));
    // color += renderPlasmaOriginal(uv * rot2d(iTime)) *.3;
    // if (shiftUV.x > 0.) {
    //     color += background3(shiftUV * rot2d(iTime*.4));
    // } else {
    //     color += background3(uv * rot2d(iTime*.4));
    // }
    // color += renderPlasmaOriginal(shiftUV * rot2d(iTime));




    fragColor = vec4(color, 1.0);
}