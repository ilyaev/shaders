#define PI 3.1415
#define PI2 PI * 2.;


float polarTriangle(vec2 uv, float r, float offset) {
    float a = atan(uv.x, uv.y) + offset;
    float b = 6.28 / 3.;
    float l = length(uv);

    float d = cos(a - floor(.5 + a/b) * b) * l;

    float col = 1. - step(r, d);
    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 col = vec3(0.);

    col.rg = fract(uv*13.);

    col *= polarTriangle(uv, .1, iTime);




    fragColor = vec4(col, 1.);
}