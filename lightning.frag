#iChannel0 "file://noise_seamless.jpg"

float n21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414 + iTime/1000000.))) * 43758.5453 + iTime/10.);
}

float distanceFromSegment(vec2 U, vec2 A, vec2 B)
{
	vec2 UA = U - A;
    vec2 BA = (B - A);

    float s = dot(UA, BA) / length(BA);   // scalar projection of U-A on B-A
    s = s / length(BA); 				  // normalize the projection value in the range [0,1],
    								      //  a value of 0 means the projection correspond to A, 1 to B,
    									  //  in between the projection is inside the segment,
                                          //  outside [0,1] the projection is outside the segment.
    s = clamp(s, 0., 1.);                 // If the scalar projection is outside [0,1], its value is clamped to
                                          //  0 or 1 ...

    return length(UA - s*BA);          	  // ... so here we compute the distance of U from its projection if it is
                                          // inside the segment, or from the extreme points A or B if it is outside
}

// Draw return 1.0 if the point is closed to the segment less than the thickness
#define drawLine(A, B, r) step(distanceFromSegment(U, A, B), r)


void mainImage(out vec4 fragColor, in vec2 fragCoords) {
    vec2 uv = fragCoords / iResolution.xy;
    uv.x *= iResolution.x / iResolution.y;

    // uv.x += iTime/30.;

    vec2 cells = vec2(3., 1.);

    uv *= cells;

    vec2 id = floor(uv);
    uv = fract(uv);


    // float n = clamp((texture(iChannel0, fract(uv + iTime/10.)).x - .45) * 3., 0., 1.);

    // vec3 col = vec3(id.x/cells, id.y/cells, 0.);

    float an = min(0.1, n21(vec2(id.y, 2.)) + .2);

    float y1 = n21(vec2(id.x + 100., id.y + floor(iTime*31.)))*an + (1. - an);
    float y2 = n21(vec2(id.x + 1. + 100., id.y + floor(iTime*31.)))*an + (1. - an);

    vec2 U = ( 2. * fragCoords - iResolution.xy ) / iResolution.xy.y;

    // The size of 1 pixel in normalized coordinates
    float px_size = 1. / (iResolution.y / cells.y);

    // Thickness
    float thickness = px_size;
    float d = distanceFromSegment(uv + vec2(0., .5), vec2(0., y1), vec2(1., y2));
    float line = .1/pow(d, 1.2); //thickness / pow(d, .9);
    // float line = step(, thickness);
    // col.b = drawLine(vec2(0., y1), vec2(1., y2), .1);
    vec3 col = line * max(vec3(0.3, 0.6, 0.3), vec3(sin(iTime + id.y), cos(iTime-id.y*3.), cos(iTime/2. + id.y/2.)));

    fragColor = vec4(col, 1.);
}