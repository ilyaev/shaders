#define MIN_DISTANCE 0.001
#define MAX_DISTANCE 10.
#define MAX_STEPS 256
#define GRID_COLOR vec3(1., 0.09, 1.)
#define t iTime
#define speed 5.


float filterWidth2(vec2 uv)
{
     vec2 dx = dFdx(uv), dy = dFdy(uv);
    return dot(dx, dx) + dot(dy, dy) + .0001;
}

float gridThickness = .1; //.2; //.25; //.02; //.5; //

float gridSmooth(vec2 uv)
{
    vec2 q = uv;
    q += .5; // HACK offset wrong without
    q -= floor(q);
    q = (gridThickness + 1.) * .5 - abs(q - .5);
    float w = 12.*filterWidth2(uv); //*iResolution.y;
    return smoothstep(.5-w*sqrt(gridThickness),.5+w, max(q.x, q.y));
}

float gridPow(vec2 p)
{
    const float fadePower = 16.;
    vec2 f = fract(p);
    f = .5 - abs(.5 - f);
    f = max(vec2(0), 1. - f + .5*gridThickness);
    f = pow(f, vec2(fadePower));
    float g = f.x+f.y; //max(f.x, f.y); //
    float s = sqrt(gridThickness);
    return mix(g, s, exp2(-.01 / filterWidth2(p)));
}


vec3 trace(vec3 ro, vec3 rd) {
    float ds,dt = 0.;
    vec3 color,p = vec3(0.);
    for(int i = 0 ; i < MAX_STEPS ; i++) {
        p = ro + rd * ds;
        dt = p.y + .5;
        ds += dt;
        if (abs(dt) < MIN_DISTANCE || dt > MAX_DISTANCE) {
            break;
        }
    }

    if (abs(dt) < MIN_DISTANCE) {
        float size = 4.;

        color += vec3(mix(vec3(0.), GRID_COLOR, gridPow(p.xz + vec2(0., t*speed))));

        //step(.0001, sin(p.x*size)*sin(p.z*size + t*10.));
    }

    return color;
}


float s;


float rand(){
	s=fract(s*32322.65432+0.12333);
	return abs(fract(s));
}
mat2 rot2d(float a){
	float c=cos(a);
	float s=sin(a);
	return mat2(
		c,-s,
		s, c);
}


void mainImage(out vec4 fragColor, in vec2 fragCoords) {

    vec2 uv = fragCoords.xy / iResolution.xy;
    uv -= .5;
    uv.x *= iResolution.x / iResolution.y;

    vec2 mouse = iMouse.xy / iResolution.xy;

    vec3 col = vec3(0.3);


    vec3 ro = vec3(0., .2 + mouse.y, -2);
    vec3 lookat = vec3(0., 0., 2);
    float zoom = 1.;

    vec3 f = normalize(lookat - ro);
    vec3 r = normalize(cross(vec3(0., 1., 0), f));
    vec3 u = cross(f, r);
    vec3 c = ro + f * zoom;
    vec3 i = c + uv.x * r + uv.y * u;

    vec3 rd = normalize(i - ro);

    col = trace(ro, rd);

    fragColor = vec4(col, 1.);

}

