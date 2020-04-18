#define PI 3.14
#define SUN_COLOR vec3(0.9, .3, .1)
#define ECLIPSE_COLOR vec3(0., 1., 0.)

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
    f += 0.5000*noise( p); p = m2*p*2.02;
    f += 0.2500*noise( p); p = m2*p*2.03;
    f += 0.1250*noise( p); p = m2*p*2.01;
    f += 0.0625*noise( p);

    return f/0.9375;
}

vec3 getEclipse(vec2 uv, vec2 center, float stage) {
    vec3 col = vec3(0.);

    float size = .1;

    vec2 moonPosition = vec2(stage * size * 2. + sin(iTime*.0)*.2, 0.) + center;
    vec2 sunPosition = vec2(0., 0.) + center;

    float moonD = length(uv - moonPosition);
    float sunD = length(uv - sunPosition);

    float shift = length(moonPosition - sunPosition);


    vec3 sun_color = mix(ECLIPSE_COLOR, SUN_COLOR, pow(shift/.2, .3));

    float a = atan(uv.x - center.x, uv.y - center.y);

    float n = fbm2((vec2(sin(a), cos(a)) + iTime/12.) * mix(.5, 3.5, shift/.2) ) * clamp(mix(1., 3.5, shift/.2), 1., 2.);

    // n = clamp(n-.2, 0., 1.) * 3.;

    // n += rand(vec2(a));

    float sunSize = size + clamp(n*(.2*(1. - pow(shift/.08, .3))), 0., 10.);

    vec3 sun = pow(sunSize/sunD, 4. - clamp((shift * 30.), 0., 1.)) * sun_color;

    vec3 moon = step(moonD, size * .98) * vec3(.0);

    col = mix(moon, sun, smoothstep(size*.9, size, moonD));
    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 col = vec3(0.);

    col += getEclipse(uv, vec2(0.), .1);


    fragColor = vec4(col, 1.);
}