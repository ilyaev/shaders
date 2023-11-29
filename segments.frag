// Draw return 1.0 if the point is closed to the segment less than the thickness
#define drawLine(A, B, r) step(distanceFromSegment(U, A, B), r)

// Draw a segment between A and B, with thickness r.
// It computes the distance of a point from a line and return it
//  if the distance is 0 the point belong to the line
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


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalizing coordinates: the center of the screen is (0,0)
    //  and the coordinates range from -1 to 1 along the y axis
	vec2 U = ( 2. * fragCoord - iResolution.xy ) / iResolution.xy.y;

    // The size of 1 pixel in normalized coordinates
    float px_size = 2. / iResolution.y;

    // Thickness
    float thickness = px_size;

    // The segments points
    vec2 A = vec2(-1.0,-0.5);
    vec2 B = vec2(-0.5,0.5);
    vec2 C = vec2(0.0,-0.5);
    vec2 D = vec2(0.5,0.5);
    vec2 E = vec2(1.0,-0.5);

    // If the point belong at one line the value will be 1., otherwise 0.
    float f = drawLine(A, B, thickness)
        	 +drawLine(B, C, thickness)
        	 +drawLine(C, D, thickness)
        	 +drawLine(D, E, thickness);

    fragColor = vec4(f,f,f,1.);
}