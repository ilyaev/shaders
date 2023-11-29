precision mediump float;
#define PI 3.14159265359
#define PI2 6.28309265359


float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 + floor(1.), 4.1414))) * 43758.5453);
}

mat2 rot2d(float a) {
    return mat2(vec2(sin(a), cos(a)), vec2(-cos(a), sin(a)));
}

float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}


vec3 circle(vec2 uv) {
    uv += vec2(0.);

    // float c = 1. - step(.1, length(uv));
    // float c1 = 1. - step(.09, length(uv));

    // vec3 co = c * vec3(.9, 0., 0.);
    // if (c1 > 0.) {
    //     co = c1 * vec3(.0, .9, .3);
    // }

    // return co;

    // float d = 1. - step(.05, abs(length(uv) - .45)); // band
    float d = 1. - step(.5, length(uv));
    // d = pow(.05/abs(length(uv) - .45), 1.3);
    float a = atan(uv.x, uv.y) + PI;

    float segments = 18.;
    float sector = floor(segments * (a/PI2));


    vec3 color = vec3(0.);

    if (a < PI) {
        color = vec3(.9, .2, .1) * d;
    } else {
        color =vec3(.5, .6, .2) * d;
    }



    float box = sdBox(abs(uv * rot2d(PI/3.3)), vec2(.3, .5));
    if (a < PI/2. || (a > PI && a < PI + PI/2.)) {
        float d = (1. - step(.0, box));
        if (d > 0.) {
            color = d * vec3(.0, .4, .9);
        }
        color -= (1. - step(.0, abs(box) - .01)) * vec3(2.);
    }

    float box2 = sdBox(abs(uv * rot2d(-PI/5.)), vec2(.3, .5));
    float d1 = (1. - step(.0, box2));
    if ( a < PI && a > PI/2.) {
        if (d1 > 0.) {
            color = d1 * vec3(.5, .6, .2);
        }
        color -= (1. - step(.0, abs(box2) - .01)) * vec3(2.);

    }

    if ( a > PI + PI/2. ) {
        if (d1 > 0.) {
            color = d1 * vec3(.9, .2, .1);
        }
        color -= (1. - step(.0, abs(box2) - .01)) * vec3(2.);
    }


    color *= step(.01, abs(uv.x));
    color *= step(.01, abs(uv.y));


    return max(vec3(0.), color);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord ) {

    vec2 mouse = iMouse.xy/iResolution.xy;
    vec3 color = vec3(0.);

    vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y;


    color += circle(uv);// * rot2d(iTime));



    fragColor = vec4(color, 1.0);
}