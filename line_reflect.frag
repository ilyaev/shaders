precision mediump float;
#define PI 3.14159265359
#define MAX_TRACE_STEPS 256
#define FAR_DISTANCE 5.
#define MAX_OBJECTS 8

mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    vec2 mouse = iMouse.xy/iResolution.xy;
    uv *= 3.;
    vec3 col = vec3(0.);

    float angle = mouse.x * 3.14;
    vec2 n = vec2(sin(angle), cos(angle));

    float d = dot(uv, n);


    uv -= n*min(0.,d)*2.;

    col += smoothstep(0.01, 0., abs(d));

    col.rg += sin(uv*10.);



    // uv.x = abs(uv.x);
    // uv.x -= .5;

    // float d = length(uv - vec2(clamp(uv.x, -1., 1.), 0.));

    // col += smoothstep(.03, .0, d);

    // col.rg = uv;

    fragColor = vec4(col, 1.0) ;
}