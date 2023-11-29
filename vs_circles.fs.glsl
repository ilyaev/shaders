varying vec3 vUv;
uniform float t;
uniform float rad;
uniform vec2 u_resolution;
uniform int u_circles; // 12
uniform float u_size;  // 0.04
uniform float u_volume;

const float PI = 3.1415926535897932384626433832795;
const float PI_2 = 1.57079632679489661923;
const float PI_4 = 0.785398163397448309616;
const float PI2 = PI * 2.0;
const int MAX_CIRCLES = 100;

float arc(float fi, float astart, float asize) {
    float aend = astart + asize;
    float start = mod(astart, PI2);

    float l = 1.0;

    if (fi > start && fi < aend) {

    } else {
        if (aend >= PI2 && fi < (aend - PI2)) {
            // l = 0.0;
        }  else {
            l = 0.0;
        }
    }

    return l;
}

float circle(float size, float shift, float l, float thi, float thickness, bool plain) {
    float astart = mod(shift, PI2); //PI2 - PI_4 / 2.0;
    float asize = PI_4;

    float r = size + cos(thi) * 0.001;//  + sin(thi) * cos(t + shift);
    float fi = thi + PI;

    float isLine = arc(fi, astart, asize) + arc(fi, mod(astart + asize * 2.0, PI2), asize) + arc(fi, mod(astart + asize * 4.0, PI2), asize) + arc(fi, mod(astart + asize * 6.0, PI2), asize);

    if (isLine <= 0.0) {
        l = 0.0;
    }

    if (plain) {
        l = step(l - thickness, r) - step(l + thickness, r);
    } else {
        l = smoothstep(l - thickness, l, r) - smoothstep(l, l + thickness, r);
    }
    return l;
}

void main() {
    vec2 uv = vUv.xy / u_resolution;
    uv.x *= u_resolution.x / u_resolution.y;

    float l = length(uv);
    float thi = atan(uv.x, uv.y);
    float fi = thi + PI;

    float allCircles = 0.0;
    float start = 0.0;

    vec3 allColor = vec3(0);

    for(int i = 0 ; i < MAX_CIRCLES ; ++i) {
        if (i > u_circles) {
            break;
        }

        float d = mod(float(i), 2.0) < 1.0 ? t : -t;

        float size = start + u_size;

        float c = circle(size, d + u_volume / 5.0 + float(i), l, thi, size / 10.0, true);

        allCircles = allCircles + c;

        // vec3 col = vec3(1.0 - abs(sin(t*2.0 - l * float(i) * 2.0)), 0.0, 0.0) * abs(u_volume/3.0);
        vec3 col = vec3(1.0 - abs(sin(t*2.0 - l * float(i) * 2.0)), smoothstep(0.1, 1.0, abs(sin(t*2.0 + l))) * 0.5, 0);

        // vec3 col = vec3(0.3, 0.0, 0.0);

        allColor += vec3(col) * c;
        start += u_size;
    }

    gl_FragColor = vec4(allColor * allCircles, 1.0);
}