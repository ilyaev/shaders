
float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}

float distanceFromSegment(vec2 U, vec2 A, vec2 B)
{
	vec2 UA = U - A;
    vec2 BA = (B - A);

    float s = dot(UA, BA) / length(BA);
    s = s / length(BA);
    s = clamp(s, 0., 1.);
    return length(UA - s*BA);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec3 col = vec3(.0);

   // uv.x += iTime/10.;

    float l = length(uv);
    float a = atan(uv.x, uv.y);

    uv = vec2(a / 3., l - iTime/50.);

    vec2 cells = vec2(20., 20.);

    uv *= cells;

    vec2 id = floor(uv);
    uv = fract(uv);

    float current = id.x;
    float prev = id.x - 1.;
    float next = id.x + 1.;

    float n = n21(id);
    float nN = n21(vec2(id.x, id.y + 1.));

    float cX = clamp(n, .3, .7);
    float nX = clamp(n21(vec2(next, id.y)), .3, .7);

    float mX = fract(n * 123.232);
    float mXn = fract(nN * 123.232);

    float px_size = 1. / (iResolution.y / cells.y);

    float topLine = step(distanceFromSegment(uv, vec2(0., cX), vec2(mX, cX)), px_size);
    topLine += step(distanceFromSegment(uv, vec2(mX, nX), vec2(1., nX)), px_size);
    topLine += step(distanceFromSegment(uv, vec2(mX, cX), vec2(mX, nX)), px_size);

    float lefTLine = step(distanceFromSegment(uv, vec2(mX, 0.), vec2(mX, .5)), px_size);
    lefTLine += step(distanceFromSegment(uv, vec2(mXn, 0.5), vec2(mXn, 1.)), px_size);
    lefTLine += step(distanceFromSegment(uv, vec2(mX, 0.5), vec2(mXn, .5)), px_size);

    // if (id.x == floor(iTime - 8.)) {
    //     topLine *= 1. - abs(fract(iTime) - uv.x/2.);
    // }

    col.r = topLine;

    col.r += lefTLine;

    col.r = 0.;

    vec2 dd = abs(vec2((cX + nX) / (2. - sin(iTime + id.y*3.)*.3), (mX + mXn)/(2. - cos(iTime + id.x*10.)*.3)));

    // col.g += step(distance(uv, dd), px_size * 4.) * .5;

    col.g += step(distanceFromSegment(uv, vec2(0., cX), vec2(1., nX)), px_size);
    col.g *= abs(sin(id.y/2. + iTime));
    //uv.x -= .5;

    // col.r = step(uv.x, .05) + step(.95, uv.y);
    // col.g += clamp(n21(id), 0., .2);

    float d = distance(id, vec2(0. + iTime*2., 0.));

    // col.rgb *= step(d, 5. + sin(iTime)*3.) - step(d, 3. + sin(iTime)*3.);

    fragColor = vec4(col, 1.);
}