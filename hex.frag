float hexDist(vec2 uv) {
    uv = abs(uv);
    return max(uv.x, dot(uv, normalize(vec2(1., 1.73))));
}


vec4 hexCoords(vec2 uv) {
    vec2 r = vec2(1., 1.73);
    vec2 h = r * .5;

    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;

    vec2 gv;

    if (length(a) < length(b)) {
        gv = a;
    } else {
        gv = b;
    }

    float x = atan(gv.x, gv.y);
    float y = .5 - hexDist(gv);

    vec2 id = uv - gv;

    return vec4(x, y, id.xy);
}


void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 col = vec3(0.);

    uv *= 25.;

    float a = 0.;//iTime;//*mod(uv.x+uv.y, .1) + iTime*iTime;

    vec4 hex = hexCoords(uv*mat2(vec2(sin(a), cos(a)), vec2(-cos(a),sin(a))));

    float cd = distance(hex.zw, vec2(0.));
    // cd = mod(cd, (sin(iTime) + .5)*6. + 6.5);
    cd = mod(cd, 3.4);

    float hc = smoothstep(0., .05, hex.y);

    col += hc * (1. - step(3.5, cd));
    col -= hc * (1. - step(2.5, cd));



    // uv *= 5.;

    // vec2 r = vec2(1., 1.73);
    // vec2 h = r * .5;

    // vec2 a = mod(uv, r) - h;
    // vec2 b = mod(uv-h, r) - h;

    // vec2 gv;

    // if (length(a) < length(b)) {
    //     gv  = a;
    // } else {
    //     gv = b;
    // }

    // float d = hexDist(gv);

    // col += d;
    // col += step(d, .4)/3.;


    fragColor = vec4(col, 1.);


}