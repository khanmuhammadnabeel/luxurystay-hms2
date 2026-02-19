import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from '@react-three/drei';
import * as THREE from 'three';
import { useParticleSystem } from '../../hooks/useParticleSystem';
import { particleShader } from '../../shaders/particleShader';
import { useLocalization } from '../../contexts';

const GoldParticles = ({ scrollProgress, mousePosition, count = 500 }) => {
    const { isRTL } = useLocalization();
    const materialRef = useRef();
    const {
        positions,
        targetPositions,
        sizes,
        randomness,
        formationProgress,
        triggerFormation
    } = useParticleSystem(count);

    // Track whether formation has been triggered this session
    const formationTriggeredRef = useRef(false);

    // Trigger formation at 80% scroll - ONCE ONLY
    useEffect(() => {
        if (scrollProgress >= 0.8 && !formationTriggeredRef.current) {
            triggerFormation();
            formationTriggeredRef.current = true;
        }
    }, [scrollProgress, triggerFormation]);

    // Reset formation trigger when component unmounts? No - session persists

    // Uniforms for the shader
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uScrollProgress: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uFormationProgress: { value: 0 },
        uIsRTL: { value: isRTL ? 1.0 : 0.0 }
    }), [isRTL]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
            materialRef.current.uniforms.uScrollProgress.value = scrollProgress;
            materialRef.current.uniforms.uMouse.value.set(mousePosition.x, mousePosition.y);
            materialRef.current.uniforms.uFormationProgress.value = formationProgress;
            materialRef.current.uniforms.uIsRTL.value = isRTL ? 1.0 : 0.0;
        }
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aTargetPosition"
                    count={count}
                    array={targetPositions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aSize"
                    count={count}
                    array={sizes}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aRandom"
                    count={count}
                    array={randomness}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexShader={particleShader.vertex}
                fragmentShader={particleShader.fragment}
                uniforms={uniforms}
            />
        </points>
    );
};

export default GoldParticles;