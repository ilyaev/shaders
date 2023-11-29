
float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec3 col = vec3(.0);
    vec2 cells = vec2(10., 10.);


    float l = length(uv);
    float a = atan(uv.x, uv.y);

    // uv = vec2(l, a);

    vec2 id = floor(uv * cells);
    uv = fract(uv * cells);

    vec2 gv = fract(uv) - .5;




    float n = n21(id + floor(iTime)*100.);

    if (n < .5) {
        gv.y *= -1.;
    }

    // float mask = abs(gv.x + gv.y);
    float width = .05;
    // float d = abs(gv.x + gv.y);
    float d = abs(abs(gv.x + gv.y) - .5);
    float mask = smoothstep(.01, -.01, d - width );

    col += mask;

    fragColor = vec4(col, 1.);
}