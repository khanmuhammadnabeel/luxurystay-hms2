export const particleShader = {
    vertex: `
        uniform float uTime;
        uniform float uScrollProgress;
        uniform vec2 uMouse;
        uniform float uFormationProgress; // 0 to 1
        uniform float uIsRTL; // 0 or 1
        
        attribute vec3 aTargetPosition;
        attribute float aSize;
        attribute float aRandom;

        varying float vAlpha;

        void main() {
            vec3 pos = position;

            // 1. Natural floating motion (Sine waves)
            pos.x += sin(uTime * 0.5 + aRandom * 10.0) * 0.2;
            pos.y += cos(uTime * 0.4 + aRandom * 12.0) * 0.2;
            pos.z += sin(uTime * 0.6 + aRandom * 8.0) * 0.1;

            // 2. Mouse Repulsion - FIXED: Proper direction and force
            // uMouse is 0-1 from normalizedMouse, convert to world space
            float mouseWorldX = (uMouse.x * 12.0 - 6.0) * (uIsRTL > 0.5 ? -1.0 : 1.0);
            float mouseWorldY = (uMouse.y * 8.0 - 4.0) * -1.0; // Flip Y
            vec3 mousePos = vec3(mouseWorldX, mouseWorldY, 0.0);
            
            float dist = distance(pos, mousePos);
            float radius = 3.0;
            float force = max(0.0, 1.0 - dist / radius);
            
            // Push away from mouse - FIXED: Use normalized direction
            vec3 dir = normalize(pos - mousePos);
            pos += dir * force * 2.0;

            // 3. Word Formation Transition
            // Mix original floating position with target position
            vec3 finalPos = mix(pos, aTargetPosition, uFormationProgress);

            vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
            // Change line 37:
gl_PointSize = aSize * (120.0 / -mvPosition.z);  // Reduced from 200 to 120
            gl_Position = projectionMatrix * mvPosition;

            // Fade out particles slightly based on distance or randomness
            vAlpha = 0.7 + 0.3 * sin(uTime * 2.0 + aRandom * 10.0);
        }
    `,
    fragment: `
        varying float vAlpha;

        void main() {
            // Circular particle with soft edge
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;

            // Gold color gradient with slight variation
            vec3 goldLight = vec3(0.90, 0.80, 0.60); // Brighter gold
            vec3 goldDark = vec3(0.71, 0.59, 0.39); // Darker gold #CFAF7E
            
            // Center is brighter, edges darker
            float brightness = 1.0 - smoothstep(0.2, 0.5, dist);
            vec3 gold = mix(goldDark, goldLight, brightness);
            
            // Add subtle glow
            float glow = 0.5 * (1.0 - dist * 1.5);
            
            gl_FragColor = vec4(gold + glow, vAlpha * brightness);
        }
    `
};