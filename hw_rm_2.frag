#define t iTime*2.

float getDot(vec3 ro, vec3 rd, vec3 p) {
    float d = length(cross(rd, p - ro))/length(rd);
    return smoothstep(.01, 1., .02/d);
    // return 1. - smoothstep(.0, .1,  d);
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {

    vec2 uv = fragCoords / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec2 mouse = iMouse.xy / iResolution.xy * 3.14;

    vec3 col = vec3(0.);

    vec3 ro = vec3(3. * sin(mouse.x), cos(mouse.y)*3., -3. * cos(mouse.x)) + .5;
    vec3 lookat = vec3(0.5);
    float zoom = .5;

    vec3 f = normalize(ro - lookat);
    vec3 r = normalize(cross(vec3(0., 1., 0), f));
    vec3 u = cross(f, r);
    vec3 c = ro + f * zoom;
    vec3 i = c + uv.x*r + uv.y*u;

    vec3 rd = normalize(i - ro);

    float td = sin(t)*.5 + .5;

    col += getDot(ro, rd, mix(vec3(0., 0., 0.), vec3(0., 0., 1.), td));
    col += getDot(ro, rd, mix(vec3(0., 0., 1.), vec3(0., 0., 0.), td));
    col += getDot(ro, rd, mix(vec3(0., 1., 0.), vec3(0., 1., 1.), td));
    col += getDot(ro, rd, mix(vec3(0., 1., 1.), vec3(0., 1., 0.), td));
    col += getDot(ro, rd, mix(vec3(1., 0., 0.), vec3(1., 0., 1.), td));
    col += getDot(ro, rd, mix(vec3(1., 0., 1.), vec3(1., 0., 0.), td));
    col += getDot(ro, rd, mix(vec3(1., 1., 0.), vec3(1., 1., 1.), td));
    col += getDot(ro, rd, mix(vec3(1., 1., 1.), vec3(1., 1., 0.), td));

    col *= vec3(0.9, 0.4, .1);


    // col.rgb += rd.xyz;


    fragColor = vec4(col, 1.);
}