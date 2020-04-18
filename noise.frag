precision mediump float;

#define NUM_OCTAVES 5

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

float fbm(vec2 x) {
	float v = 0.0;
	float a = 0.7;
	vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * noise(x);
		x = rot * x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
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

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    vec2 uv = fragCoord.xy / iResolution.xy - 0.5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 color = vec3(uv.x + 0.5, uv.y + 0.5, uv.x*uv.y + 0.5);

    float scale = 5.;

    color = vec3(fbm2(vec2(uv.x * scale, uv.y * scale)));

    fragColor = vec4(color, 1.0);

}