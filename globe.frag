#define MAX_STEPS 100
#define FAR_DISTANCE 4.
#define MIN_DISTANCE 0.0001
#define SPEED .2
#define SHOW_FRAME true
#define SHOW_FULL_PLANET false
#define PLANET_LAND_COLOR vec3(0.3, .3, .1)
#define PLANET_OCEAN_COLOR vec3(0., 0., .5)
#define PLANET_SNOW_COLOR vec3(.5, .2, .1)
#define PLANET_CLOUD_COLOR vec3(1., 1., 1.) * .6
#define PLANET_GLOW_COLOR vec3(0., 1.3, 2.8)
#define SPACE_GLOW_COLOR vec3(0., 1.3, 2.8)
#define PLANET_DEEP_COLOR vec3(0., 0., 0.3)
#define PI 3.14
#define SUN_COLOR vec3(0.9, .3, .1)
#define ECLIPSE_COLOR vec3(0., 1., 0.)
#define SECOND_SUN_COLOR vec3(0.5, 0.2, .90)

struct sEclipse {
    vec3 color;
    float d;
    float shift;
};

float n21(vec2 p) {
    return fract(sin(p.x*223.32+p.y*5677.)*4332.23);
}

float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898 + .00019, 4.1414))) * 43759.5453);
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
    // p += iTime;
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
    return fbm2(uv*4. * fbm2(uv*4. * fbm2(uv*2. + vec2(0., iTime/10.)) + iTime/10.)) * PLANET_OCEAN_COLOR * 5.;
    // return PLANET_OCEAN_COLOR;
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
    n *= 1.3;
    // n = fract(n * 1.);
    float deep = smoothstep(.12, .13, n*.8);
    float snow = smoothstep(0.57, 0.58, n);
    float ocean = clamp(n-.1, 0., 1.);

    vec3 oceanTexture = getOceanTexture(guv);

    vec3 land = mix(oceanTexture, PLANET_LAND_COLOR, smoothstep(0.4, 0.41, n));

    col += mix(
        PLANET_SNOW_COLOR,
        mix(land, land * 6., pow(n - .35, .4))/2.5,
        1. -snow
    );

    col = (1. - step(0.001, col)) * oceanTexture + col;

    col = mix(PLANET_DEEP_COLOR, col, deep);

    if (n < .4 && n > .12) {
        col *= .6;
    }

    vec2 cuv = vec2(atan(guv.x*2., guv.y*4.), length(guv) ) ;
    float aa = iTime/512.;
    vec2 cid = floor((cuv*mat2(vec2(sin(aa), cos(aa)), vec2(-cos(aa), sin(aa))))*450.);

    float cloudN = noise(cid/150. + iTime/16. * SPEED, 5);
    vec3 cloudColor = PLANET_CLOUD_COLOR;

    if (n < .12) {
        cloudColor *= 1.1;
        cloudColor.rb *= 1.2;
    }


    // col = vec3(0.);
    col = mix(cloudColor, col, smoothstep(.2, .6 + sin(iTime/32. + cos(iTime*SPEED*cuv.x + sin(iTime/32.)))*.2, cloudN));
    // col = oceanTexture;

    return col;
}

sEclipse getEclipse(vec2 uv, vec2 center, float stage) {
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

    float sunSize = size + clamp(n*(.2*(1. - pow(shift/.08, .3))), 0., 10.);

    vec3 sun = pow(sunSize/sunD, 11. - clamp((shift * 30.), 0., 10.)) * sun_color;

    vec3 moon = step(moonD, size * .98) * vec3(.0);

    col = mix(moon, sun, smoothstep(size*.9, size, moonD));
    sEclipse res;
    res.color = col;
    res.d = sunD;
    res.shift = shift;
    return res;
}

vec3 getStars(vec2 guv) {
    float a = iTime / 50.;
    guv -= .2;
    guv *= mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
    guv += .2;
    guv *= 15.;
    vec2 uv = fract(guv) - .5;
    vec2 id = floor(guv);
    vec3 col = vec3(0.);

    for(int x = -1 ; x <= 1 ; x++) {
        for(int y = -1 ; y <= 1; y++) {
            vec2 offset = vec2(x,y);
            vec2 cid = id + offset;
            float n = n21(cid);
            vec2 shift = vec2(n, fract(n * 123.43))-.5;
            float d = length(uv - offset - shift);
            if (fract(n * 5543.234) > .8) {
                col = max(col, smoothstep(.1, .9, (.005 + .02 * fract(n*32342.22))/d)) * (.7 + 0.3 * fract(n*4443322.33));
            }
        }
    }


    return col;
}

vec3 getSecondSun(vec2 uv) {
    vec3 col = vec3(0.);

    float d = pow(.1/length(uv), 1.9) * .3;

    col += d;

    return col * SECOND_SUN_COLOR;
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
    vec2 wuv = guv + vec2(0., wobble);

    sEclipse eclipse = getEclipse(wuv * 2., vec2(-0.6, .65), 1. - sin(iTime/20.));

    vec3 spaceGlowColor = mix(PLANET_GLOW_COLOR, vec3(SUN_COLOR), eclipse.shift / .1);

    if (sd < MIN_DISTANCE) {
        float x = acos(p.y/length(p));
        float y = atan(p.z, p.x);
        vec2 uv = vec2(x, y);
        globe += smoothstep(.0, 1., clamp(float(steps)/40., 0., 1.))* .3 * spaceGlowColor * .8;
        globe += getPlanetTexture(uv);
    } else {

        if (!SHOW_FULL_PLANET) {
            col += eclipse.color;
            col += getStars(wuv) * clamp(eclipse.d*2., 0., 1.);
            col += getSecondSun(wuv + vec2(-0.4, .1));
        }
    }

    float glowMask = 1. - mix(smoothstep(.20, .02, d*1.5), .0, step(d, .1)) * .8;
    float planetGlowMask = (1. - smoothstep(.1, .11, d*1.07))*smoothstep(.1, .11, d*1.02)*3.;

    globe += (1. - glowMask) * mix(PLANET_GLOW_COLOR, spaceGlowColor, eclipse.shift / .4) + (planetGlowMask * PLANET_GLOW_COLOR);

    col += globe;

    if (SHOW_FRAME) {
        d = length(guv);
        col *= step(d, .7);
        vec3 frame = (step(d, .71) - step(d, .70)) * vec3(.8);
        col += frame;
    }

    fragColor = vec4(col, 1.);

}