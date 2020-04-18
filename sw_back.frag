#define MOUNTAIN_COLOR vec3(0.54, 0.11, 1.)
#define COLOR_PURPLE vec3(0.81, 0.19, 0.78)
#define COLOR_LIGHT vec3(0.14, 0.91, 0.98)
#define COLOR_SUN vec3(1., 0.56, 0.098)
#define tri(t, scale, shift) ( abs(t * 2. - 1.) - shift ) * (scale)

mat2 rot2d(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(vec2(c,-s), vec2(s,c));
}

float N21(vec2 p) {
    return fract(sin(p.x*223.32+p.y*5677.)*4332.23);
}

vec3 getBackground(vec2 uv) {
    float set = 0. - sin(iTime/3.);

    float sunDist = length(uv + vec2(0., -2.5 - set));
    float sun = 1. - smoothstep(2.35, 2.5, sunDist);

    float gradient = sin(uv.y/4. - 3.14/32. + set/3.)*2.;
    float bands = abs(sin(uv.y * 8. + iTime*2.)) * (1. - step(2.5 + set, uv.y));

    float skyTop = 2.12/distance(uv, vec2(uv.x, 9.5));
    float skyBottom = 1.12/distance(uv, vec2(uv.x, -1.5));


    // sun
    vec3 result = vec3(sun * gradient * (bands > 0. ? bands : 1.)) * COLOR_SUN;

    //glow
    float glow = smoothstep(.1, .5, (1.1)/sunDist) + clamp(-1., 1., set);
    // result += glow * COLOR_PURPLE;

    // sky
    result += min(glow * COLOR_PURPLE, ((skyTop * MOUNTAIN_COLOR) + (skyBottom * COLOR_PURPLE))*(1. + set));

    if (sun < .5) {
        // stars
        vec2 nuv = uv*2.;// + vec2(iTime, 0.);
        vec2 rize = vec2(-10., 12.);
        nuv -= rize;
        nuv *= rot2d(mod(-iTime/15., 6.28));
        nuv += rize;
        uv = fract(nuv);
        vec2 id = floor(nuv);
        uv -= .5;

        float n = N21(id);
        uv.x += fract(n*100.32) - .5;
        uv.y += fract(n*11323.432) - .5;

        float star = smoothstep(.5, 1., (0.03 + (0.02 * (fract(n*353.32) - .5)))/length(uv));

        result += star * step(.8, n);
    }

    return result;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 col = vec3(0.);

    // uv.x = uv.y >= 0. ? uv.x : uv.x *.5;
    // uv.y = uv.y >= 0. ? uv.y : abs(uv.y)*.5;

    if (uv.y > .0 ) {
        col = getBackground(uv*20. + vec2(0., -1.));
    }

    fragColor = vec4(col, 1.);
}