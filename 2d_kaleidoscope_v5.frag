#iChannel0 "file://blue_noise.png"

precision mediump float;
#define PI 3.14159265359
#define PI2 6.28309265359
#define TUNNEL_SPEED .4


float noise(vec2 x){
    vec2 f = fract(x);
    vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
    vec2 du = 30.0*f*f*(f*(f-2.0)+1.0);

    vec2 p = floor(x);
	float a = texture(iChannel0, (p+vec2(0.0, 0.0))/1024.0).x;
	float b = texture(iChannel0, (p+vec2(1.0,0.0))/1024.0).x;
	float c = texture(iChannel0, (p+vec2(0.0,1.0))/1024.0).x;
	float d = texture(iChannel0, (p+vec2(1.0,1.0))/1024.0).x;


	return a+(b-a)*u.x+(c-a)*u.y+(a-b-c+d)*u.x*u.y;
}

float fbm(vec2 x, int detail){
    float a = 0.0;
    float b = 1.0;
    float t = 0.0;
    for(int i = 0; i < detail; i++){
        float n = noise(x);
        a += b*n;
        t += b;
        b *= 0.7;
        x *= 2.0;

    }
    return a/t;
}

float fbm2(vec2 x, int detail){
    float a = 0.0;
    float b = 1.0;
    float t = 0.0;
    for(int i = 0; i < detail; i++){
        float n = noise(x);
        a += b*n;
        t += b;
        b *= 0.9;
        x *= 2.0;

    }
    return a/t;
}


float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}

float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
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

vec3 background(vec2 uv) {
        uv += vec2(0.);

    // float c = 1. - step(.1, length(uv));
    // float c1 = 1. - step(.09, length(uv));

    // vec3 co = c * vec3(.9, 0., 0.);
    // if (c1 > 0.) {
    //     co = c1 * vec3(.0, .9, .3);
    // }

    // return co;

    // float d = 1. - step(.05, abs(length(uv) - .45)); // band
    float d = 1. - step(.5, length(uv));
    // d = pow(.05/abs(length(uv) - .45), 1.3);
    float a = atan(uv.x, uv.y) + PI;

    float segments = 18.;
    float sector = floor(segments * (a/PI2));


    vec3 color = vec3(0.);

    if (a < PI) {
        color = vec3(.9, .2, .1) * d;
    } else {
        color =vec3(.5, .6, .2) * d;
    }



    float box = sdBox(abs(uv * rot2d(PI/3.3)), vec2(.3, .5));
    if (a < PI/2. || (a > PI && a < PI + PI/2.)) {
        float d = (1. - step(.0, box));
        if (d > 0.) {
            color = d * vec3(.0, .4, .9);
        }
        color -= (1. - step(.0, abs(box) - .005)) * vec3(2.);
    }

    float box2 = sdBox(abs(uv * rot2d(-PI/5.)), vec2(.3, .5));
    float d1 = (1. - step(.0, box2));
    if ( a < PI && a > PI/2.) {
        if (d1 > 0.) {
            color = d1 * vec3(.5, .6, .2);
        }
        color -= (1. - step(.0, abs(box2) - .005)) * vec3(2.);

    }

    if ( a > PI + PI/2. ) {
        if (d1 > 0.) {
            color = d1 * vec3(.9, .2, .1);
        }
        color -= (1. - step(.0, abs(box2) - .005)) * vec3(2.);
    }


    color *= step(.005, abs(uv.x));
    color *= step(.005, abs(uv.y));


    return max(vec3(0.), color / abs(sin(uv.y*(13. + cos(iTime)*5.) + iTime + cos(uv.x*(20. + sin(iTime)*5. + sin(uv.y*12.)*4.) + iTime*2.)))*.48);
}

vec3 clouds(vec2 uv, int detail, float dist, vec3 color) {
    vec3 col = vec3(0.); // SKY

    // clouds ///////////////////////////////////////////////////////
    float midlevel;
    float h;
    float disp;
    // float dist;
    float t = iTime*4.0;
    vec2 uv2;

    // c1
    midlevel = .05;// + sin(iTime) * .1;
    disp = 5.0;
    // dist = 10.0;
    uv2 = uv + vec2(t/dist + 3.5, 0.0);
    h = (fbm(uv2, 5) - 0.5)*(10. + sin(iTime)*5.);
    if(uv.y < h + midlevel) col = color;
    // if(uv.y < h + midlevel - 0.2 + sin(iTime) * .1) col = vec3(0.92, 0.85, 0.82);
    return col;// * clamp(vec3(0.), vec3(1.) ,vec3(sin(iTime + uv.x), cos(iTime*2. + uv.y * 2.), sin(iTime/2. + uv.x * 3.)));
}


vec3 bgClouds(vec2 uv) {
    vec3 col = vec3(0.);

    col += clouds(uv, 8, -10., vec3(.3, 0.94, 0.91));
    col += clouds(uv*rot2d(-PI/4.), 5, -5., vec3(.9, 0.3, 0.1));

    return clamp(vec3(0.), vec3(1.), col);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    float n = n21(vec2(floor(iTime)));
    float n1 = n21(vec2(floor(iTime) + 1.));
    float nn = mix(n, n1, fract(iTime));

    float _SegmentCount = 7.;

    vec2 mouse = iMouse.xy/iResolution.xy;

    vec2 shiftUV = (fragCoord.xy-.5*iResolution.xy)/iResolution.y;

    // shiftUV *= rot2d((nn - .5) * PI/2.);

    // shiftUV *= rot2d(iTime*.8);// + pow(abs(shiftUV.y)*sin(iTime*3.), 1.4));


    float radius = sqrt(dot(shiftUV, shiftUV));
    float angle = atan(shiftUV.y, shiftUV.x) + mouse.x;

    float segmentAngle = PI2 / _SegmentCount;

    float wid = floor((angle + PI) / segmentAngle);

    angle -= segmentAngle * floor(angle / segmentAngle);

    angle = min(angle, segmentAngle - angle);

    vec2 uv = vec2(cos(angle), sin(angle)) * radius;// + sin(iTime) * 0.1;


    vec3 color = vec3(0.);

    // color += clouds(uv);


    // color += background((uv/1.4 + vec2(sin(iTime - uv.y*(3. + nn))*.08, cos(iTime + uv.x)*.05)) * rot2d(iTime*.3 + uv.x*sin(iTime + uv.y/4. + uv.x*4.) * 4.*nn));
    // color += renderPlasmaOriginal(uv * rot2d(iTime*.2 + nn) + vec2(sin(iTime + uv.x - nn * 2.), cos(iTime + uv.y))*(.2 + nn *.1)) *.3;
    if (shiftUV.x > 0.) {
        color += bgClouds(shiftUV);
        // color += background(shiftUV/1.4 * rot2d(iTime*.4));
        // color += step(0.01, length(color)) * renderPlasmaOriginal(shiftUV * rot2d(iTime))/3.;
    } else {
        color += bgClouds(uv);
        // color += background(uv/1.4 * rot2d(iTime*.4));
        // color += step(0.01, length(color)) * renderPlasmaOriginal(uv * rot2d(iTime))/3.;
    }
    // color += step(0.01, length(color)) * renderPlasmaOriginal(uv * rot2d(iTime))/3.;




    fragColor = vec4(color, 1.0);
}