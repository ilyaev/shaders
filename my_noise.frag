precision mediump float;
#define PI 3.14159265359

float N21(vec2 p) {
    return fract(sin(p.x*100.23 + p.y*1340.43) * 5642.);
}

float SmoothNoise(vec2 uv) {
    uv += vec2(sin(iTime) * 2., cos(iTime/2.)/2.);
    float a = sin(iTime/5.)*3.14;
    uv *= mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));

    vec2 lv = smoothstep(0., 1.,fract(uv));
    vec2 id = floor(uv);

    float bl = N21(id);
    float br = N21(id + vec2(1., 0.));
    float b = mix(bl, br, lv.x);

    float tl = N21(id + vec2(0., 1.));
    float tr = N21(id + vec2(1., 1.));
    float t = mix(tl, tr, lv.x);

    float c = mix(b,t, lv.y);
    return c;
}

float fbm(vec2 uv) {
    float c = SmoothNoise(uv*4.);
    c += SmoothNoise(uv*8.) * .5;
    c += SmoothNoise(uv*16.) * .25;
    c += SmoothNoise(uv*32.) * .125;
    c += SmoothNoise(uv*64.) * .0625;
    return c / 2.;
}

vec3 noiseWave(vec2 uv) {
    // uv += vec2(sin(iTime) * 2., cos(iTime/2.)/2.);
    float c = fbm(uv + fbm(uv + fbm(uv)));// + iTime/10.));
    return vec3(c);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec3 color = vec3(0.);
    vec2 uv = fragCoord/iResolution.xy;

    uv -= .5 + sin(iTime/4.)*.5;

    color = noiseWave(uv);

    // color.rg = id * .1;

    fragColor.rgb = color;
}