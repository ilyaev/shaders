#define PARTICLES 50

float n21(vec2 p) {
    return fract(sin(p.x*123.456 + p.y*5678.43)*57853.22);
}


void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    // float size = 15.;
    // vec2 id = floor(uv * size);
    // uv = fract(uv * size) - .5;

    // float  r = sin(iTime)*.01;

    // float v0 = 0.;

    // // uv *= mat2(vec2(sin(r), cos(r)), vec2(-cos(r), sin(r)));

    float scale = 5.;

    uv *= scale;


    vec3 col = vec3(0.);

    // // vec2 p = vec2(-.5 + (sin(iTime)*.5 + .5), 0.)


    // float t = mod(iTime/3., 1.44);

    // float a = 9.8 - t * 9.;

    // vec2 gv = vec2(0., -1.);

    // vec2 p = vec2(0., .5);
    // vec2 sp = p;

    // float s = v0 + (a * t * t) / 2.;

    // s = mod(s, 1.);

    // p += gv * s;

    for(int i = 0 ; i < PARTICLES ; i++) {
        vec2 p = vec2(0. + sin(iTime), 0. + cos(iTime));
        vec2 sp = p;

        vec2 a = vec2(0., -9.8);

        float timeScale = 1.;

        float tt = iTime + n21(vec2(float(i*100)))*.1;

        float id = floor(tt / timeScale);
        float n = n21(vec2(id,float(i)));
        float t = fract(tt / timeScale);// - .1*fract(n*1234.443);


        vec2 v0 = vec2((n-.5)*13., (fract(n*123.) - .5) * 15.);


        vec2 s = v0*t + (a * t * t) / 2.;

        p += s;


        float d = length(uv - p);

        if (t > 0.) {
            float fade = (1.3 - length(p - sp)/scale);
            vec3 c = vec3(smoothstep(.1, .0, d));
            col += c * fade;
        }
    }


    fragColor = vec4(col, 1.);
}