precision mediump float;
#define PI 3.14159265359

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy / .5 - 1.;
    uv.x *= iResolution.x / iResolution.y;

    // make a tube
    float f = 1. / length(uv);

    // add the angle
    // f += atan(uv.x, uv.y) / acos(0.);

    // let's roll
    f -= iTime;

    // make it black and white
    // old version without AA: f = floor(fract(f) * 2.);
    // new version based on Shane's suggestion:
   	// f = 1. - clamp(sin(f * PI * 2.) * dot(uv, uv) * iResolution.y / 15. + .5, 0., 1.);
	f = floor(fract(f) * 2.);

	// f += cos(floor((1.0 - fract(f) * 2.)));

    // add the darkness to the end of the tunnel
    f *= sin(length(uv) - .1);


    fragColor = vec4(f, f, f, 1.0);
}