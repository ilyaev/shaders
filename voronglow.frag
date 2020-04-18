precision mediump float;
#define PI 3.14159265359

float GLOW = 0.7;//.15;

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}


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

vec3 getColor(vec2 i_st) {
    return vec3(abs(sin(111.5 + i_st.y)), abs(cos(iTime + i_st.x * i_st.y)), abs(sin(iTime + i_st.x / i_st.y)));
}

float getMagnitude(vec2 i_st, vec2) {
    // return 0.2 + abs(sin(i_st.x * 2. + iTime)) * 0.8;
    return 0.5 + noise(vec2(i_st.x + iTime + rand(i_st) * 0.5, i_st.y + iTime + rand(i_st) * 0.5)) * 0.5;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    float ratio = iResolution.x / iResolution.y;

    vec2 uv = 6. * fragCoord.xy / iResolution.xy;
    uv.x *= ratio;

    vec2 i_st = floor(uv);
    vec2 f_st = fract(uv);

    float m_dist = 0.34;
    vec3 color = vec3(0.0);
    vec3 c_color = vec3(0.);

    for(int y = -1 ; y <= 1 ; y++) {
        for(int x = -1 ; x <= 1 ; x++ ) {
            vec2 neighbour = vec2(float(x), float(y));
            // vec2 point = vec2(0.5) + vec2(0.5) * random2(i_st + neighbour) * sin(iTime * 10.);

            // vec2 point = vec2(0.5) + vec2(0.5) * random2(i_st + neighbour) * vec2(sin(iTime), cos(iTime));
            vec2 point = random2(i_st + neighbour);
            point = vec2(0.5) + vec2(0.5)*vec2(sin(iTime + vec2(PI*2.)*point));

            // point = 0.5;
            float dist = length(neighbour + point - f_st);
            // c_color = getColor(i_st + neighbour);
            if (dist < m_dist) {
                 m_dist = dist;
                c_color = getColor(i_st + neighbour);
            }

            float magnitude = getMagnitude(i_st + neighbour, uv);

            // color = mix(color, getColor(i_st + neighbour),  1. - dist);
            if (dist < magnitude) {
                // color += getColor(i_st + neighbour) * (.4 - dist) * 6.;
                vec3 nextColor = getColor(i_st + neighbour)* pow(magnitude - dist, 1./GLOW) * 3.;
                if ((nextColor.r + nextColor.g + nextColor.b) > 0.01) {
                    color += nextColor;
                }
                // color = mix(color, getColor(i_st + neighbour), pow(magnitude - dist, 1./.7) * 3.);
                //color = mix(color, getColor(i_st + neighbour), (.4 - dist)*3.);
            }
            // m_dist = min(m_dist, dist);
        }
    }

    // color += c_color;
    // color += vec3(m_dist);

     //color = mix(vec3(0.), c_color, 1.0 - m_dist * (2. + abs(sin(iTime * 4. + (uv.x - 0.5) * 0.5 / (uv.y - 0.5) / 2.) * 5.))) * 2.;
    //color = mix(vec3(0.), c_color, 1.0 - m_dist * (2. + abs(sin(iTime * 4. + (uv.x - 0.) * 2. / (uv.y + 0.) * 2.) * 5.))) * 2.;
    //  color = mix(vec3(0.), c_color, 1.0 - m_dist);
    // color += vec3(step(0.3, m_dist) - step(0.31, m_dist));

    // color += 1. - step(.01, m_dist);

     //color.r += step(0.97, f_st.x) + step(0.97, f_st.y);

    // color += dist;

    float cStart = 0.6;//abs(sin(iTime * 5. + sin(iTime + uv.x / 12.)));//0.6;
    float cShift = 0.02;//0.2 + sin(iTime * 5.) * 0.1;

    //fragColor = vec4(smoothstep(cStart,cStart + cShift,color) - smoothstep(cStart + cShift*2., cStart + cShift*3., color), 1.0);
     fragColor = vec4(color, 1.0);

}