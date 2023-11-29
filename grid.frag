precision mediump float;
#define PI 3.14159265359


float grid(vec2 uv)
{
    #define VANTAGE vec2(0,-0.21)
    uv = uv - VANTAGE;
    vec2 duv = vec2(uv.x/uv.y, 1./tan(uv.y*3.14159));

    float v = smoothstep(0.95, 0.999, cos(duv.x*10.));
    v += smoothstep(0.95, 0.99, cos(duv.y*9.5));
    v *= smoothstep(0.04, -0.1, uv.y + pow(abs(uv.x*0.1), 2.));
    v += (1.-smoothstep(0., -0.1, uv.y + pow(abs(uv.x*0.1), 2.)))*0.4;

    return clamp(v, 0., 1.)* step(0.0, -uv.y);
}

float gridAA(vec2 uv)
{
    #define Xsamps 2
    #define Ysamps 2
    #define Xoff (2./float(2*Xsamps + 1)*float(i))
    #define Yoff (1./float(2*Ysamps + 1)*float(j))
    #define PXSIZE ( (vec2(1) / iResolution.xy) * (iResolution.x/iResolution.y) )

    float v = 0.0;
    for(int i=-Xsamps; i <= Xsamps; i++)
    for(int j=-Ysamps; j <= Ysamps; j++)
    {
        v += grid(uv + vec2(Xoff, Yoff) * PXSIZE);
    }

    return v / float((2*Xsamps + 1) * (2*Ysamps + 1));
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

	vec2 uvo = (fragCoord.xy * 2. / iResolution.xy) - vec2(1);
	vec2 uv = uvo * vec2(iResolution.x/iResolution.y, 1);

    vec3 color = vec3(0.1);

    color = vec3(gridAA(uv));

    fragColor = vec4(color, 1.0);

}