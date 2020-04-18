precision mediump float;
#define PI 3.14159265359
#define MAX_TRACE_STEPS 256
#define FAR_DISTANCE 5.
#define MAX_OBJECTS 8

mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float smin( float a, float b)
{
    // return min(a,b);
    float k = .2;
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy / .5 - 1.;
    uv.x *= iResolution.x / iResolution.y;
    // vec2 uv = (fragCoord.xy - 0.5*iResolution.xy) / iResolution.y;

    vec2 duv = uv;

    vec3 color = vec3(.1);


    float l = length(uv);
    float a = atan(uv.x, uv.y);

    vec2 st = vec2(a, l);

    float wobble = 0.;//st.y/12.;
    float rotSpeed = iTime/12.;

    uv = vec2(st.x/6.28 + 0.5 + (wobble * sin(iTime*3.)) + rotSpeed, st.y);
    // uv.x *= 5.;

    vec2 cell = ceil(uv * vec2(10., 10.) + vec2(iTime));

    // float d = -1.;
    // if (mod(cell.y, 2.) == 0. ) {
    //     d = 1.;
    // }

    // d = pow(.3 * (cell.y + 1.), 3.) * d;

    // cell = ceil(uv * vec2(10. + cell.y*5., 10.) + vec2(iTime * d, 0.));

    color = vec3(mod(cell.x+cell.y, 2.) == 0. ? 1. : 0.) * (1.0 - step(0.6, uv.y));

    float leafTwist = 0.;//sin(uv.y*3.);


    float x = uv.x * PI * 2. + leafTwist;
    float y = uv.y * 3. - 1.;
    float lenShift = sin(x+iTime*4.);

    float m = min(fract(x), fract(abs(fract(sin(iTime))) - x));

    color = vec3(smoothstep(0., .1, m * .5 + .2 - y));

    color = vec3(step(y,sin(x * 8.)*cos(y/2.+iTime)));
    // color = vec3(step(y + lenShift,sin(x * 8.)));

    // color *= vec3(step(0.,distance(duv, vec2(0.)) - 0.2));

    // if (uv.y > 0.5) {
    //     color = vec3(0.);
    // }


    fragColor = vec4(color, 1.0) ;
}