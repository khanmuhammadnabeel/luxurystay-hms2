import { useMemo, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Hook to manage particle system parameters and the "LUXURYSTAY" formation.
 */
export const useParticleSystem = (count = 500) => {
    const [formationProgress, setFormationProgress] = useState(0);
    const [hasFormed, setHasFormed] = useState(false);
    const animationFrameRef = useRef(null);

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Initial random positions
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 20;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 5;
        }
        return arr;
    }, [count]);

    // Target positions for "LUXURYSTAY" (9 letters - LUXURYSTAY has 9, not 10)
    const targetPositions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        // FIXED: "LUXURYSTAY" has 9 letters, not 10
        const charCenters = [
            -8, -6, -4, -2, 0, 2, 4, 6, 8 // X-offsets for 9 characters
        ];

        for (let i = 0; i < count; i++) {
            const charIdx = Math.floor((i / count) * charCenters.length);
            const centerX = charCenters[charIdx];

            // Distribute particles in a vertical 'pill' shape around each center
            arr[i * 3] = centerX + (Math.random() - 0.5) * 1.5;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 4;
            arr[i * 3 + 2] = 2.0; // Bring close to camera
        }
        return arr;
    }, [count]);

    const sizes = useMemo(() => {
        const arr = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            arr[i] = 2 + Math.random() * 6; // 2-8px
        }
        return arr;
    }, [count]);

    const randomness = useMemo(() => {
        const arr = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            arr[i] = Math.random();
        }
        return arr;
    }, [count]);

    // Formation Trigger Logic
    const triggerFormation = () => {
        if (hasFormed) return;

        setHasFormed(true);
        // Formation sequence: 0 to 1 over 0.5s, hold for 1s, 1 to 0 over 0.5s
        let start = null;
        const duration = 2000; // total sequence time

        const animate = (time) => {
            if (!start) start = time;
            const elapsed = time - start;

            if (elapsed < 500) {
                setFormationProgress(elapsed / 500); // Intro
            } else if (elapsed < 1500) {
                setFormationProgress(1); // Hold
            } else if (elapsed < 2000) {
                setFormationProgress(1 - (elapsed - 1500) / 500); // Outro
            } else {
                setFormationProgress(0);
                return; // Stop animation
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animationFrameRef.current = requestAnimationFrame(animate);
    };

    return {
        positions,
        targetPositions,
        sizes,
        randomness,
        formationProgress,
        triggerFormation
    };
};