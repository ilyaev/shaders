precision mediump float;
#define PI 3.14159265359

float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);

	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}


vec3 getColor(vec2 i_st) {
    // return vec3(0.5);
    return vec3(abs(sin(111.5 + i_st.y)), abs(cos(iTime + i_st.x * i_st.y)), abs(sin(iTime + i_st.x / i_st.y)));
}

float getMagnitude(vec2 i_st) {
    // return 1. + float(i_st.x);
    return 1. + abs(sin(iTime + i_st.x));// * abs(sin(iTime * 1.)) * 2.));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    float CELLS = 3.;
    float ratio = iResolution.x / iResolution.y;

    vec2 uv = CELLS * fragCoord.xy / iResolution.xy;
    uv.x *= ratio;

    vec2 i_st = floor(uv);
    vec2 f_st = fract(uv);

    float m_dist = 2.;
    vec3 color = vec3(0.);
    vec3 c_color = vec3(0.);
    float c_magnitude = 1.;
    float magnitude = 1.;

    int numBlobs = 0;
    vec2 center = vec2(CELLS/2., CELLS/2.);

    for(int y = -1; y <= 1 ; y++) {
        for(int x = -1 ; x <= 1 ; x++ ) {
            vec2 neighbour = vec2(float(x), float(y));
            vec2 cell = i_st + neighbour;
            // vec2 point = random2(cell);
            vec2 point = vec2(noise(vec2(iTime + cell.y + 0.01*cell.x, iTime + cell.x + 0.3 * cell.y)), noise(vec2(iTime + cell.x + 0.2 * cell.y, iTime + cell.y + 0.3 * cell.x)));//,random2(cell);
            // vec2 point = vec2(noise(vec2(cell.x + 0.3, iTime*uv.x)), noise(vec2(10. + CELLS + cell.y + 0.3, iTime*uv.y)));
            // vec2 point = vec2(0.5) + vec2(0.5)*vec2(sin(iTime + vec2(PI*2.+cell.x*cell.y)*cell));
            float magnitude = getMagnitude(cell);
            // float r = sin(iTime + atan(center.x - cell.x, center.y - cell.y)*3.) * magnitude*8.;
            vec3 cell_color = getColor(cell);
            float dist = length(neighbour + point - f_st) / magnitude;
            if (dist < magnitude/6.) {
                numBlobs += 1;
                vec3 next_color = cell_color;//(magnitude / 6. / pow(smoothstep(0.0,1.,dist),0.3)) * cell_color;
                // color = mix(color, next_color, 3.0 - dist);
                // color = mix(color, next_color, 1. - dist);
                // color = (color + next_color) / 2.;
                color = color * clamp(0.02, 1., dist*4.) + next_color * clamp(0.02, 1., (1.0 - dist*4.));
                // color = color * 0.5 + next_color * clamp(0.0, 1., (1.0 - dist*3.5));

                // color = color + next_color;
                // color = color + next_color * clamp(0.0, 1., (1.0 - dist*3.5));
            }
            if (dist < m_dist) {
                m_dist = dist;
                c_color = getColor(cell);
                c_magnitude = magnitude;
            }
        }
    }

    if (numBlobs > 1) {
        // color /= float(numBlobs);
    }


    // color = mix(vec3(0.), c_color, 1.0 - m_dist / c_magnitude);
    // color += vec3(1. - pow(m_dist,.3));
    // color += vec3(m_dist);
    // color += vec3(step(0.2, m_dist) - step(0.21, m_dist));
    // color += vec3(step(0.75 + abs(sin(iTime + sin(uv.y*uv.x)*2. + cos(uv.y/uv.x) * 2.)) * 0.25, 1.0 - m_dist) - step(0., 1.0 - m_dist));
    // color += vec3(step(0.75, 1.0 - m_dist) - step(0., 1.0 - m_dist));
    // color += vec3(step(0.75 + noise(vec2(iTime, 0.75)) * 0.25, 1.0 - m_dist) - step(0., 1.0 - m_dist));
    // color += vec3(step(0.75 + noise(vec2((abs(sin(iTime + uv.x))) + uv.x/3. + uv.y*3., uv.y*2. + iTime*2.)) * 0.25, 1.0 - m_dist) - step(0., 1.0 - m_dist));
    // color += vec3(step(0.75 + noise(vec2(uv.x * 2. + iTime*2., uv.y*2. + iTime*2.)) * 0.25, 1.0 - m_dist) - step(0., 1.0 - m_dist));

    color += 1. - step(.01, m_dist);

    // color.r += step(0.99, f_st.x) + step(0.99, f_st.y);

    fragColor = vec4(color, 1.0);

}