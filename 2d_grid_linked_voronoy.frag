#iChannel0 "file://st_texture2.jpeg"
#define iTime iTime*0.1

precision mediump float;

float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}


float getCellMass(vec2 id) {
    // float n = n21(id);
    return 1.;
}

vec3 getCellColor(vec2 id) {
    float n = n21(id);
    return vec3(n, fract(n*123.), fract(n*6789.));
}

vec2 getCellCenter(vec2 id) {
    float n = n21(id);
    vec2 shift = vec2(n - .5, fract(n * 123.32) - .5);
    return shift*sin(iTime + id.x*10. + cos(id.y)*10.);
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

float getLine(vec2 uv, vec2 id, vec2 offsetFrom, vec2 offsetTo) {
    vec2 cIDFrom = id + offsetFrom;
    vec2 cIDTo = id + offsetTo;
    float ld = line(uv, getCellCenter(cIDFrom) + offsetFrom, getCellCenter(cIDTo) + offsetTo);
    return ld;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y;
    vec3 col = vec3(0.);

    vec2 cells = vec2(13.);// + sin(iTime*.3 + uv.x*3.)*5.);// + vec2(uv.x * 13. * cos(iTime), uv.y*13.*sin(iTime)));
    vec2 ouv = uv;

    // float a = atan(uv.x, uv.y);
    // float l = length(uv);

    // uv = vec2(a, l);

    vec2 id = floor(uv * cells) + 10.;
    uv = fract(uv * cells) - .5;



    float radius = .4;
    float px_size = 1. / (iResolution.y / cells.y);

    vec2 center = getCellCenter(id);
    float ld = 0.;


    float d = 222.;

    vec3 cellColor = vec3(0.);

    vec2 voUV = vec2(0.);
    vec2 closestPoint = vec2(0.);

    for (int x = -1 ; x <= 1 ; x++) {
        for(int y = -1 ; y <= 1 ; y++) {
            vec2 cID = id + vec2(x, y);
            vec2 shift = getCellCenter(cID);
            vec2 cellUV = uv - vec2(x, y);

            float dist = length(cellUV - shift) / getCellMass(cID);

            if (abs(d - dist) < .01) {
                // col = vec3(1.);
            }

            if (dist < d) {
                cellColor = getCellColor(cID);
                voUV = cellUV - shift + .5;
                closestPoint = shift;
                d = dist;
            }

            // col += (getCellColor(cID)*dist)/9.;//*.09;
        }
    }

    col += cellColor * .7;// * d;// * pow(.1/d, 1.3);

    // col += d;
    // col.rg = closestPoint;
    // col.rg = voUV;
    // col += texture(iChannel0, voUV).rgb;
    // col += 1.0 - step(0.02, d);

    col += step(length(uv - getCellCenter(id)), .01);

    // for (int x = -1 ; x <= 1 ; x++) {
    //     for(int y = -1 ; y <= 1 ; y++) {
    //         vec2 cID = id + vec2(x, y);
    //         float n = n21(cID);
    //         vec2 shift = getCellCenter(cID);
    //         vec2 cellUV = uv - vec2(x, y);
    //         float d = length(cellUV - shift);
    //         float mask = step(d, radius);
    //         col += pow((radius * n)/d, 1.2) * getCellColor(cID) / 9.;
    //         if (x == 0 && y == 0) {

    //         } else {
    //             float ld = line(cellUV, shift, center - vec2(x,y));
    //             // col += pow(.0051/ld, 3.1) * vec3(0.9, .3, .1);  step(ld, px_size) * .3;
    //             col += step(ld, px_size) * .3;
    //         }
    //     }
    // }

    // col += step(getLine(uv, id, vec2(0., -1.), vec2(1., 0.)), px_size) * .3;
    // col += step(getLine(uv, id, vec2(1., 0.), vec2(0., 1.)), px_size) * .3;
    // col += step(getLine(uv, id, vec2(0., 1.), vec2(-1., 0.)), px_size) * .3;
    // col += step(getLine(uv, id, vec2(-1., 0.), vec2(0., -1.)), px_size) * .3;

    col.r += step(uv.x + .5, px_size) + step(uv.y + .5, px_size);

    fragColor = vec4(col, 1.);
}