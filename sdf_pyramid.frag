#iChannel0 "file://st_texture2.jpeg"
#define MAX_STEPS 200
#define MAX_DIST 150.
#define SURF_DIST .001
#define MAT_SAND  1.
#define MAT_PYRAMID  2.
#define MAT_DOME  3.
#define MAT_TOP 4.
#define MAT_STAR 5.
#define SINGLE_SCENE false
#define TUNNEL_SPEED .4
#define STAR_BLUE vec3(.2, .3, .9)
#define STAR_ORANGE vec3(.9, .3, .1)

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
}

vec3 renderHollowbox(vec3 p) {
    float d = 0.;
    float id = 1.;
    float mat = MAT_PYRAMID;
    // p.y *= -1.;
    p.xy *= Rot(abs(p.z) / 2.);
    float box = sdBox(p, vec3(1.));
    float ball = length(p) - 1.3;

    float hollowBox = max(box, -ball);

    d = hollowBox;

    return vec3(d, id, mat);
}

vec3 drawStar(vec2 uv, vec2 id, vec2 pos, float size, vec3 color) {
    vec3 col = vec3(0.);
    if (id.x == pos.x && id.y == pos.y) {
        // col += step(length(uv - .5) - .1, .3);
        float d = length(uv - .5);
        col += pow(size/d, 4.2) * color;
    }
    return col;
}

vec3 drawOrion(vec2 starsuv, vec2 id) {
    vec3 col = vec3(0.);
    vec2 pivot = vec2(22., 40.);
    col += drawStar(starsuv, id, pivot, .09, STAR_BLUE);
    col += drawStar(starsuv, id, pivot + vec2(1., 2.), .11, STAR_ORANGE);
    col += drawStar(starsuv + vec2(-.2, .3), id, pivot + vec2(4., 0.), .08, STAR_BLUE);
    col += drawStar(starsuv, id, pivot + vec2(3., -2.), .13, STAR_BLUE);

    // BELT
    float blink = iTime * 2.;
    col += drawStar(starsuv + vec2(.25, .2), id, pivot + vec2(2., 0.), .06 + .02*sin(blink + 3.), STAR_BLUE);
    col += drawStar(starsuv + vec2(.0, .0), id, pivot + vec2(2., 0.), .06 + .02*sin(blink + 2.), STAR_BLUE);
    col += drawStar(starsuv + vec2(-.2, -.2), id, pivot + vec2(2., 0.), .06 + .02*sin(blink + 1.), STAR_BLUE);
    return col;
}

vec3 starsField(vec2 uv) {
    vec2 id = floor(uv);
    vec2 starsuv = fract(uv);
    vec3 col = vec3(0.);
    float n = n21(id) - .5;

    float d = length(starsuv - .5 - vec2(n, fract(n * 23423.) - .5));
    float star = fract(n * 123.2) * .03 - .015;

    if (star > 0.001) {
        col += pow(star/d, 3.3) * vec3(5., 5., 5. + step(star, .01) * 20.);//vec3(abs(sin(id.x)), abs(cos(id.x)), abs(sin(id.x + id.y))) * 5.;
    }
    return col;
}

vec3 fallingStars(vec2 uv) {

    // uv.yx *= Rot(iTime * .1);

    vec3 col = vec3(0.);
    vec2 id = floor(uv);
    uv = fract(uv);

    float n = n21(id - floor(iTime*10.));

    float speed = iTime + (id.x + id.y)*10.*fract(n * 2342.22);

    if (n < .03 && n21(vec2(floor(speed), iTime)) < .1) {
        if (n < 0.008) {
            uv.y *= -1.;
        }
        float width = .005;
        float d = abs(abs(uv.x + uv.y) - .5);
        float mask = smoothstep(.005, -.005, d - width );
        col += mask * 10.;
        col *= step(fract(speed) - .1, uv.x) - step(fract(speed)*3., uv.x);
    }

    // col += step(abs(uv.x + uv.y), .03) * 3.;

    // col += n;


    return col;
}

vec3 nebula(vec2 uv) {
    float speed = iTime * .1;
    for(float i = 1.0; i < 3.; i++){
        uv.x += .8 / i * cos(i * 3.5 * uv.y + speed);
        uv.y += 0.3 / i * cos(i * 4.5 * uv.x + speed);
    }
    uv.x = abs(uv.x);
    uv.y = abs(uv.y);
    vec3 col = 0.5 + 0.5*sin(speed*10.+uv.xyx+vec3(0,2,4));
    return col/(2.1*abs(cos(speed-uv.y-uv.x))) * .1;
}

vec3 skyTexture(vec3 p) {
    vec3 q1 = p;
    p = q1;
    vec3 col = vec3(.0);
    float x = acos(p.y/length(p));
    float y = atan(p.z, p.x) / 6.28;// + iTime*.1;
    vec2 uv = vec2(x, y) + .5;
    // uv = p.xz;

    float size = 10.;

    // stars
    col += starsField(uv * vec2(size, size * 6.28)*1.5);
    size *= 4.;
    col += starsField(uv * vec2(size, size * 6.28)*1.5);
    size /= 2.;
    col += starsField(uv * vec2(size, size * 6.28)*1.5);

    // orion
    size = 10.;
    vec2 orionuv = uv * vec2(size, size * 6.28)*1.5;
    vec2 id = floor(orionuv);
    orionuv = fract(orionuv);
    col += drawOrion(orionuv, id);

    //shooting stars
    size = 3.;
    col += fallingStars(uv * vec2(size, size * 6.28)*1.5);

    //nebulas
    col += nebula(uv + iTime*.1);

    return col;
}


vec4 renderPyramid(vec3 p) {
    float d = 0.;
    float mat = MAT_PYRAMID;
    vec3 l = vec3(1., 0., 0.);
    float c = 1.8;
    vec3 q = p - c * clamp(round(p/c), -l, l);


    float id = round(p.x / c);

    id += 2.;

    if (id == 3.) {
        q.y += .4;
        q.z += c * 2.2;
    }

    if (id == 2.) {
        // q.y += .1;
        q.z += c;
    }

    if (id == 1.) {
        q.y += .4;
    }

    q.y *= -1.;
    float beacon = length(q + vec3(.0, 0.1, 0.)) - .3;
    // q.y = abs(q.y);
    q.y /= 1.6;
    float pyramid = sdBox(q, clamp(vec3(q.y), vec3(0.001), vec3(.7)) + .01);
    float top = sdBox(q, clamp(vec3(q.y*1.04), vec3(0.001), vec3(.15)) + .01);


    float sand = p.y + 1.1 + sin(p.x/3. + cos(p.z) + 1.2 + iTime) * (.2 * min(1., max(0., abs(p.y*p.y)-.9)));

    float dome = length(p) - 100.;

    float ra = 0.;

    d = min(pyramid, sand);
    d = min(d, -dome);
    d = min(d, top);


    // d = min(d, beacon);

    if (d == sand) {
        mat = MAT_SAND;
    }

    if (d == -dome) {
        mat = MAT_DOME;
    }

    if (d == top) {
        mat = MAT_TOP;
    }


    if (min(d, beacon) == beacon) {
        // d = beacon;
        // mat = MAT_STAR;
        ra = length(q);// - vec3(.0, 0.05, 0.));
    }

    if (abs(sand - pyramid) < .01) {
        mat = MAT_SAND;
    }


    return vec4(d, id, mat, ra);
}



vec4 GetDist(vec3 p) {
    // return renderHollowbox(p);
    return renderPyramid(p);
}

mat4 RayMarch(vec3 ro, vec3 rd) {
	float dO=0.;
    vec4 res = vec4(0.);
    float k = 0.;

    for(int i=0; i<MAX_STEPS; i++) {
    	vec3 p = ro + rd*dO;
        res = GetDist(p);
        float dS = res.x;
        dO += dS*.7;
        k += 1.;
        if(dO>MAX_DIST || abs(dS)<SURF_DIST) break;
    }

    return mat4(vec4(dO, res.y, res.z, k), vec4(res.a), vec4(0.), vec4(0.));
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
    return p - vec3(1.2, -.1, .5);
    if (SINGLE_SCENE == true) {
        return p;
    }
     return p + vec3(0. + cos(iTime)*.2,0. + sin(iTime)*.3,-iTime*2.);
}



vec3 getBackground(vec2 uv) {
    return vec3(1.);
}

vec3 triPlanar(vec3 p, vec3 n) {
    vec3 colXZ = texture(iChannel0, p.xz * .5 + .5).xyz;
    vec3 colYZ = texture(iChannel0, p.yz * .5 + .5).xyz;
    vec3 colXY = texture(iChannel0, p.xy * .5 + .5).xyz;

    n = abs(n);

    n *= pow(n, vec3(20.));
    n /= n.x + n.y + n.z;

    vec3 col = n.z * colXY + colXZ * n.y + colYZ * n.x;

    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
	vec2 m = iMouse.xy/iResolution.xy;

    vec3 ro = vec3(0, 3, -3);

    // ro.yz *= Rot(-m.y*3.14+1.);
    // ro.xz *= Rot(-m.x*6.2831);


    ro.yz *= Rot(-.63*3.14+1.);
    ro.xz *= Rot(-.305*6.2831);

    ro.xy *= Rot(clamp(sin(iTime/3.), -1., 1.)*.05);
    ro.xz *= Rot(clamp(cos(iTime / 2.), -1., 1.)*.1);

    vec3 rd = GetRayDir(uv, ro, vec3(0,0.,0), 1.);
    vec3 col = vec3(0);

    mat4 rmAll = RayMarch(Transform(ro), rd);
    vec4 rm = rmAll[0];
    float d = rm.x;
    float k = rm.a;
    float mat = rm.z;
    float id = rm.y;

    float ra = rmAll[1].x;

    if(d<MAX_DIST) {
        vec3 p = Transform(ro) + rd * d;
        vec3 n = GetNormal(p);
        float dif = dot(n, normalize(vec3(1,2,3)))*.5+.5;

        vec3 sc = vec3(0.9, 0.5 ,0.1);
        if (mat == MAT_PYRAMID) {
            col = vec3(dif) * k/40.;
            col *= sc;
            col *= triPlanar(p + id, n);

            if (n21(vec2(floor(iTime), id)) < .07) {
                vec3 r = reflect(rd, n);
                vec3 refSky = skyTexture(Transform(r));
                vec3 icol = col * refSky * 5.;
                col = mix(col, icol, abs(sin(iTime*2. + id)));
            }

        }
        else if (mat == MAT_TOP) {
            col = vec3(dif) * k/40.;
            col *= vec3(1.);
            vec3 r = reflect(rd, n);
            vec3 refSky = skyTexture(Transform(r));
            col += refSky * 5.;
            col *= triPlanar(p, n);
        }
        else if (mat == MAT_DOME) {
            col = vec3(dif) * k/160.;
            col *= skyTexture(p) + vec3(0.,0.,.1 * sin(iTime/4.));// + vec3(.9, .3,.5 * cos(iTime/4.)) * .2;
            // col *= vec3(.2, .1, .1);
        }
         else {

            col = vec3(dif) * k/160.;
            col *= vec3(.7, .3, .1);

            // vec3 r = reflect(rd, n);
            // vec3 refSky = skyTexture(Transform(r));
            // col += refSky;

            // col
        }
        col = pow(col, vec3(.4545));	// gamma correction
    }

    if (ra > 0.) {
        col += vec3(pow((.05 + .02*sin(iTime*2. + id))/ra, 3.2)) * STAR_BLUE;
    }


    // col *= p;

    fragColor = vec4(col,1.0);
}