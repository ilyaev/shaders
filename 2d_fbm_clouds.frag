#iChannel0 "file://blue_noise.png"

float noise(vec2 x){
    vec2 f = fract(x);
    vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
    vec2 du = 30.0*f*f*(f*(f-2.0)+1.0);

    vec2 p = floor(x);
	float a = texture(iChannel0, (p+vec2(0.0, 0.0))/1024.0).x;
	float b = texture(iChannel0, (p+vec2(1.0,0.0))/1024.0).x;
	float c = texture(iChannel0, (p+vec2(0.0,1.0))/1024.0).x;
	float d = texture(iChannel0, (p+vec2(1.0,1.0))/1024.0).x;


	return a+(b-a)*u.x+(c-a)*u.y+(a-b-c+d)*u.x*u.y;
}

float fbm(vec2 x, int detail){
    float a = 0.0;
    float b = 1.0;
    float t = 0.0;
    for(int i = 0; i < detail; i++){
        float n = noise(x);
        a += b*n;
        t += b;
        b *= 0.7;
        x *= 2.0;

    }
    return a/t;
}

float fbm2(vec2 x, int detail){
    float a = 0.0;
    float b = 1.0;
    float t = 0.0;
    for(int i = 0; i < detail; i++){
        float n = noise(x);
        a += b*n;
        t += b;
        b *= 0.9;
        x *= 2.0;

    }
    return a/t;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.y;
    //uv.x += iTime;
    vec3 col = vec3(0.58, 0.7, 1.0); // SKY

    // clouds ///////////////////////////////////////////////////////
    float midlevel;
    float h;
    float disp;
    float dist;
    float t = iTime*4.0;
    vec2 uv2;

    // c1
    midlevel = .5;
    disp = 5.0;
    dist = 100.0;
    uv2 = uv*1. + vec2(t/dist + 3.5, 0.0);
    h = (fbm(uv2, 5) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(1.0, 0.94, 0.91);
    if(uv.y < h + midlevel - 0.02) col = vec3(0.92, 0.85, 0.82);

    // col = vec3(h, (h + sin(uv.x + cos(uv.y + iTime))), 0.);


    // Output to screen
    uv = fragCoord/iResolution.xy;
    col *= 0.5 + 0.5*pow( 16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y), 0.3 );
    fragColor = vec4(col,1.0);
}