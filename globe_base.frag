#define MAX_STEPS 100
#define FAR_DISTANCE 4.
#define MIN_DISTANCE 0.0001
#define SPEED .8


float n21(vec2 p) {
    return fract(sin(p.x*123.43 + p.y*4563.234) * 46832.4);
}

float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);

	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

const mat2 m2 = mat2(0.8,-0.6,0.6,0.8);

float fbm2( in vec2 p ){
    float f = 0.0;
    f += 0.5000*noise( p ); p = m2*p*2.02;
    f += 0.2500*noise( p ); p = m2*p*2.03;
    f += 0.1250*noise( p ); p = m2*p*2.01;
    f += 0.0625*noise( p );

    return f/0.9375;
}


vec3 getTexture(vec2 uv) {
    vec3 col = vec3(0.);
    float size = 400.;

    uv *= size;

    vec2 id = floor(uv);
    uv = fract(uv);

    float n = fbm2(id/30. + vec2(-iTime/8.*SPEED, iTime/4.*SPEED));

    col += n * vec3(0.9, 0.3, .1);


    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec2 guv = uv;

    uv.y += 1.2 + sin(iTime)*.0099;


    vec3 col = vec3(0.0);

    float a = 2.5;
    vec3 ro = vec3(0. + sin(a), 0.+cos(a), -1);
    vec3 lookat = vec3(0.05, .0, 0.);
    float zoom = 22.;

    vec3 f = normalize(lookat - ro);
    vec3 r = normalize(cross(vec3(0., 1., 0), f));
    vec3 u = cross(f, r);
    vec3 c = ro + f * zoom;

    vec3 i = c + uv.x*r + uv.y*u;
    vec3 rd = normalize(i - ro);

    vec3 p = vec3(0., 0., 0.);

    float d = length(cross(rd, p - ro))/length(rd);

    float glowMask = 1. - mix(smoothstep(.20, .02, d*1.45), .0, step(d, .1));

    vec3 ds, dt;
    float sd;
    int steps;

    for(int i = 0 ; i < MAX_STEPS ; i++) {
        p = ro + rd * ds;
        steps += 1;
        sd = length(p) - .0999;

        ds += sd;

        if (abs(sd) < MIN_DISTANCE || sd > FAR_DISTANCE) {
            break;
        }
    }

    vec3 globe = vec3(0.);

    if (abs(sd) < MIN_DISTANCE) {
        // p.x += iTime/20.;
        float x = acos(p.y/length(p));
        float y = atan(p.z, p.x);
        vec2 uv = vec2(x, y);
        globe += smoothstep(.0, 1., clamp(float(steps)/30., 0., 1.))*.5*vec3(0., .5, 0.);
        globe += getTexture(uv);
    }

    globe += (1. - glowMask) * vec3(0., 1., 0.);

    col += globe;

    // col *= 1. - smoothstep(.3, .4, length(guv));

    d = length(guv);

    //col *= step(d, .4);

    vec3 frame = (step(d, .41) - step(d, .40)) * vec3(.8);

   //col += frame;


    fragColor = vec4(col, 1.);

}