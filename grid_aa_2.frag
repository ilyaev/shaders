// derived from https://shadertoy.com/view/3tVGRz
// see also https://shadertoy.com/view/wt3Sz2

// a simple testbed for rendering an antialiased grid plane.
// can contrast various filtering methods.
// no texture samplers used!

// thicker than .5 makes squares, not grids
float gridThickness = .1; //.2; //.25; //.02; //.4; //

const vec3 Cfill = vec3(1.,1.,.9); //1.,1.,1.); //1.,1.,0.); //
const vec3 Cgrid = vec3(0.,0.,0.); //1.,0.,1.);
const vec3 Csky = vec3(.8,.9,1.);


// refactored out the common derivative filtering portion:
// trivial to change to any dimension.
// can ignore the axis not being striped
float filterWidth1(float u)
{
    float dx = dFdx(u), dy = dFdy(u);
    return dx * dx + dy * dy + .0001;
}

float filterWidth2(vec2 uv)
{
     vec2 dx = dFdx(uv), dy = dFdy(uv);
    return dot(dx, dx) + dot(dy, dy) + .0001;
}
   // btw fwidth totally works too
//    vec2 fw = fwidth(uv); return dot(fw, fw) + .0001; //max(fw.x, fw.y) + .0001; //
//    return max(dot(dx, dx), dot(dy, dy)) + .0001; // tried; looks same to me

float filterWidth3(vec3 uvw)
{
    vec3 dx = dFdx(uvw), dy = dFdy(uvw);
    return dot(dx, dx) + dot(dy, dy) + .0001;
}

// well, after all the resituating it's not very optimal
// perhaps I should make a nice centered inset one instead,
// as reference, so the filtered ones won't have to futz
// with the zero crossing edge so much
float gridSimple(vec2 p)
{
	vec2 g = step(gridThickness, fract(gridThickness*.5-p));
	return 1.-g.x*g.y;
}

float gridUnfiltered(vec2 p)
{
    p -= .5*gridThickness; // center
    return step(1.-gridThickness, max(fract(p.x),fract(p.y)));
}


// still not happy with how it fades out too soon,
// but at least it's basically working.  Better than the others.
float gridSmooth(vec2 p)
{
    vec2 q = p;
    q += .5;
    q -= floor(q);
    q = (gridThickness + 1.) * .5 - abs(q - .5);
    float w = 12.*filterWidth2(p);
    float s = sqrt(gridThickness);
    return smoothstep(.5-w*s,.5+w, max(q.x, q.y));
}

// the half sqrt(gridThickness) bias is fairly tricky;
// honestly I shouldn't need to involve smoothstep at all here, hold on
// meh, still not working worth a dern, maybe someday
float gridSmoothLinear(vec2 p)
{
    vec2 q = p;
    q += .5;
    q -= floor(q);
    q = (gridThickness + 1.) * .5 - abs(q - .5);
    float w = 12.*filterWidth2(p);
    float s = gridThickness;
    return clamp((max(q.x, q.y) - .5-w*s) / (w*(s+1.)), 0., 1.);
}

// working better now
float gridExp(vec2 p)
{
    const float fadePower = 16.;
    vec2 f = fract(p);
    f = .5 - abs(.5 - f);
    float g = min(f.x, f.y);
    g = max(0., g - .5*gridThickness);
    g = exp2(-fadePower*g);
    float s = sqrt(gridThickness);
    return mix(g, s, exp2(-.02 / filterWidth2(p)));
}

// for ilyaev
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

// originally from https://shadertoy.com/view/WlVGDh
// this is just not the way to do grids, blurs
// the corners too much, but it sort of works:
float gridSine(vec2 p)
{
    p *= 3.1415927;
    float g = sin(p.x) * sin(p.y); // grid texture
    g *= g; g = max(0., 1. - g);
    g = pow(g, 8./gridThickness);
    float s = .75*sqrt(gridThickness); // HACK idk
    g = mix(g, s, min(1., 1.*filterWidth2(p))); //length(fwidth(p)))); // aa
	return g;
}

// similar but with parabola - still just wrong at corners
float gridPara(vec2 p)
{
    vec2 q = fract(p);
    q = max(vec2(0), .5 - gridThickness*.5 - abs(.5 - q));
    q *= 1.-q; q = 4.*q;
    float g = 1.-q.x*q.y;
    g = pow(g, 1./gridThickness);
    float s = sqrt(gridThickness);
    g = mix(g, s, min(1., 4.*filterWidth2(p))); //length(fwidth(p)))); // aa
	return g;
}

// shown on right side of split screen
float ImageR(vec2 uv)
{
    // return gridSmooth(uv);
    return gridPow(uv);
    return gridSine(uv);
    return gridExp(uv);
    return gridPara(uv);
    return gridSmoothLinear(uv);
//    return gridSimple(uv);
//    return gridUnfiltered(uv);
}

// shown on left half of split screen
float ImageL(vec2 uv)
{
//    return gridSimple(uv);
    return gridUnfiltered(uv);
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
    rot(rd.xz, yaw);
    return rd;
}


void mainImage(out vec4 c, in vec2 p)
{
    // a simple camera
    vec3 rp = vec3(0,1,0);
    rp.y += sin(iTime * 0.07) * .99; // bob slowly up and down
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

    // split screen at mouse click
    float splits = p.x - iMouse.x;
    bool left = splits < 0.;
    // depending on last mouse click, split screen between two different functions
    float gridline = left
        ? ImageL(cc)
        : ImageR(cc);

    c.rgb = mix(Cfill, Cgrid, gridline); // colorize

    // no actual lighting in this simple test,
    // but a few dot products would do it.

    float fog = 1.0 - exp2(-.03*d); //0.; //
    c.rgb = mix(c.rgb, Csky, fog);
    // green vertical line at split
    c.rgb = mix(c.rgb, vec3(.0,.5,.0), exp2(-2. * abs(splits)));

    c.rgb = pow(c.rgb, vec3(1./2.2)); // to srgb gamma
    c.a = 1.;
}




//  if (!(d >= 0.)) d = maxd; // handle possible nan
//  float dflat = d / rd.z;
//  float aa = 1.0 - exp2(-.03*d); // HACK
//    float g = exp2(-.03*d);
//    c = vec3(g); // debug depths
