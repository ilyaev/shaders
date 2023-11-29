#iChannel0 "file://st_texture3.png"
precision mediump float;
#define PI 3.14159265359
#define PI2 PI*2.
#define MAX_STEPS 100
#define MIN_DIST 0.001
#define FAR_DIST 10.


struct sCamera {
    vec3 ro;
    vec3 rd;
    vec3 lookat;
    float zoom;
};

sCamera setupCamera(vec2 uv, vec3 ro, vec3 lookat, float zoom) {
    sCamera camera;
    camera.ro = ro;
    camera.lookat = lookat;
    camera.zoom = zoom;


    vec3 f = normalize(lookat - ro);
    vec3 r = normalize(cross(vec3(0., 1., 0.), f));
    vec3 u = cross(f, r);
    vec3 c = ro + f * zoom;
    vec3 i = c + uv.x*r + uv.y * u;
    vec3 rd = normalize(i - ro);

    camera.rd = rd;

    return camera;
}
mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

vec3 Transform(vec3 p) {
    // p.z += 5.*sin(iTime);
    // p.x += 3.*cos(iTime);
    // p.x += 2.5;
    // p.yz *= rotate2d(iTime);
    // p.x -= 2.5;
    // p.y += sin(iTime);
    return p;
}





float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}

float smoothNoise(vec2 uv) {
    vec2 lv = smoothstep(0., 1., fract(uv));
    vec2 id = floor(uv);

    float bl = n21(id);
    float br = n21(id + vec2(1.,0.));
    float b = mix(bl, br, lv.x);

    float tl = n21(id + vec2(0.,1.));
    float tr = n21(id + vec2(1.,1.));
    float t = mix(tl, tr, lv.x);

    float n = mix(b, t, lv.y);
    return n;
}

vec3 cellColor(vec2 cell, float index) {
    float n = n21(cell);
    float fade = 1.;

    float nt = n21(vec2(ceil(iTime), index));
    float ntt = n21(vec2(ceil(iTime)+ 1., index));
    float baseCur = nt * 10.;
    float baseNext = ntt * 10.;
    float base = mix(baseCur, baseNext, fract(iTime));


    if (cell.x > (base + n * 35.)) {
        fade =  step(n, (1. - min(1., cell.x/(60. + (cell.x - 30.)))));
    }
    if (n > .5) {
        return vec3(0.3*n, .3*n, .1*n) * fade;
    }

    return vec3(0., 0.1, n) * fade;
}

vec3 starsField(vec2 uv, vec2 shift) {
    vec2 id = floor(uv);
    vec2 starsuv = fract(uv);
    vec3 col = vec3(0.);
    float n = n21(id * shift) - .5;
    // float n = texture(iChannel0, vec2(id/200.)).r;

    float d = length(starsuv - .5 - vec2(n, fract(n * 23423.) - .5));
    float star = fract(n * 123.2) * .03 - .015;

    if (star > 0.001) {
        col += pow(star/d, 2.3 - sin(iTime + n*10.)*(n + .3)) * vec3(5., 5., 5. + step(star, .01) * 20.);
    }
    return col;
}

vec3 vStar(vec2 uv, float index) {
    // vec2 uv = (fragCoord.xy - 0.5*iResolution.xy) / iResolution.y;

    float d = length(uv); //*sin(uv.x/2.+uv.y/2. + .6)) + .8;
    float size = 2.5;

    float colls = floor(15. * (d + .3));

    vec2 cellSize = vec2(60., colls);

    float a = (atan(uv.x, uv.y) + PI) / PI;
    vec2 id = vec2(floor(d*cellSize.x), floor(a/2. * cellSize.y));

    uv.xy *= rotate2d(iTime * sin(id.x));
    // uv.y *= sin(iTime);

    a = (atan(uv.x, uv.y) + PI) / PI;
    id = vec2(floor(d*cellSize.x), floor(a/2. * cellSize.y));

    float nextY = id.y + 1.;

    if (nextY == cellSize.y) {
        // id.y = cellSize.y - 1.;
        nextY = 0.;
    }

    vec2 nextCell = vec2(id.x, nextY);

    vec2 cUv = vec2(fract(d * cellSize.x), fract(a/2. * cellSize.y));

    vec3 col = cellColor(id, index);
    vec3 nextColor = cellColor(nextCell, index);


    vec3 c = mix(col, nextColor, cUv.y) * 3.;
    // c = nextColor;

    vec3 color = c * (1. - smoothstep(size/20., size, d*(1.5 - .7*sin(index*10. + iTime))));
    return color;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}


vec3 getDist(vec3 p) {
    float material = 0.;
    // float dK = length(p) - .4;
    float c = .3;
    vec3 l = vec3(0., 13., 13.);
    vec3 q = p - c * clamp(round(p/c), -l, l);
    vec2 id = round(p/vec3(c)).xy;
    // q.xz *= rotate2d(sin(id.x));
    float dK = sdBox(q, vec3(.2 + .1*sin(id.y/3. + iTime*4.),.1,.1));
    float d = dK;
    if (d == dK) {
        material = 1.;
    }
    return vec3(d, material, 0.);
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.01, 0.);
    float d = getDist(p).x;
    vec3 n = d - vec3(
        getDist(p - e.xyy).x,
        getDist(p - e.yxy).x,
        getDist(p - e.yyx).x
    );
    return normalize(n);
}



vec4 trace(vec3 ro, vec3 rd) {

    float dt, d;
    vec3 p;

    vec3 dist;

    for(int i = 0 ; i < MAX_STEPS ; i++) {
        p = ro + rd * dt;
        dist = getDist(p);
        dt += dist.x * .7;
        if (dist.x < MIN_DIST || dist.x > FAR_DIST) {
            break;
        }
    }

    return vec4(dist.x, dt, dist.xy);
}

vec3 getAlbedoByMaterial(float material, vec3 p, vec3 rd, vec3 normal) {
    vec3 albedo = vec3(1.);
    float size = 8.;
    if (material == 1.) {

        if (normal.x == 0. && normal.y == 0.) {
            albedo = vec3(1.);
        } else {
            albedo = vec3(1.);
        }
    } else if (material == 0.) {
        albedo *= vec3(.1, .5, .0);
    }
    return albedo;
}

vec3 getLightColor(vec3 p, vec3 n, vec3 lightPos) {
    // vec3 lightPos = ;
    vec3 l = normalize(lightPos - p);
    float dif = clamp(0., 1., dot(n,l));

    float distanceToLight = trace(p + n * (MIN_DIST*2.), l).x;
    if (distanceToLight < length(lightPos - p)) {
        dif *= .5;
    }

    return vec3(dif);
}

vec3 getSpecularColor(vec3 p, vec3 n, vec3 lightPos, vec3 viewPos) {
    vec3 spec = vec3(0.);
    float specularStrength = 0.5;

    vec3 viewDir = normalize(p - viewPos);
    vec3 reflectDir = reflect(normalize(lightPos - p), n);
    float specValue = pow(max(dot(viewDir, reflectDir), 0.), 32.);


    return spec + specularStrength * specValue;
}

vec3 getNormalByMaterial(float material, vec3 p) {
    vec3 normal = vec3(0., 1., 0.);
    if (material == 1.) {
        normal = getNormal(p);
    }
    return normal;
}

vec3 scene3d(vec2 uv) {
    vec2 mouse = iMouse.xy/iResolution.xy;

    vec3 col = vec3(-1.);

    sCamera camera = setupCamera(uv, vec3(2.*sin(PI2 * mouse.x),cos((PI/2.)*mouse.y),-2.*cos(PI2 * mouse.x)), vec3(0., 0., 0.), .5);

    vec4 tr = trace(Transform(camera.ro), camera.rd);
    float materialID = tr.a;
    float distanceTo = tr.y;

    vec3 lightPos = vec3(1., 1., 1.5);

    if (tr.x < MIN_DIST) {
        vec3 p = Transform(camera.ro) + camera.rd * distanceTo;
        vec3 normal = getNormalByMaterial(materialID, p);
        vec3 albedo = getAlbedoByMaterial(materialID, p, camera.rd, normal);
        vec3 diffuse = getLightColor(p, normal, lightPos);
        vec3 specular = vec3(0.);//getSpecularColor(p, normal, lightPos, camera.ro);
        float ambient = .1;
        float fade = 1.;

        col = clamp(vec3(0.), vec3(1.), (ambient + diffuse + specular) * albedo) * fade;
    }
    return col;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy / .5 - 1.;

    uv.x *= iResolution.x / iResolution.y;

    // coolbg vec3(0.1, .1, 0.2)

    vec3 color = vec3(0.1, .1, 0.2)*pow(.8/(uv.y + .8 + sin(iTime*.3) * .1), 2.);

    for(float i = 1.; i < 4. ; i++) {
        float t = iTime * sin(i)*cos(i+3.)/12.;
        float n2 = n21(vec2(i,313.) + ceil(t));
        float n1 = n21(vec2(i,313.) + ceil(t + 1.));
        float nn2 = fract(n2 * 123.32);
        float nn1 = fract(n1 * 123.32);
        vec2 xy1 = vec2(n2*3. - 1.5, nn2*3. - 1.5);
        vec2 xy2 = vec2(n1*3. - 1.5, nn1*3. - 1.5);
        vec2 xy = mix(xy1, xy2, fract(t));
        color = max(color, vStar(uv*(2. + sin(t)) + xy, i));
    }

    // color = max(color, );

    // stars
    float size = 10.;
    float tt = iTime * .3;
    vec3 sfFrom = starsField(uv * vec2(size, size)*1., vec2(floor(tt + 1.)));
    vec3 sfTo = starsField(uv * vec2(size, size)*1., vec2(floor(tt + 2.)));
    color = max(color, mix(sfFrom, sfTo, fract(tt)));
    // size *= 4.;
    // color = max(color, starsField(uv * vec2(size, size)*1.5));
    size *= 2.;
    color = max(color, starsField(uv * vec2(size, size)*1.5, vec2(1.)));




    float groundMask = 0.;
    vec3 ground = vec3(0.);
    for(float i = 1.; i < 4. ; i++) {
        float n = texture(iChannel0, vec2(uv.x/8. + iTime/i/24./3., (uv.y + i*5.3)/80.)).b * .5;
        // n = smoothNoise(vec2(uv.x*(2. + i/2.) + iTime/i/3., i*3. + 3.))*.3;
        float mask = 1. - step(n, uv.y + 1.1 - i*.2);
        groundMask = max(groundMask, mask);
        if (ground.x == 0.) {
            ground = (.37 - vec3(.13 * i, .15*i, .15*i)) * groundMask;
        }
    }


    color = (1. - groundMask) * color + groundMask * ground;

    // vec3 scenecolor = scene3d(uv);

    // if (scenecolor.r != -1.) {
    //     color = scenecolor;
    // }

    fragColor = vec4(color, 1.0) ;
}