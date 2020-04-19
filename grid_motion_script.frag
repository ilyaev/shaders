#define PI 3.1415
#define CELL_SIZE .05

float t;

mat2 rot2d(float a) {
    return mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
}

float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

vec2 getIterationPosition(float iteration) {
    if (iteration == 0.) {
        return vec2(0.);
    }
    float n = n21(vec2(iteration));

    float m = 10.;
    return round(vec2((n - .5) * m, (fract(n*113.43) - .5) * m));
}


vec2 cameraNextPosition() {
    t = iTime;

    vec2 center = vec2(.0);

    float iterationDuration = 1.;

    float iteration = floor(t / iterationDuration) + 1.;
    float stepSize = 1.;

    vec2 prevPosition = getIterationPosition(iteration - 1.)*CELL_SIZE*stepSize;
    vec2 nextPosition = getIterationPosition(iteration)*CELL_SIZE*stepSize;


    float iterationTime = mod(t, iterationDuration) / iterationDuration;

    float iterationSteps = 2.;
    float stepDuration = iterationDuration / iterationSteps;
    float iterationStep = floor(iterationTime / stepDuration) + 1.;

    float iterationStepTime = mod(iterationTime, stepDuration) / stepDuration;

    vec2 f = (nextPosition - prevPosition) * vec2(iterationStepTime);

    if (iterationStep == 1.) {
        f.y = 0.;
    } else if (iterationStep == 2.) {
        prevPosition.x = nextPosition.x;
        f.x = 0.;
    }


    center = prevPosition + f;

    return center;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    t = iTime;
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 col = vec3(0.);

    vec2 guv = fract(uv*(1./CELL_SIZE));
    guv -= .5;
    col += step(max(guv.x, guv.y), .4)*max(.2, min(.3, n21(floor(uv*(1./CELL_SIZE)))));

    vec2 center = cameraNextPosition();

    col += step(length(uv), .01) * vec3(1., 0.,0.);
    col += step(length(uv - center), .2*CELL_SIZE) * .9;



    fragColor = vec4(col, 1.);
}