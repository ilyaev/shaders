precision mediump float;

float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y;
    vec3 col = vec3(0.);

    vec2 cells = vec2(15.);// vec2(50. + sin(iTime + uv.x)*30.);

    vec2 ouv = uv;

    vec2 id = floor(uv * cells);
    uv = fract(uv * cells) - .5;

    vec2 gUV = uv;

    float width = .1;// * abs(sin(ouv.y+ouv.x + .5 + iTime));

    float n = n21(id + 4.);

    if (n < .5) {
        gUV.x *= -1.;
    }


    vec2 cUV = gUV - .5 * sign(gUV.x + gUV.y + .001);
    float d = length(cUV);

    float mask = smoothstep(0.01, .0, abs(d - .5) - width);

    float angle = atan(cUV.x, cUV.y);
    float x = fract(angle / 1.57);
    float y = (d - (.5 - width)) / (2. * width);
    y = abs(y - .5) * 2.;

    vec2 tUV = vec2(x, y);

    // col += mask * y;
    col.rg = mask * tUV;

    fragColor = vec4(col, 1.);

}


// void mainImageLine( out vec4 fragColor, in vec2 fragCoord )
// {

//     vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y;
//     vec3 col = vec3(.0);

//     vec2 cells = vec2(10.);

//     vec2 ouv = uv;

//     vec2 id = floor(uv * cells);
//     uv = fract(uv * cells) - .5;

//     float width = .2;

//     vec2 gUV = uv;

//     float n = n21(id + 1.);

//     if (n > .5) {
//         gUV.x *= -1.;
//     }

//     float d = abs(abs(gUV.x + gUV.y) - .5);
//     float mask = smoothstep(.01, .0, d - width);


//     col += mask * .3;

//     fragColor = vec4(col, 1.);

// }