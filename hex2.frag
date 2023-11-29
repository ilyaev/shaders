float hexDistance(vec2 uv) {
    uv = abs(uv);
    return max(uv.x, dot(uv, normalize(vec2(1., 1.73))));
}

vec4 hexCoords(vec2 uv) {

    vec2 gv;

    vec2 r = vec2(1., 1.73);
    vec2 h = r * .5;

    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;

    if (length(a) < length(b)) {
        gv = a;
    } else {
        gv = b;
    }

    vec2 id = uv - gv;


    float x = 0.;
    float y = .5 - hexDistance(gv);

    return vec4(x, y, id);
}


void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;


    vec3 col = vec3(0.);

    uv *= 10.;

    vec4 hex = hexCoords(uv);

    col.rg = hex.zw / 2.;
    col.b = pow(.03/hex.y, 1.1);

    // float d = hexDistance(uv);

    // col += step(d, .2);

    // col += pow(.2/smoothstep(.0, .3, d), 1.3) * abs(sin(vec3(0.9, .3, .1) + iTime));

    // col += .2/((1. - step(d, 0.2))*smoothstep(0., .6, d)) * vec3(0.9, .3, .1);

    // float a = 3.14/4. + iTime;
    // float d1 = hexDistance(uv * mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a))));

    // col = col * .75 + pow(.2/smoothstep(.0, .3, d1), 1.3) * abs(sin(vec3(0.1, .9, .8) + iTime)) * .25;


    fragColor = vec4(col, 1.);
}