precision mediump float;
#define PI 3.14159265359



float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {


    float zoom = 1.;

    float CELLS = 200.;
    vec2 CENTER = vec2(CELLS/2., CELLS/2.);
    float minValue = -1.5 / zoom;//iTime/-30.;
    float maxValue = 1.5 / zoom;//iTime/30.;


    float ratio = iResolution.x / iResolution.y;
    vec2 guv = CELLS * fragCoord.xy / iResolution.xy;

    guv.x *= ratio;

    // int maxIterations = 70 + int(floor(sin(iTime*13. + 2. * (CELLS/2. - guv.x)/(CELLS/2. - guv.y))*50.));


    // guv -= vec2(CELLS/2.);
    // guv = scale(vec2(1./2.,1./2.)) * guv;
    // guv = rotate2d(sin(iTime)) * guv;
    // guv += vec2(CELLS/2.);


    vec2 cell = floor(guv);
    vec2 uv = fract(guv);

    int maxIterations = 100;//10 + int(floor(distance(cell, CENTER)))/4;

    vec3 color = vec3(0.);

    float a = map(cell.x, 0., CELLS, minValue, maxValue);
    float b = map(cell.y, 0., CELLS, minValue, maxValue);

    float ca = a;
    float cb = b;

    ca = - 0.70176;
    cb = - 0.3842;

    // ca = 0.285;
    // cb = 0.01;

    // ca = -0.835;
    // cb = -0.2321;

    // ca = 0.;
    // cb = -0.8;

    int n = 0;
    float z = 0.;

    while (n < maxIterations) {

        float aa = a * a - b * b;
        float bb = 2. * a * b;

        a = aa + ca;
        b = bb + cb;

        // abs(a+b) > 16.
        if ((aa*aa + bb*bb) > 16.) {
            break;
        }

        n += 1;
    }

    float bright = map(float(n), 0., float(maxIterations), 0., 1.);
    bright = sqrt(bright);

    if (n == maxIterations) {
        bright = 0.;
    }


    fragColor = vec4(color + vec3(bright), 1.0);
    // fragColor = vec4(color + vec3(clamp(0.,.4,bright)), 1.0);

}