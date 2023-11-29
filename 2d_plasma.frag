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

vec3 renderPlasma(vec2 uv) {
    for(float i = 1.0; i < 2.0; i++){
        uv.x += 0.6 / i * cos(i * 2.5* uv.y + iTime);
        uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
    }
    uv.x = abs(uv.x);
    uv.y = abs(uv.y);
    vec3 col = 0.5 + 0.5*sin(iTime+uv.xyx+vec3(0,2,4));
    return col/(2.1*abs(cos(iTime-uv.y-uv.x)));
}

vec3 renderPlasmaOriginal(vec2 uv) {
    for(float i = 1.0; i < 10.0; i++){
        uv.x += 0.6 / i * cos(i * 2.5* uv.y + iTime);
        uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
    }
    vec3 col = 0.5 + 0.5*sin(iTime+uv.xyx+vec3(0,2,4));
    return col/(2.1*abs(cos(iTime-uv.y-uv.x)));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv =  (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    vec3 col = renderPlasma(uv);

    fragColor = vec4(col, 1.0);
}