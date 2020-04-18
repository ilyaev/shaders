precision mediump float;
#define PI 3.14159265359

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}


vec3 getColor(vec2 i_st) {
    return vec3(abs(sin(111.5 + i_st.y)), abs(cos(iTime + i_st.x * i_st.y)), abs(sin(iTime + i_st.x / i_st.y)));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    float ratio = iResolution.x / iResolution.y;

    vec2 uv = 5. * fragCoord.xy / iResolution.xy;
    uv.x *= ratio;

    vec2 i_st = floor(uv);
    vec2 f_st = fract(uv);

    float m_dist = 2.; //0.34;
    vec3 color = vec3(0.);
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
            // color = mix(color, getColor(i_st + neighbour),  1. - dist);
            // color += getColor(i_st + neighbour) * (1.0 - dist);
            // m_dist = min(m_dist, dist);
        }
    }

    // color += c_color;
    // color += vec3(m_dist);

    // color = mix(vec3(0.), c_color, 1.0 - m_dist * (2. + abs(sin(iTime * 4. + (uv.x - 0.5) * 0.5 / (uv.y - 0.5) / 2.) * 5.))) * 2.;
    color = mix(vec3(0.), c_color, 1.0 - m_dist * (2. + abs(sin(iTime * 4. + (uv.x - 0.) * 2. / (uv.y + 0.) * 2.) * 5.))) * 2.;
    // color = mix(vec3(0.), c_color, 1.0 - m_dist);
    // color += vec3(step(0.3, m_dist) - step(0.31, m_dist));

    // color += 1. - step(.01, m_dist);

    // color.r += step(0.99, f_st.x) + step(0.99, f_st.y);

    // color += dist;


    fragColor = vec4(color, 1.0);

}