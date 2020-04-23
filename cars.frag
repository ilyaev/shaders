float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    float cellSize = .05;

    float t = iTime/2.;
    float baseSpacing = cellSize * 2.;

    vec3 col = vec3(0.);

    vec2 rc1 = vec2(baseSpacing*4., baseSpacing);

    vec2 id = round(uv/rc1);

    float n = max(.5, n21(vec2(id.y))) * 3.;

    if (mod(id.y, 2.) == 0.) {
        uv.x += t*n;
    } else {
        uv.x -= t*n;
    }

    id = round(uv/rc1);

    vec2 qv = uv - rc1 * id;

    // col.rg = qv;//*(1./cellSize);

    float n1 = n21(id);

    vec2 shift = (vec2(0.,fract(n1*123.45))-.5) * cellSize;

    float d = length(qv + shift + vec2(sin(t*10.*n1)*baseSpacing*2.*.9, 0.));


    col += step(d, cellSize*.2);

    if (qv.x > cellSize*.98*4. || qv.y > cellSize *.95) {
        // col.r = 1.;
    }


    fragColor = vec4(col, 1.);

}