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
    vec3 col = vec3(0.58, 0.7, 1.0);

    // clouds ///////////////////////////////////////////////////////
    float midlevel;
    float h;
    float disp;
    float dist;
    float t = iTime*4.0;
    vec2 uv2;

    // c1
    midlevel = 1.0;
    disp = 5.0;
    dist = 100.0;
    uv2 = uv + vec2(t/dist + 3.5, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(1.0, 0.94, 0.91);
    if(uv.y < h + midlevel - 0.1) col = vec3(0.92, 0.85, 0.82);

    // c2
    midlevel = 0.9;
    disp = 3.0;
    dist = 70.0;
    uv2 = uv + vec2(t/dist + 7.0, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(0.74, 0.35, 0.30);
    if(uv.y < h + midlevel - 0.05) col = vec3(0.60, 0.30, 0.27);
    if(uv.y < h + midlevel - 0.1) col = vec3(0.56, 0.25, 0.22);

    // c3
    midlevel = 0.8;
    disp = 2.7;
    dist = 60.0;
    uv2 = uv + vec2(t/dist + 9.5, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(1.0, 0.76, 0.60);
    if(uv.y < h + midlevel - 0.1) col = vec3(0.93, 0.58, 0.35);

    // c4
    midlevel = 0.7;
    disp = 2.7;
    dist = 50.0;
    uv2 = uv + vec2(t/dist + 12.0, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(0.80, 0.40, 0.34);
    if(uv.y < h + midlevel - 0.04) col = vec3(0.73, 0.36, 0.30);

    // c5
    midlevel = 0.75;
    disp = 3.5;
    dist = 45.0;
    uv2 = uv + vec2(t/dist + 15.5, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(1.0, 0.62, 0.44);
    if(uv.y < h + midlevel - 0.1) col = vec3(0.90, 0.55, 0.40);
    if(uv.y < h + midlevel - 0.15) col = vec3(0.98, 0.50, 0.24);
    if(uv.y < h + midlevel - 0.2) col = vec3(1.0, 0.55, 0.33);

    // c6
    midlevel = 0.6;
    disp = 2.0;
    dist = 40.0;
    uv2 = uv + vec2(t/dist + 18.0, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(1.0, 0.76, 0.60);
    if(uv.y < h + midlevel - 0.1) col = vec3(0.95, 0.66, 0.48);

    // c7
    midlevel = 0.5;
    disp = 2.5;
    dist = 35.0;
    uv2 = uv + vec2(t/dist + 18.0, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(1.0, 0.48, 0.35);
    if(uv.y < h + midlevel - 0.05) col = vec3(0.98, 0.42, 0.28);
    if(uv.y < h + midlevel - 0.1) col = vec3(0.88, 0.38, 0.24);

    // c8
    midlevel = 0.5;
    disp = 2.3;
    dist = 30.0;
    uv2 = uv + vec2(t/dist + 20.5, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(0.99, 0.29, 0.20);
    if(uv.y < h + midlevel - 0.04) col = vec3(0.80, 0.24, 0.17);
    if(uv.y < h + midlevel - 0.08) col = vec3(0.53, 0.35, 0.32);
    if(uv.y < h + midlevel - 0.12) col = vec3(0.41, 0.27, 0.27);

    // c9
    midlevel = 0.45;
    disp = 2.0;
    dist = 25.0;
    uv2 = uv + vec2(t/dist + 23.0, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(1.0, 0.62, 0.44);
    if(uv.y < h + midlevel - 0.04) col = vec3(0.98, 0.57, 0.36);

    // c10
    midlevel = 0.35;
    disp = 3.5;
    dist = 20.0;
    uv2 = uv + vec2(t/dist + 27.5, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(0.77, 0.48, 0.46);
    if(uv.y < h + midlevel - 0.04) col = vec3(0.66, 0.42, 0.40);
    if(uv.y < h + midlevel - 0.08) col = vec3(0.55, 0.42, 0.41);
    if(uv.y < h + midlevel - 0.12) col = vec3(0.43, 0.32, 0.31);

    // c11
    midlevel = 0.35;
    disp = 1.0;
    dist = 15.0;
    uv2 = uv + vec2(t/dist + 30.0, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(0.95, 0.80, 0.77);
    if(uv.y < h + midlevel - 0.04) col = vec3(0.98, 0.76, 0.64);

    // c12
    midlevel = 0.3;
    disp = 0.9;
    dist = 10.0;
    uv2 = uv + vec2(t/dist + 32.5, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(0.95, 0.45, 0.30);
    if(uv.y < h + midlevel - 0.07) col = vec3(0.88, 0.38, 0.24);
    if(uv.y < h + midlevel - 0.1) col = vec3(0.68, 0.28, 0.19);
    if(uv.y < h + midlevel - 0.14) col = vec3(0.48, 0.19, 0.20);



    // train /////////////////////////////////////////////////////////////////////
    float k;
    uv.y -= 0.2;
    // choo choo
    k = 1.0;
    uv2 = fract(uv*9.0);
    float wagon = 1.0;
    wagon *= 1.0 - step(0.45, uv.x);
    wagon *= 1.0 - step(0.115, uv.y);
    wagon *= step(0.103, uv.y);
    wagon *= step(0.05, 1.0 - abs(uv2.x*2.0 - 1.0));

    float join = 1.0;
    join *= 1.0 - step(0.45, uv.x);
    join *= 1.0 - step(0.11, uv.y);
    join *= step(0.107, uv.y);


    float roof = 1.0;
    roof *= 1.0 - step(0.45, uv.x);
    roof *= 1.0 - step(0.117, uv.y);
    roof *= step(0.11, uv.y);
    roof *= step(0.15, 1.0 - abs(uv2.x*2.0 - 1.0));

    float loco = 1.0;
    loco *= 1.0 - step(0.5, uv.x);
    loco *= step(0.45, uv.x);
    loco *= 1.0 - step(0.112, uv.y);
    loco *= step(0.103, uv.y);

    float chem1 = 1.0;
    chem1 *= 1.0 - step(0.495, uv.x);
    chem1 *= step(0.49, uv.x);
    chem1 *= 1.0 - step(0.12, uv.y);
    chem1 *= step(0.103, uv.y);

    float chem2 = 1.0;
    chem2 *= 1.0 - step(0.496, uv.x);
    chem2 *= step(0.488, uv.x);
    chem2 *= 1.0 - step(0.123, uv.y);
    chem2 *= step(0.12, uv.y);

    float locoRoof = 1.0;
    locoRoof *= 1.0 - step(0.47, uv.x);
    locoRoof *= step(0.443, uv.x);
    locoRoof *= 1.0 - step(0.117, uv.y);
    locoRoof *= step(0.11, uv.y);



    col = mix(col, vec3(0.18, 0.12, 0.15), join);
    col =  mix(col, vec3(0.48, 0.19, 0.20), wagon);
    col = mix(col, vec3(0.18, 0.12, 0.15), roof);

    col = mix(col, vec3(0.38, 0.19, 0.20), loco);
    col = mix(col, vec3(0.38, 0.19, 0.20), chem1);
    col = mix(col, vec3(0.18, 0.12, 0.15), locoRoof);
    col = mix(col, vec3(0.18, 0.12, 0.15), chem2);
    // loco smoke //////

    dist = 5.0;
    uv2 = uv + vec2(t/dist + 3.5, 0.0);
    uv2.x -= t/dist*0.2;
    h = fbm2(uv2, 8) - 0.55;

    if(uv.x < 0.49){
        float x = -uv.x + 0.49;
        float y = abs(uv.y + h*0.4 - 0.16*sqrt(x) - 0.12) - 0.7*x*exp(-x*10.0);
        if(y < 0.0) col = vec3(1.0, 0.94, 0.91);
        if(y < - 0.02) col = vec3(0.92, 0.85, 0.82);
    }

    //bridge ///////
    dist = 5.0;
    uv2 = uv + vec2(t/dist + 32.5, 0.0);
    uv2.x = fract(uv2.x*3.0);
    k = 1.0;
    k *= smoothstep(0.001, 0.003, abs(uv2.y - pow(uv2.x - 0.5, 2.0)*0.15 - 0.12));
    k *= min(step(0.05, 1.0 - abs(uv2.x*2.0 - 1.0))
         +   step(0.17, uv2.y), 1.0);
    k *= min(smoothstep(0.02, 0.05, 1.0 - abs(uv2.x*2.0 - 1.0))
         +   step(0.177, uv2.y), 1.0);

    k *= min(step(0.1, uv2.y)
           + smoothstep(-0.09, -0.085, -uv2.y - 0.001/(1.0 - abs(uv2.x*2.0 - 1.0))), 1.0);

    k *= min(smoothstep(0.05, 0.3, 1.0 - abs(fract(uv2.x*16.0)*2.0 - 1.0))
         +   step(0.12, uv2.y - pow(uv2.x - 0.5, 2.0)*0.15)
         +   step(-0.1, -uv2.y), 1.0);
    col = mix(vec3(0.29, 0.09, 0.08), col, k);



    // clouds foreground //////////////////////////////////////////////////////////////
    // c13
    midlevel = 0.05;
    disp = 1.7;
    dist = 4.0;
    uv2 = uv + vec2(t/dist + 38.0, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(0.95, 0.80, 0.77);
    if(uv.y < h + midlevel - 0.04) col = vec3(0.98, 0.76, 0.64);
    if(uv.y < h + midlevel - 0.1) col = vec3(0.95, 0.66, 0.48);

    // c14
    midlevel = -0.1;
    disp = 1.7;
    dist = 2.0;
    uv2 = uv + vec2(t/dist + 40.0, 0.0);
    h = (fbm(uv2, 8) - 0.5)*disp;
    if(uv.y < h + midlevel) col = vec3(0.77, 0.48, 0.46);
    if(uv.y < h + midlevel - 0.04) col = vec3(0.66, 0.42, 0.40);
    if(uv.y < h + midlevel - 0.08) col = vec3(0.55, 0.42, 0.41);
    if(uv.y < h + midlevel - 0.12) col = vec3(0.43, 0.32, 0.31);


    // Output to screen
    uv = fragCoord/iResolution.xy;
    col *= 0.5 + 0.5*pow( 16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y), 0.3 );
    fragColor = vec4(col,1.0);
}