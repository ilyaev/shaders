#define MAX_STEPS 100
#define MIN_DISTANCE 0.001
#define MAX_DISTANCE 10.

float dPoint(vec3 ro, vec3 rd, vec3 p) {
    return length(cross(rd, p - ro))/length(rd);
}

float n21(vec2 p) {
    return fract(sin(p.x*123.231 + p.y*4432.342)*33344.22);
}


void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = ((fragCoords.xy / iResolution.xy) - .5) * vec2(iResolution.x / iResolution.y, 1.);

    vec3 col = vec3(.0);

    vec3 ro = vec3(0. + sin(iTime), 0. , -3.- cos(iTime));
    vec3 lookat = vec3(0., 0., 0.);
    float zoom = .5;

    vec3 f = normalize(lookat - ro);
    vec3 r = normalize(cross(vec3(0., 1., 0.), f));
    vec3 u = cross(f, r);

    vec3 c = ro + f * zoom;
    vec3 I = c + uv.x * r + uv.y * u;

    vec3 rd = normalize(I - ro);

    float ds,dt;
    float n;
    vec2 id;
    for(int i = 0 ; i < MAX_STEPS ; i++) {
        vec3 p = ro + rd * ds;

        float a = 3.14/6.;
        p.yz *= mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));

        // vec3 rc = vec3(2.1);
        // vec3 q = mod(p + 0.5*rc, rc) - 0.5 * rc;

        vec3 rc1 = vec3(.15); //vec3(.6, .3, 10.);
        vec3 l = vec3(123., 124., 0.);

        vec3 q1 = p - rc1 * clamp(round(p/rc1), -l, l);
        id = round(p/rc1).xy;
        n = max(.2, n21(id));


        // q1.z -= sin(iTime)*(n - .5);
        q1.z += sin(id.x/2. + cos(id.y/2. + iTime*2. + sin(id.x + iTime/2.)) + iTime*3.)*.1;
        dt = length(q1) - .05;//- (.05 * fract(n*123.22));
        ds += dt * .5;
        if (abs(dt) < MIN_DISTANCE || dt > MAX_DISTANCE) {
            break;
        }
    }

    if (dt < MIN_DISTANCE) {
        // col += ;
        vec3 scol = vec3(n, fract(n*4567.433), fract(n*45689.33));
        scol = vec3(0.9, 0.3, .1);
        // float dd = abs((id.y + sin(iTime)*20.)/24.);
        col += pow(.2/length(id + vec2(0., sin(iTime*3.)*10.))*24., 1.3) * scol;// * vec3(0.9, .3, .1);
    }


    // col.rg = uv;

    fragColor = vec4(col, 1.);
}