precision mediump float;
#define PI 3.14159265359

float GLOW = 0.9;
const int POINTS = 10;

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


mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

vec3 getPoint(vec2 uv, float radius, vec2 center) {
    // radius = radius * fract(iTime);//sin(iTime*10. + uv.y * 30.);
    // float dist = radius / sin(uv.x * iTime*iTime + 2.*cos(uv.y * iTime*iTime*2.)) / distance(uv, center);
    float dist = radius / distance(uv, center);
    float c = smoothstep(0.1,0.105, dist) - smoothstep(0.105, 0.110, dist);//pow(dist, 1.0/GLOW);
    vec3 color = vec3(0.6, 0.4, 0.4);
    return vec3(c) * color * 2.;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    float ratio = iResolution.x / iResolution.y;
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv.x *= ratio;





    vec3 color = vec3(0.,0.,0.);

    // float radius = .03;
    // color += getPoint(uv, radius, vec2(0.,0.));

    // vec2 point1 = vec2(noise(vec2(iTime, 0.1)), noise(vec2(iTime, 1.4)));
    // vec2 point2 = vec2(noise(vec2(iTime, 2.2)), noise(vec2(iTime, 3.5)));
    // vec2 point3 = vec2(noise(vec2(iTime, 4.3)), noise(vec2(iTime, 5.6)));

    vec2 point1 = vec2(0. + sin(iTime*3. + uv.y *noise(vec2(iTime, 0.3))*4.) * 0.2, 0. + cos(iTime + uv.x*5.) * 0.2);
    // uv = rotate2d(sin(iTime) * PI/3.) * uv;
    vec2 point2 = vec2(1. + sin(iTime*2. + uv.y*3.) * 0.2, 1. + cos(iTime + uv.x*3.) * 0.2);
    // uv = rotate2d(-1. *sin(iTime) * PI/3.) * uv;
    vec2 point3 = vec2(0.5 + sin(iTime*4. + uv.y *2.) * 0.2, 0.5 + cos(iTime + uv.x*5.) * 0.2);


    // vec2 point1 = vec2(0. + sin(iTime) * 0.2, 0. + cos(iTime) * 0.2);
    // vec2 point2 = vec2(1. + sin(iTime) * 0.2, 1. + cos(iTime) * 0.2);
    // vec2 point3 = vec2(0.5 + sin(iTime) * 0.2, 0.5 + cos(iTime) * 0.2);


    float d1 = 1.0 - pow(distance(uv, point1), 2.);// + 2. * sin(iTime + uv.x * 2.));
    float d2 = 1.0 - pow(distance(uv, point2), 2.);
    float d3 = 1.0 - pow(distance(uv, point3), 2.);

    color += vec3(d1, 0.,0.);
    color += vec3(0., d2, 0.);
    color += vec3(0.,0.,d3);
    color += vec3(1.0 - smoothstep(0.01, 0.012, abs(d2-d3)));
    color += vec3(1.0 - smoothstep(0.01, 0.012, abs(d1-d3)));
    color += vec3(1.0 - smoothstep(0.01, 0.012, abs(d1-d2)));


    // if (abs(d2-d1) < 0.01 || abs(d2-d3) < 0.01 || abs(d1-d3) < 0.01) {
    //     color += vec3(1.0, 1.0,1.0);
    // }

    // vec3(1. * d1, 1. *d2, 1.*d3);


    fragColor = vec4(color, 1.0);

}