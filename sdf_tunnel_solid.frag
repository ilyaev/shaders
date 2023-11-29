#iChannel0 "file://st_texture_disp_1.png"
#iChannel1 "file://st_cubemap1.jpeg"
#define MAX_STEPS 200
#define MAX_DIST 15.
#define SURF_DIST .001
#define MAT_BALL  1.
#define MAT_WALLS  2.
#define SINGLE_SCENE false
#define TUNNEL_SPEED .4

#define S smoothstep
#define T iTime

float smin( float a, float b)
{
    float k = .4;
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float sdBox(vec3 p, vec3 s) {
    p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, max(p.y, p.z)), 0.);
}

float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    //  return fract(sin(n.x*123.231 + n.y*4432.342)*33344.22);
}

vec3 renderSolidTunnel(vec3 p) {
    float Width = 1.;
    float Height = 1.;

    float Thick = .1;

    float Step = 3.5;

    vec3 c = vec3(0., 0., Step);
    vec3 q = p;
    if (SINGLE_SCENE != true) {
        q = mod(p + 0.5 * c, c) - 0.5 * c;
    }

    q.yz *= Rot(3.14/2.);

    float id = round(p.z / Step) + 4.;

    float n = n21(vec2(id, 1.));

    // if (n > .9) {
    if (mod(id, 4.) == 0.) {
        q.xz *= Rot(id * 1. + sin(iTime) * .5 + iTime*clamp((n - .5)*3., 0., 1.));
    }

    float left = sdBox(abs(q) - vec3(Width*.9, Width / 2., 0.), vec3(Thick, Width/2., Width));
    float right = sdBox(abs(q) - vec3(0., Width / 2., Width), vec3(Width, Width/2., Thick));

    float d = min(left, right);

    float rad = .05 + 0.05 * n;

    float circ = length(q + vec3(sin(iTime*n + id) * .9 * n, sin(iTime*n)*.2, cos(iTime*n*1.2 + id * 2.)*.9*n)) - rad;
    d = smin(d, circ);

    float mat = MAT_WALLS;
    // if (d == circ) {
    //     mat = MAT_BALL;
    // }

    return vec3(d, id, mat);
}


vec3 GetDist(vec3 p) {
    // return renderSquareTunnel(p);
    return renderSolidTunnel(p);
}

vec4 RayMarch(vec3 ro, vec3 rd) {
	float dO=0.;
    vec3 res = vec3(0.);
    float k = 0.;

    for(int i=0; i<MAX_STEPS; i++) {
    	vec3 p = ro + rd*dO;
        res = GetDist(p);
        float dS = res.x;
        dO += dS*.7;
        k += 1.;
        if(dO>MAX_DIST || abs(dS)<SURF_DIST) break;
    }

    return vec4(dO, res.y, res.z, k);
}

vec3 GetNormal(vec3 p) {
	float d = GetDist(p).x;
    vec2 e = vec2(.001, 0);

    vec3 n = d - vec3(
        GetDist(p-e.xyy).x,
        GetDist(p-e.yxy).x,
        GetDist(p-e.yyx).x);

    return normalize(n);
}

vec3 GetRayDir(vec2 uv, vec3 p, vec3 l, float z) {
    vec3 f = normalize(l-p),
        r = normalize(cross(vec3(0,1,0), f)),
        u = cross(f,r),
        c = f*z,
        i = c + uv.x*r + uv.y*u,
        d = normalize(i);
    return d;
}

vec3 Transform(vec3 p) {
    if (SINGLE_SCENE == true) {
        return p;
    }
     return p + vec3(0. + cos(iTime)*.2,0. + sin(iTime)*.3,-iTime*2.);
}

vec3 starsLayer(vec2 ouv) {
    vec3 col = vec3(0.);

    vec2 uv = fract(ouv) - .5;

    float d;

    for(int x = -1 ; x <= 1; x++) {
        for(int y = -1 ; y <= 1; y++) {
            vec2 offset = vec2(x,y);
            vec2 id = floor(ouv) + offset;
            float n = n21(id);
            if (n > .6) {
                float n1 = fract(n*123.432);
                float n2 = fract(n*1234.2432);

                float size = .01 + 0.05 * (n1 - .5);

                vec2 shift = vec2(n1 - .5, n2 - .5);
                d = max(d, size/length(uv - offset + shift));
            }
        }
    }


    return col + d*vec3(1., 1., 1.);
}

vec3 backgroundStars(vec2 uv) {
    vec3 col = vec3(0.);

    float t = iTime * (15. / 30.);

    float layers = 3.;

    for(float i = 0. ; i < 1. ; i+= 1./layers) {
        float depth = fract(i + t);
        float scale = mix(20., .5, depth);
        float fade = depth * smoothstep(1., .9, depth);

        col += starsLayer(uv * scale + i * 456.32) * fade;
    }
    return col;
}

vec3 getBackground(vec2 uv) {
    return backgroundStars(uv);
    vec3 col = vec3(0.);
    uv.xy *= 30.;

    vec2 id = floor(uv);
    uv = fract(uv) - .5;

    float n = clamp(n21(id) - .4, 0., 1.);

    // n = texture(iChannel1, (id + vec2(iTime, 0.))/3.).r;

    float s = 1. - step(n/2., length(uv + vec2(.1, .1)) );
    // float s = step(.1, pow(1./(length(uv) - .1), 1.1));

    col.r = s;

    return col;
}


vec3 renderPlasma(vec2 uv) {
    for(float i = 1.0; i < 3.0; i++){
        uv.x += .6 / i * cos(i * 2.5* uv.y + iTime);
        uv.y += 0.6 / i * cos(i * 3.5 * uv.y + iTime);
    }
    // uv.x -= iTime/100.;
    vec3 col = .5 + 0.5*sin(iTime*5. + uv.yyy + vec3(iTime,2. + iTime,4. + iTime));
    return col/(2.1*abs(cos(iTime-uv.x)));
    // return col/(2.1*abs(cos(uv.x * 2.)));
}

vec3 renderField(vec2 uv, float index) {
    vec3 col = vec3(.0);

    vec2 ouv = uv;
    float l = pow(TUNNEL_SPEED/length(uv), .30);
    float a = atan(uv.x, uv.y);

    float warp = iTime / 3.;

    // uv = vec2(a - sin(abs(uv.x*uv.y)/58.), l + warp);
    // uv = vec2(a - abs(uv.y/30.)*sin(iTime*5.)*cos(iTime*3. + uv.x/2.), l + warp);
    // uv = vec2(a, l + warp + uv.x*uv.y/10.);
    uv = vec2(a, l + warp);

    ouv = uv;

    vec2 cells = vec2(10., 10.);

    uv *= cells;

    vec2 id = floor(uv);
    uv = fract(uv);

    float n = n21(id + index * 100.);
    float n1 = fract(n*123.543 + index * 2.);
    float n2 = fract(n*4435.332 + index * 4.);

    if (index == 2.) {
        col.rgb = renderPlasma(ouv/2.)*l/15.; //*smoothstep(0.3, .9, ouv.x);
    }

    if ((n + n1) < .5) {
        return col.rgb + vec3(sin(iTime + a)*.1, 0., 0.);
    }

    if ((n + n1) > 1.5) {
        return col.rgb + vec3(0., sin(iTime - a )*.1, 0.);
    }

    float star = step(uv.x, n) - step(uv.x, n-.05);
    star *= step(uv.y, n1) - step(uv.y, n1-(.3*n2));

    col.rgb += vec3(star) * (1. - l/2.);
    // col.rgb = vec3(step(length(uv - vec2(n1,n2)), .1*n2)) * .4;



    return col;
}

vec3 renderTunnelTexture(vec2 uv) {

    // uv.y += sin(iTime)*.02;
    // uv.x += cos(iTime/2.)*.05;

    vec3 col = vec3(0.);
    col.rgb =
        renderField(uv, 0.)
        + renderField(uv*13., 1.)
        + renderField(uv/3., 2.);

    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
	vec2 m = iMouse.xy/iResolution.xy;

    vec3 ro = vec3(0, 3, -3);
    ro.yz *= Rot(-m.y*3.14+1.);
    ro.xz *= Rot(-m.x*6.2831);

    vec3 rd = GetRayDir(uv, ro, vec3(0,0.,0), 1.);
    vec3 col = vec3(0);

    vec4 rm = RayMarch(Transform(ro), rd);
    float d = rm.x;
    float k = rm.a;
    float mat = rm.z;
    float id = abs(rm.y);

    if(d<MAX_DIST) {
        vec3 p = Transform(ro) + rd * d;
        vec3 n = GetNormal(p);
        vec3 r = reflect(rd, n);
        vec3 ref = backgroundStars(Transform(r).xy*2.) /  texture(iChannel0, Transform(r).xy).rgb;

        float dif = dot(n, normalize(vec3(1,2,3)))*.5+.5;
        vec3 sc = clamp(vec3(sin(id*10.) + .2, cos(id*20.), cos(id)/sin(id)), vec3(0.0, .3, 0.), vec3(1., .1, 0.3));
        if (mat == MAT_WALLS) {
            col = vec3(dif) * (1. - k/40.);
            col *= sc;
            col *= ref * 5.;
        } else {
            col = vec3(dif) * ref * sc;
        }
    } else {
            uv.xy *= Rot(iTime/3.);
            col = getBackground(uv * 2.) / texture(iChannel0, uv).rgb;
        }

    col = pow(col, vec3(.4545));	// gamma correction
    // col *= p;

    fragColor = vec4(col,1.0);
}