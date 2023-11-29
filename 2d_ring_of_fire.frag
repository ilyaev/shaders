#define SPEED .4


float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}

float line(vec2 U, vec2 A, vec2 B)
{
	vec2 UA = U - A;
    vec2 BA = (B - A);

    float s = dot(UA, BA) / length(BA);
    s = s / length(BA);
    s = clamp(s, 0., 1.);
    return length(UA - s*BA);
}


vec3 renderRing(vec2 uv) {
    vec3 col = vec3(.0);
    // uv.x = abs(uv.x);
    // uv = abs(uv);
    float aOne = (atan(uv.x, uv.y) + 3.14) / 6.28;

    float a = atan(uv.x, uv.y);



    float d = abs(length(uv) - .45);

    // col += step(d, .05);
    // col += pow((.02*sin(a*2.))/d, 1.3*abs(sin(a + 2.3)));

    // float id = floor(a * 68.);
    col += pow((.06 * sin(a/2.))/d, 1.3) * vec3(.9, .3, .1);

    // col += pow((.014 * abs(sin(a*34.)))/d, 2.4);// * vec3(abs(sin(id/2.), abs(cos(id/2.), abs(sin(id/2.)))));

    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv =  (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);
    vec3 col = renderRing(uv);

    fragColor = vec4(col, 1.0);
}