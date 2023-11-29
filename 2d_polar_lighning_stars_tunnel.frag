#define TUNNEL_SPEED .4


float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}

vec3 renderPlasma(vec2 uv) {
    for(float i = 1.0; i < 3.0; i++){
        uv.x += .6 / i * cos(i * 2.5* uv.y + iTime);
        uv.y += 0.6 / i * cos(i * 3.5 * uv.y + iTime);
    }
    // uv.x -= iTime/100.;
    vec3 col = .5 + 0.5*sin(iTime*5. + uv.yyy + vec3(iTime,2. + iTime,4. + iTime));
    // return col/(2.1*abs(cos(iTime-uv.x)));

    float nums = 1. + floor(n21(vec2(floor(iTime), 43))*5.);

    return col/(2.1*abs(cos(uv.x * nums)));
}

vec3 renderField(vec2 uv, float index) {
    vec3 col = vec3(.0);

    vec2 ouv = uv;
    float l = pow(TUNNEL_SPEED/length(uv), .30);
    float a = atan(uv.x, uv.y);

    float warp = iTime / 3.;


    vec2 uv1 = vec2(a - sin(abs(uv.x*uv.y)/58.), l + warp);
    vec2 uv2 = vec2(a - abs(uv.y/30.)*sin(iTime*5.)*cos(iTime*3. + uv.x/2.), l + warp);
    vec2 uv3 = vec2(a, l + warp + uv.x*uv.y/10.);
    vec2 uv4 = vec2(a, l + warp);

    // uv = uv1;

    vec2 fromUV = uv1;
    vec2 toUV = uv2;

    float un = n21(vec2(floor(iTime), 2.21));
    float un1 = n21(vec2(floor(iTime) + 1., 2.21));

    if (un < .5) {
        fromUV = uv3;
    } else {
        fromUV = uv4;
    }

    if (un1 < .5) {
        toUV = uv3;
    } else {
        toUV = uv4;
    }

    uv = mix(fromUV, toUV, fract(iTime));

    ouv = uv;

    vec2 cells = vec2(10., 10.);

    uv *= cells;

    vec2 id = floor(uv);
    uv = fract(uv);

    float n = n21(id + index * 100.);
    float n1 = fract(n*123.543 + index * 2.);
    float n2 = fract(n*4435.332 + index * 4.);

    if (index == 2.) {
        col.rgb = renderPlasma(ouv/2.)*l/15.; //*smoothstep(0.3, .9, ouv.x);
    }

    if ((n + n1) < .5) {
        // return col.rgb + vec3(sin (iTime + a)*.1, 0., 0.);
    }

    if ((n + n1) > 1.5) {
        // return col.rgb + vec3(0., sin(iTime - a )*.1, 0.);
    }

    float star = step(uv.x, n) - step(uv.x, n-.05);
    star *= step(uv.y, n1) - step(uv.y, n1-(.3*n2));

    col.rgb += vec3(star) * (1. - l/2.);
    // col.rgb = vec3(step(length(uv - vec2(n1,n2)), .1*n2)) * .4;



    return col;
}

vec3 renderTunnelTexture(vec2 uv) {

    // uv.y += sin(iTime)*.02;
    // uv.x += cos(iTime/2.)*.05;

    vec3 col = vec3(0.);
    col.rgb =
        renderField(uv, 0.)
        + renderField(uv*13., 1.)
        + renderField(uv/3., 2.);

    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;


    vec2 ouv = uv;
    vec3 col = vec3(.0);

    col.rgb = renderTunnelTexture(uv);

    col.rgb *= smoothstep(.0, .1, length(ouv));

    fragColor = vec4(col, 1.);
}