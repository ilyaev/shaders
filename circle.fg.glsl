varying vec3 vUv;
uniform float t;
uniform float rad;
uniform vec2 iResolution;

vec3 rgb(float r, float g, float b) {
	return vec3(r / 255.0, g / 255.0, b / 255.0);
}

// /**
//  * Draw a circle at vec2 `pos` with radius `rad` and
//  * color `color`.
//  */
vec4 circle(vec2 uv, vec2 pos, float rad1, vec3 color) {
	float d = length(pos - uv) - rad1;
	float tt = clamp(d, 0.0, 1.0);
	return vec4(color, 1.0 - tt);
}

vec4 wave(vec2 uv, vec2 pos, float size, vec3 color) {
	// float y = -100.0 + 20.0* sin(t/2.0*10.0 + uv.x / 10.0) * sin(uv.x/30.0);
	// float y = 30.0 * sin(uv.x / (10.0 - t)) * 10.0*cos(uv.y / (10.0 - t));
	float y = 20.0 * sin(t * 3.0 + uv.x / (10.0));
	float ny = (y - 100.0) + 40.0*sin(t*6.0 + uv.x/90.0);

	y = y + 40.0*sin(t*6.0 - uv.x/120.0);

	vec2 s = vec2(uv.x, y);
	vec3 c = vec3(color);
	// c.g = sin(t/2.0*10.0 + uv.x / 10.0);
	// c.r = 1.0-c.g;

	// float d = length(uv - s);
	// float tt = clamp(d, 0.0, 1.0);
	// return vec4(c, 1.0 - tt);
	c.r = mix(0.0, 1.0, clamp((uv.x * (sin(t*2.0 + uv.x / 10.0) + cos(t + uv.y/10.0))) / 200.0, 0.0,1.0));
	c.g = mix(0.0, 1.0, clamp((uv.x * (sin(t*2.0 - uv.x / 10.0) + cos(t - uv.y/10.0))) / 200.0, 0.0,1.0));
	c.b = mix(0.0, 1.0, clamp((uv.x * (sin(t*2.0 - uv.y / 20.0) + cos(t + uv.x/20.0))) / 200.0, 0.0,1.0));

	c = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), (uv.x + 320.0) / 640.0) * sin(t*10.0 - uv.x/3.0)*cos(t*5.0 + uv.y/3.0);
	return vec4(c, y > uv.y && ny < uv.y ? 1.0 : 0.0);
}

void main() {

	vec2 uv = vUv.xy;
	vec2 center = vec2(320.0 / 2.0, 0);
	float radius = rad * iResolution.x;

    float d = length(center - uv) - radius;
    float t = clamp(d, 0.0, 1.0);


    // Background layer
	vec4 layer1 = vec4(rgb(210.0, 222.0, 228.0), 1.0);

	// Circle
	vec3 red = rgb(225.0, 95.0, 60.0);
	vec4 layer2 = circle(uv, center, radius, red);

    vec4 layer3 = circle(uv, vec2(-160, 0.0), radius, red);


	// Blend the two
	// gl_FragColor = mix(mix(layer1, layer2, layer2.a), layer3, layer3.a);

	vec4 layerWave = wave(uv, center, radius, red);

	gl_FragColor = mix(layer1, layerWave, layerWave.a);

}
