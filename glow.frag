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
    // float dist = radius / distance(uv, center + vec2(sin(iTime*uv.x * 10.) * 0.3, cos(iTime*uv.y*10.) * 0.3));
    float dist = radius / distance(uv, center);
    // float dist = radius / distance(uv, center + vec2(sin(iTime - PI/2.) * 0.3, cos(iTime - PI/2.) *0.3));
    // float dist = radius / length(uv);

    float c = pow(dist, 1.0/GLOW);
    vec3 color = vec3(0.6, 0.4, 0.4);
    // vec3 color = vec3(rotate2d(pow(uv.y*3.,13.)) * vec2(0.6,0.4),0.4);
    // vec3 color = vec3(abs(sin(iTime * 3.0)),abs(cos(iTime * 4.0)),sin(iTime * 5.0) + cos(iTime));

    return vec3(c) * color;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    vec2 uv = fragCoord.xy / iResolution.xy - 0.5;
    uv.x *= iResolution.x / iResolution.y;

    float radius = .02; //noise(vec2(4. + cos(iTime), 3. + sin(iTime))) * 0.1;

    vec3 color = vec3(0.,0.,0.);

    // color = color + getPoint(uv, radius, vec2(noise(vec2(3. + cos(iTime), 3. + sin(iTime))) - 0.5, noise(vec2(2. + cos(iTime), 2. + sin(iTime))) - 0.5));

    // for (int i = 0 ; i < 10 ; ++i) {
    //     vec3 c = getPoint(uv, radius, vec2(sin(iTime * 9.) * 0.2 * float(i), vec2(sin(iTime) * 0.2 * float(i))));
    //     color = color + c;
    // }

    float shift = -0.25;

    float pstep = 0.6 / float(POINTS);
    float astep = PI/2. / float(POINTS);

    for (int i = 0 ; i < POINTS ; ++i) {
        // color = color + getPoint(uv, radius, vec2(0.1 * float(i) + noise(vec2(float(i) + cos(iTime), 0.1 * float(i) + sin(iTime))) - 0.5, noise(vec2(float(i+1) + cos(iTime), float(i+1) + sin(iTime))) - 0.5));
        // float px = noise(vec2(float(i+1) + sin(iTime), float(i+1) + cos(iTime))) - 0.5;
        // float py = noise(vec2(float(i+3) + sin(iTime), float(i+3) + cos(iTime))) - 0.5;

        // float px = noise(vec2(float(i+1) + sin(iTime), float(i+1) + cos(iTime))) * 0.8 - 0.4;
        // float py = noise(vec2(float(i+3) + sin(iTime), float(i+3) + cos(iTime))) * 0.8 - 0.4;

        // float px = noise(vec2(float(iTime+10.+float(i)))) * 0.8 - 0.4;
        float px = noise(vec2(float(i) + iTime + sin(iTime), float(i) + iTime + cos(iTime))) * 0.8 - 0.4;
        float py = noise(vec2(2.*float(i) + iTime + sin(iTime), 2.*float(i) + iTime + cos(iTime))) * 0.8 - 0.4;

        float angle = 2. * PI * noise(vec2(iTime *  float(i + 1)));

        px = noise(vec2(10. + sin(astep * float(i))*iTime, 10. + cos(astep * float(i))*iTime)) * 0.8 - 0.4;
        py = noise(vec2(10. + cos(astep * float(i))*iTime, 10. + sin(astep * float(i))*iTime)) * 0.8 - 0.4;

        px = shift + sin(angle) * 0.2;
        py = shift + cos(angle) * 0.2;
        // py = noise(vec2(10. + cos(astep * float(i))*iTime, 10. + sin(astep * float(i))*iTime)) * 0.8 - 0.4;

        // float px = shift + sin(iTime * float(i + 1)) * 0.2;
        // float py = 0. + cos(iTime * float(i + 1)) * 0.2;

        px = sin(angle) * 0.2;
        py = cos(angle) * 0.2;

        color = color + getPoint(uv, radius, vec2(px, py));

        shift += pstep * float(i);
    }

    // color *= vec3(noise(vec2(32. + sin(iTime), 31. + cos(iTime))));

    fragColor = vec4(color, 1.0);

}