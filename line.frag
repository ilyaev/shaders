precision mediump float;
#define PI 3.14159265359
#define MAX_TRACE_STEPS 256
#define FAR_DISTANCE 5.
#define MAX_OBJECTS 8

mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

// rectangle float d = distance(uv, vec2(clamp(-1., 1., uv.x), clamp(-1.,1., uv.y)));

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    vec2 mouse = iMouse.xy/iResolution.xy;
    uv *= 3.;
    vec3 col = vec3(0.);

    float angle = mouse.x * 3.14; //3.13 + sin(iTime)*.03; //
    vec2 n = vec2(sin(angle), cos(angle));
    // float d = dot(uv, n) + sin(uv.x*4. + iTime)*0.5 + cos(uv.x*2. + iTime*5.)*0.5;// + sin(uv.y*(sin(iTime)*200.) + iTime/100.) * 1.5;
    // uv *= rotate2d(iTime);
    uv *= vec2(2.,uv.y);
    float d = distance(uv, vec2(clamp(-1., 1., uv.x), clamp(-1.,1., uv.y)));
    // d *= .1;

    // col += step(0.,d);
    // col += d;
    // col += 1. - step(0.1, d);

    col += smoothstep(0.01, 0., abs(d));



    // uv.x = abs(uv.x);
    // uv.x -= .5;

    // float d = length(uv - vec2(clamp(uv.x, -1., 1.), 0.));

    // col += smoothstep(.03, .0, d);

    // col.rg = uv;

    fragColor = vec4(col, 1.0) ;
}