#define  PI 3.1415

float t;

mat2 rot2d(float a) {
    return mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
}

float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    t = iTime;
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    float CELL_SIZE = .05;

    float stepSize = 2.;


    vec3 col = vec3(0.);

    vec2 guv = fract(uv*(1./CELL_SIZE));
    guv -= .5;
    col += step(max(guv.x, guv.y), .4)*max(.2, min(.3, n21(floor(uv*(1./CELL_SIZE)))));

    vec2 f = vec2(1., 0.);
    vec2 center = vec2(0.) + f*t/20.;


    float iteration = mod(t, 6.);
    float st = floor(iteration);

    float id = floor(t/6.);
    float subid = floor(mod(id, 3.));

    vec2 origin = vec2(id/(1./(CELL_SIZE*stepSize)));



    if (st == 0.) {
        f = vec2(1., 0.);
        center = vec2(0.);
    } else if (st == 1.) {
        f = vec2(0., -1);
        center = vec2(1., 0.);
    } else if (st == 2.) {
        f = vec2(-1., 0.);
        center = vec2(1., -1);
    } else if (st == 3.) {
        f = vec2(0., 1.);
        center = vec2(0., -1);
    } else if (st == 4.) {
        f = vec2(0., 1.);
        center = vec2(0., 0.);
    } else if (st == 5.) {
        f = vec2(1., 0.);
        center = vec2(0., 1);
    }

    // if (subid == 1.) {
    //     f = vec2(-1, 0.) * 3.;
    //     center = origin;
    // }

    // center *= -1.;
    // f *= -1.;

    center = origin + center * CELL_SIZE * stepSize;

    center += f*fract(t)*CELL_SIZE*stepSize;


    // f *= rot2d(floor(t/2.)*PI/8.);
    // f = vec2(t/10., 0.);

    float n = max(.2, n21(vec2(subid)));

    col += step(length(uv), .01) * vec3(1., 0.,0.);
    col += step(length(uv - center), .2*CELL_SIZE) * vec3(n, fract(n*123.43), fract(n*6785.4));


    fragColor = vec4(col, 1.);
}