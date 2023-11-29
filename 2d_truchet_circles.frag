
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




    float n = n21(id);

    if (n < .5) {
        gv.y *= -1.;
    }

    vec2 cUV = gv - .5 * sign(gv.x + gv.y + 0.001);

    float width = .05;
    float d = length(cUV) - .5;
    float mask = smoothstep(.01, -.01, abs(d) - width);

    float angle = atan(cUV.x, cUV.y);
    float checker = mod(id.x + id.y, 2.) * 2. - 1.;
    float flow = 1.;//sin(iTime + checker * angle * 10.);
    col += mask * flow;

    // col += checker;

    fragColor = vec4(col, 1.);
}