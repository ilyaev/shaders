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


// shown on right side of split screen
float ImageR(vec2 uv)
{
    return gridSmooth(uv);
}


const float maxd = 85000.;

// halfspace
float tracePlaneY(vec3 rp, vec3 rd)
{
    return rp.y <= 0. ? 0. :
    	rd.y >= 0. ? -1. :
    	rp.y / -rd.y;
}


vec2 rot(inout vec2 v, vec2 cs)
{
    float c = cs.x, s = cs.y; // cs is a cosine,sine pair representing angle of rotation
    return v = vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

vec2 rot(inout vec2 v, float radians)
{
    return rot(v, vec2(cos(radians), sin(radians)));
}


vec3 CameraRay(vec2 p)
{
    vec2 q = (2. * p - iResolution.xy) / iResolution.y;
    vec3 rd = normalize(vec3(q / 2., 1.));
    float pitch = .4, yaw = iTime * .04;
    rot(rd.yz, pitch);
    // rot(rd.xz, yaw);
    return rd;
}


const vec3 C1 = vec3(1.,1.,.9); //1.,1.,1.); //1.,1.,0.); //
const vec3 C2 = vec3(0.,0.,0.); //1.,0.,1.);
const vec3 Csky = vec3(.8,.9,1.);


void mainImage(out vec4 c, in vec2 p)
{
    vec3 rp = vec3(0,1,0);
    vec3 rd = CameraRay(p);

    // Y plane distance
    float d = maxd;
    float dplane = tracePlaneY(rp, rd);
    vec2 cc = vec2(1, 0);
    if (dplane >= 0.) {
        d = min(d, dplane);
	    cc = rp.xz + rd.xz * d; // grid uv at hit point
    	cc *= 4.; // tiling
    }

    float check = ImageR(cc);

    c.rgb = mix(C1, C2, check); // colorize

    float fog = 1.0 - exp2(-.03*d); //0.; //
    c.a = 1.;
}




//  if (!(d >= 0.)) d = maxd; // handle possible nan
//  float dflat = d / rd.z;
//  float aa = 1.0 - exp2(-.03*d); // HACK
//    float g = exp2(-.03*d);
//    c = vec3(g); // debug depths
