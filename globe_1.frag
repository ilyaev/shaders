#define MAX_STEPS 100
#define FAR_DISTANCE 4.
#define MIN_DISTANCE 0.0001
#define SPEED .2
#define SHOW_FRAME true
#define SHOW_FULL_PLANET false
#define PLANET_LAND_COLOR vec3(0.3, .3, .1)
#define PLANET_OCEAN_COLOR vec3(0., 0., .5)
#define PLANET_SNOW_COLOR vec3(.8, .3, .1)
#define PLANET_CLOUD_COLOR vec3(1., 1., 1.) * .6
#define PLANET_GLOW_COLOR vec3(0., 1.3, 2.8)
#define PLANET_DEEP_COLOR vec3(0., 0., 0.3)
#define PI 3.14
#define SUN_COLOR vec3(0.9, .3, .1)
#define ECLIPSE_COLOR vec3(0., 1., 0.)


float n21(vec2 p) {
    return fract(sin(p.x*223.32+p.y*5677.)*4332.23);
}

float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float smoothNoise(vec2 uv) {
    vec2 lv = smoothstep(0., 1., fract(uv));
    vec2 id = floor(uv);

    float bl = n21(id);
    float br = n21(id + vec2(1.,0.));
    float b = mix(bl, br, lv.x);

    float tl = n21(id + vec2(0.,1.));
    float tr = n21(id + vec2(1.,1.));
    float t = mix(tl, tr, lv.x);

    float n = mix(b, t, lv.y);
    return n;
}

float noise(vec2 uv, int level) {
    float n = 0.;
    float d = 1.;
    if (level > 0) {
	    n += smoothNoise(uv * 4.);
    }
    if (level > 1) {
	    n += smoothNoise(uv * 8.) * .5;
        d += .5;
    }
    if (level > 2) {
    	n += smoothNoise(uv * 16.) * .25;
        d += .25;
    }
    if (level > 3) {
	    n += smoothNoise(uv * 32.) * .125;
        d += .125;
    }
    if (level > 4) {
	    n += smoothNoise(uv * 64.) * .025;
        d += .0625;
    }
    return n / d;
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
    f += 0.5000*noise( p); p = m2*p*2.02;
    f += 0.2500*noise( p); p = m2*p*2.03;
    f += 0.1250*noise( p); p = m2*p*2.01;
    f += 0.0625*noise( p);

    return f/0.9375;
}

vec3 getOceanTexture(vec2 uv) {
    return PLANET_OCEAN_COLOR;
    vec3 col = vec3(0.);

    float color1, color2, color;
    float time = iTime/10.;

    uv *= 200.;

	color1 = (sin(dot(uv.xy,vec2(sin(time*3.0),cos(time*3.0)))*0.02+time*3.0)+1.0)/2.0;

	vec2 center = vec2(3.14/2.0, 6.28/2.0) + vec2(3.14/2.0*sin(-time*3.0),6.28/2.0*cos(-time*3.0));

	color2 = (cos(length(uv.xy - center)*0.03)+1.0)/2.0;

	color = (color1+ color2)/2.0;

	float red	= (cos(PI*color/0.5+time*3.0)+1.0)/2.0;
	float green	= (sin(PI*color/0.5+time*3.0)+1.0)/2.0;
	float blue	= (sin(+time*3.0)+1.0)/2.0;

    col = clamp(vec3(red, green, blue), vec3(0.), vec3(.9, .8, 1.));


    return col;
}


vec3 getPlanetTexture(vec2 uv) {
    vec3 col = vec3(0.);
    float size = 450.;

    vec2 guv = uv;

    uv *= size;

    vec2 id = floor(uv);
    uv = fract(uv);

    // float n = noise(id/500. + vec2(-iTime/8.*SPEED, iTime/4.*SPEED), 5) * .6;
    float n = fbm2(id/150. + vec2(-iTime/8.*SPEED, iTime/4.*SPEED));//* clamp(sin(iTime) * .5 + .5, .7, 1.);

    float deep = smoothstep(.12, .13, n);
    float snow = smoothstep(0.57, 0.58, n);
    float ocean = clamp(n-.1, 0., 1.);

    vec3 oceanTexture = getOceanTexture(guv);

    vec3 land = mix(oceanTexture, PLANET_LAND_COLOR, smoothstep(0.4, 0.41, n));
    col += mix(PLANET_SNOW_COLOR, land, 1. -snow);
    col = (1. - step(0.001, col)) * oceanTexture + col;
    col = mix(PLANET_DEEP_COLOR, col, deep);


    float cloudN = noise(id/450. + iTime/8. * SPEED,4);
    col = mix(PLANET_CLOUD_COLOR, col, smoothstep(.2, .6, cloudN));

    return col;
}

vec3 getEclipse(vec2 uv, vec2 center, float stage) {
    vec3 col = vec3(0.);

    float size = .1;

    vec2 moonPosition = vec2(stage * size * 2. + sin(iTime*.0)*.1, 0.) + center;
    vec2 sunPosition = vec2(0., 0.) + center;

    float moonD = length(uv - moonPosition);
    float sunD = length(uv - sunPosition);

    float shift = length(moonPosition - sunPosition);


    vec3 sun_color = mix(ECLIPSE_COLOR, SUN_COLOR, pow(shift/.2, .3));

    float a = atan(uv.x - center.x, uv.y - center.y)*1.;

    float n = fbm2((vec2(sin(a), cos(a)) + iTime/12.) * mix(.5, 3.5, shift/.2)) * clamp(mix(1., 3.5, shift/.2), 1., 2.);

    // n *= .5 + shift;
    // n += clamp(sin(a*3.+iTime*10.), .0, .5);

    float sunSize = size + clamp(n*(.2*(1. - pow(shift/.08, .3))), 0., 10.);

    vec3 sun = pow(sunSize/sunD, 11. - clamp((shift * 30.), 0., 10.)) * sun_color;

    vec3 moon = step(moonD, size * .98) * vec3(.0);

    col = mix(moon, sun, smoothstep(size*.9, size, moonD));
    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec2 guv = uv;

    float wobble = sin(iTime + cos(iTime/2.))*.005;

    if (!SHOW_FULL_PLANET) {
        uv.y += 1.35 + wobble;
    }


    vec3 col = vec3(0.0);

    float a = 2.5;
    vec3 ro = vec3(0. + sin(a), 0.+cos(a), -1);
    vec3 lookat = vec3(0.05, .0, 0.);

    float zoom = 22.;

    if (SHOW_FULL_PLANET) {
         zoom = 4.;
         ro = vec3(0., 0., -1);
         lookat = vec3(0.);
    }

    vec3 f = normalize(lookat - ro);
    vec3 r = normalize(cross(vec3(0., 1., 0), f));
    vec3 u = cross(f, r);
    vec3 c = ro + f * zoom;

    vec3 i = c + uv.x*r + uv.y*u;
    vec3 rd = normalize(i - ro);

    vec3 p = vec3(0., 0., 0.);

    float d = length(cross(rd, p - ro))/length(rd);

    float glowMask = 1. - mix(smoothstep(.20, .02, d*1.5), .0, step(d, .1)) * .8;
    glowMask -= (1. - smoothstep(.1, .11, d*1.07))*smoothstep(.1, .11, d*1.02)*3.;

    vec3 ds, dt;
    float sd;
    int steps;

    for(int i = 0 ; i < MAX_STEPS ; i++) {
        p = ro + rd * ds;
        steps += 1;

        sd = length(p) - .0999;

        ds += sd;

        if (sd < MIN_DISTANCE || sd > FAR_DISTANCE) {
            break;
        }
    }

    vec3 globe = vec3(0.);

    if (sd < MIN_DISTANCE) {
        // p.x += iTime/20.;
        float x = acos(p.y/length(p));
        float y = atan(p.z, p.x);
        vec2 uv = vec2(x, y);
        globe += smoothstep(.0, 1., clamp(float(steps)/40., 0., 1.))* .3 * PLANET_GLOW_COLOR * .8;
        globe += getPlanetTexture(uv);
    }

    if (SHOW_FRAME) {
        globe += (1. - glowMask) * PLANET_GLOW_COLOR;
    }

    col += globe;


    if (SHOW_FRAME) {
        d = length(guv);
        col *= step(d, .4);
        vec3 frame = (step(d, .41) - step(d, .40)) * vec3(.8);

        col += frame;
    }

    col += getEclipse((guv+vec2(0., wobble)) * 2., vec2(-0.4, .45), .1);


    fragColor = vec4(col, 1.);

}