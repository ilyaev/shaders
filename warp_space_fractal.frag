precision mediump float;
#define PI 3.14159265359
#define MAX_TRACE_STEPS 256
#define FAR_DISTANCE 5.
#define MAX_OBJECTS 8
#define NUM_ITERATIONS 5

vec2 N(float angle) {
    return vec2(sin(angle), cos(angle));
}

mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

vec3 genText(vec2 uv) {
    uv *= 0.1;// + sin(iTime*3.) * 0.05;
    uv = vec2(atan(uv.x,uv.y), length(uv));
    vec2 cell = floor(uv);
    if (mod(cell.x + cell.y, 2.) == 0.) {
        return vec3(0.);
    }
    return vec3(1.);
    // return vec3(smoothstep(uv.y, uv.y-0.1, sin(uv.x)));
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    vec2 mouse = iMouse.xy/iResolution.xy;
    vec3 col = vec3(0.);
    uv *= rotate2d(iTime/3.);
    uv *= 1.2;

    uv.x = abs(uv.x);
    uv.y += tan((5./6.)*3.1415)*.5;

    vec2 n = N((5./6.) * 3.1415);
    uv -= n*max(0., dot(uv - vec2(.5, 0.),n))*2.;

    float angle = (2./3.) * 3.14;// + iTime;
    n = N(angle);

    uv.x += .5;
    float scale = 1.;
    for(int i = 0 ; i < NUM_ITERATIONS ; i++) {
        uv *= 3.;
        scale *= 3.;
        uv.x -= 1.5;

        uv.x = abs(uv.x);
        uv.x -= .5;
        uv -= n*min(0., dot(uv, n))*2.;
    }



    float d = length(uv - vec2(clamp(uv.x, -1., 1.), 0.));
    col += smoothstep(1./iResolution.y, .0, d/scale);
    // col.rg += uv/scale;
    col += genText(uv + iTime*13.);

    fragColor = vec4(col, 1.0) ;
}