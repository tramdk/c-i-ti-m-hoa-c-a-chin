
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface FlowerProps {
    growth: number; // 0 to 1
    color: string;
    position?: [number, number, number];
    scale?: number;
}

const GrowingFlower: React.FC<FlowerProps> = ({ growth, color, position = [0, 0, 0], scale = 1 }) => {
    const groupRef = useRef<THREE.Group>(null);
    const petalsCount = 5;

    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.getElapsedTime();
            // Gentle rotation
            groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;
            groupRef.current.rotation.y = t * 0.2;
        }
    });

    // Calculate petal scale based on growth
    const petalScale = Math.max(0, growth);
    const centerScale = Math.max(0, growth * 0.8);

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Center (blooms first) */}
            <Sphere args={[0.3, 32, 32]} scale={centerScale}>
                <meshStandardMaterial
                    color="#FFD700"
                    metalness={0.6}
                    roughness={0.2}
                    emissive="#FFD700"
                    emissiveIntensity={0.3 * growth}
                />
            </Sphere>

            {/* Petals (bloom outward) */}
            {Array.from({ length: petalsCount }).map((_, i) => {
                const rotation = (i / petalsCount) * Math.PI * 2;
                const petalGrowth = Math.max(0, (growth - 0.2) * 1.25); // Petals start after center

                return (
                    <group key={i} rotation={[0, 0, rotation]}>
                        <mesh
                            position={[0.6 * petalGrowth, 0, 0]}
                            rotation={[0, 0, (1 - petalGrowth) * Math.PI * 0.3]} // Unfold effect
                        >
                            <Sphere args={[0.7, 32, 32]} scale={[1.2 * petalGrowth, 0.6 * petalGrowth, 0.1]}>
                                <MeshDistortMaterial
                                    color={color}
                                    speed={2}
                                    distort={0.2 * petalGrowth}
                                    radius={1}
                                />
                            </Sphere>
                        </mesh>
                    </group>
                );
            })}

            {/* Stem (grows from bottom) */}
            <mesh position={[0, -1 * growth, 0]} rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.08, 2 * growth, 8]} />
                <meshStandardMaterial color="#2d5016" roughness={0.8} />
            </mesh>

            {/* Leaves */}
            {growth > 0.5 && (
                <>
                    <mesh position={[-0.3, -0.5 * growth, 0]} rotation={[0, 0, Math.PI / 4]}>
                        <Sphere args={[0.2, 16, 16]} scale={[2 * (growth - 0.5) * 2, 0.8 * (growth - 0.5) * 2, 0.1]}>
                            <meshStandardMaterial color="#3a7d44" roughness={0.6} />
                        </Sphere>
                    </mesh>
                    <mesh position={[0.3, -0.7 * growth, 0]} rotation={[0, 0, -Math.PI / 4]}>
                        <Sphere args={[0.2, 16, 16]} scale={[2 * (growth - 0.5) * 2, 0.8 * (growth - 0.5) * 2, 0.1]}>
                            <meshStandardMaterial color="#3a7d44" roughness={0.6} />
                        </Sphere>
                    </mesh>
                </>
            )}
        </group>
    );
};

interface FlowerGrowthProps {
    isVisible: boolean;
    color?: string;
    className?: string;
}

export const FlowerGrowth: React.FC<FlowerGrowthProps> = ({
    isVisible,
    color = "#D88C9A",
    className = ""
}) => {
    const [growth, setGrowth] = useState(0);

    React.useEffect(() => {
        if (isVisible) {
            let start = 0;
            const duration = 2000; // 2 seconds
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function for smooth growth
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                setGrowth(eased);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            animate();
        } else {
            setGrowth(0);
        }
    }, [isVisible]);

    return (
        <div className={`w-full h-full ${className}`}>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, 10, 10]} angle={0.3} penumbra={1} intensity={1.5} />

                <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
                    <GrowingFlower growth={growth} color={color} scale={1.5} />
                </Float>
            </Canvas>
        </div>
    );
};

// Particle effect for falling petals
interface FallingPetal {
    id: number;
    x: number;
    y: number;
    rotation: number;
    delay: number;
}

export const FallingPetals: React.FC<{ active: boolean; color?: string }> = ({
    active,
    color = "#D88C9A"
}) => {
    const [petals, setPetals] = useState<FallingPetal[]>([]);

    React.useEffect(() => {
        if (active) {
            const newPetals = Array.from({ length: 12 }, (_, i) => ({
                id: Date.now() + i,
                x: Math.random() * 100,
                y: -10,
                rotation: Math.random() * 360,
                delay: Math.random() * 0.5,
            }));
            setPetals(newPetals);

            // Clear petals after animation
            const timer = setTimeout(() => setPetals([]), 3000);
            return () => clearTimeout(timer);
        }
    }, [active]);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {petals.map((petal) => (
                <motion.div
                    key={petal.id}
                    initial={{
                        x: `${petal.x}vw`,
                        y: '-10vh',
                        rotate: petal.rotation,
                        opacity: 1,
                        scale: 1
                    }}
                    animate={{
                        y: '110vh',
                        x: `${petal.x + (Math.random() - 0.5) * 20}vw`,
                        rotate: petal.rotation + 720,
                        opacity: [1, 1, 0],
                        scale: [1, 1.2, 0.8]
                    }}
                    transition={{
                        duration: 2.5,
                        delay: petal.delay,
                        ease: "easeIn"
                    }}
                    className="absolute"
                    style={{
                        width: '20px',
                        height: '20px',
                        background: `radial-gradient(ellipse at center, ${color} 0%, ${color}99 70%, transparent 100%)`,
                        borderRadius: '50% 0 50% 0',
                        filter: 'blur(0.5px)',
                    }}
                />
            ))}
        </div>
    );
};
