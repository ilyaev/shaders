#define PI 3.1415
#define PI2 PI * 2.;

float N21(vec2 p) {
    return fract(sin(p.x * 132.33 + p.y*1433.43) * 55332.33);
}


vec3 starsLayer(vec2 ouv) {
    vec3 col = vec3(0.);

    vec2 uv = fract(ouv) - .5;

    float d;

    for(int x = -1 ; x <= 1; x++) {
        for(int y = -1 ; y <= 1; y++) {
            vec2 offset = vec2(x,y);
            vec2 id = floor(ouv) + offset;
            float n = N21(id);
            if (n > .6) {
                float n1 = fract(n*123.432);
                float n2 = fract(n*1234.2432);

                float size = .01 + 0.05 * (n1 - .5);

                vec2 shift = vec2(n1 - .5, n2 - .5);
                d = max(d, size/length(uv - offset + shift));
            }
        }
    }


    return col + d;
}

vec3 backgroundStars(vec2 uv) {
    vec3 col = vec3(0.);

    float t = iTime * 0.3;

    float layers = 3.;

    for(float i = 0. ; i < 1. ; i+= 1./layers) {
        float depth = fract(i + t);
        float scale = mix(20., .5, depth);
        float fade = depth * smoothstep(1., .9, depth);

        col += starsLayer(uv * scale + i * 456.32) * fade;
    }
    return col;
}


void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 col = vec3(0.);

    col += backgroundStars(uv + sin(iTime/2.));


    fragColor = vec4(col, 1.);
}