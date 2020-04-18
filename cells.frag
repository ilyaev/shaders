precision mediump float;
#define PI 3.14159265359






float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

vec3 getBlob(vec2 center, vec2 cell, float radius, float glow) {
    float d = distance(cell, center);
    // radius += sin(atan(cell.x,cell.y)*-5.*sin(iTime*10.)) * radius/2.;
    float r = sin(iTime + atan(center.x - cell.x, center.y - cell.y)*3.) * radius*8.;
    // if (r < 3.) {
    //     r = 3.;
    // }
    float dist =  d - (r);
    vec3 color = vec3(radius/pow(dist, glow));// + pow(radius*2./d, 13.5);
    if (d < 15.) {
        r = 0.;
        dist =  d - radius* 3.;
        // if ((color.r + color.g + color.b) > 0.6) {
            color += radius/d > 0.6 ? vec3(radius/pow(d, 1.)) : vec3(0.);
        // }
    }

    return color;
}

vec3 getStar(vec2 center, vec2 cell, float radius) {
    float d = distance(cell, center);

    float r = radius + cos(iTime*4. + cos( atan(center.x - cell.x, center.y - cell.y) * 6.)*3.)*(radius / 20.);

    //vec3 color = vec3(step(0.8, r/d) - step(0.85, r/d));
    // vec3 color = vec3(r/pow(d,1.5), r/pow(d,2.), r/pow(d,3.5));  // RED STAR
    vec3 color = vec3(r/pow(d,1.5), r/pow(d,2.), r/pow(d,3.5));
    return color;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    float CELLS = 100.;//50. + sin(iTime*5.)*25.; //100.0;
    vec2 CENTER = vec2(CELLS/2., CELLS/2.);
    float ratio = iResolution.x / iResolution.y;

    float radius = 5.0;//2.5 + sin(iTime*5.)*1.25;//5.0;

    vec2 guv = CELLS * fragCoord.xy / iResolution.xy;
    guv.x *= ratio;

    vec2 cell = floor(guv);
    vec2 uv = fract(guv);

    vec3 color = vec3(0.);

    // color += getBlob(CENTER, cell, radius, 1.3);
    // color += getBlob(CENTER + CENTER*sin(iTime), cell, radius, 1.3);
    ;//10. + sin(iTime*5.)*5.;
    // color += getStar(CENTER, cell, starSize);
    // color += getStar(CENTER + starSize, cell, starSize);

    float starSize = CELLS / 10. ;//+ sin(4.)*4.*cos(iTime*44. + guv.y)*4.;
    float shift = CELLS / 20.;

    // float start =

    for(int i = 0 ; i <= 10 ; ++i) {
        vec2 c = vec2((shift + cos(iTime+float(i))*shift) * float(i), CENTER.y + shift*0.75*sin(iTime*3. + PI/8.*float(i))*3.);
        color += getStar(c, cell, starSize);
    }

    fragColor = vec4(color, 1.0);

}