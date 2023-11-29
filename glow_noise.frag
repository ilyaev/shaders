precision mediump float;
#define PI 3.14159265359

float GLOW = 0.9;
const int POINTS = 10;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}

float cpnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 *
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec3 hash3( vec2 p ){
    vec3 q = vec3( dot(p,vec2(127.1,311.7)),
				   dot(p,vec2(269.5,183.3)),
				   dot(p,vec2(419.2,371.9)) );
	return fract(sin(q)*43758.5453);
}

float iqnoise( in vec2 x, float u, float v ){
    vec2 p = floor(x);
    vec2 f = fract(x);

	float k = 1.0+63.0*pow(1.0-v,4.0);

	float va = 0.0;
	float wt = 0.0;
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ )
    {
        vec2 g = vec2( float(i),float(j) );
		vec3 o = hash3( p + g )*vec3(u,u,1.0);
		vec2 r = g - f + o.xy;
		float d = dot(r,r);
		float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );
		va += o.z*ww;
		wt += ww;
    }

    return va/wt;
}

float vnoise(vec2 x) {
    return iqnoise(x, 1., 1.);
}


mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

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

float fbnoise(vec2 x) {
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
float fbnoise2( in vec2 p ){
    float f = 0.0;
    f += 0.5000*noise( p ); p = m2*p*2.02;
    f += 0.2500*noise( p ); p = m2*p*2.03;
    f += 0.1250*noise( p ); p = m2*p*2.01;
    f += 0.0625*noise( p );

    return f/0.9375;
}

vec3 getPoint(vec2 uv, float radius, vec2 center, int index) {
    float dist = radius / distance(uv, center);
    float c = pow(dist, 1.0/GLOW);

    float r = noise(vec2(iTime, float(index + POINTS) + 0.5));// 0.6;
    float g = noise(vec2(iTime, float(index + POINTS) + 1.5)); //0.4;
    float b = noise(vec2(iTime, float(index + POINTS) + 2.5));//0.4;

    vec3 color = vec3(r, g, b);
    return vec3(c) * color;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    vec2 uv = fragCoord.xy / iResolution.xy - 0.5;
    uv.x *= iResolution.x / iResolution.y;

    float radius = .02;
    vec3 color = vec3(0.,0.,0.);


    float shift = -0.25;

    float pstep = 0.6 / float(POINTS);
    float astep = PI/2. / float(POINTS);

    for (int i = 0 ; i < POINTS ; ++i) {

        radius = cpnoise(vec2(iTime, 567.5 + float(i*2))) * 0.04;

        // float angle = 2. * PI * noise(vec2(iTime *  float(i + 1)));

        // float px = fbnoise(vec2(iTime, float(i) + 0.5)) * 0.8 - 0.4;
        // float py = fbnoise(vec2(iTime, float(i+20) + 0.5)) * 0.8 - 0.4;

        // float px = cpnoise(vec2(iTime, float(i) + 0.5)) * 0.8;
        // float py = cpnoise(vec2(iTime, float(i+20) + 0.5)) * 0.8;


        // float px = noise(vec2(float(i*2) + sin(iTime) + 0.5, float(i*2 + 1) + cos(iTime) + 0.5)) * 0.8 - 0.4;
        // float py = noise(vec2(float(i*2 + 100) + sin(iTime) + 0.5, float(i*2 + 100) + cos(iTime) + 0.5)) * 0.8 - 0.4;

        float px = cpnoise(vec2(float(i*2) + sin(iTime) + 0.5, float(i*2 + 1) + cos(iTime) + 0.5)) * 0.5;
        float py = cpnoise(vec2(float(i*2 + 100) + sin(iTime) + 0.5, float(i*2 + 100) + cos(iTime) + 0.5)) * 0.5;

        color = color + getPoint(uv, radius, vec2(px, py), i);

        shift += pstep * float(i);
    }


    fragColor = vec4(color, 1.0);

}