
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Environment } from '@react-three/drei';
import * as THREE from 'three';

const Flower = ({ position, color, speed = 1, scale = 1 }: { position: [number, number, number]; color: string; speed?: number; scale?: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Tạo mảng cánh hoa (5 cánh)
  const petals = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      rotation: (i / 5) * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Chuyển động lơ lửng
      groupRef.current.position.y = position[1] + Math.sin(t * speed + position[0]) * 0.4;
      // Tự xoay chậm xung quanh trục
      groupRef.current.rotation.z = t * 0.2 * speed;
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Nhụy hoa (Tâm vàng) */}
      <Sphere args={[0.3, 32, 32]}>
        <meshStandardMaterial color="#C5A059" metalness={0.6} roughness={0.2} emissive="#C5A059" emissiveIntensity={0.2} />
      </Sphere>

      {/* Các cánh hoa */}
      {petals.map((petal, i) => (
        <group key={i} rotation={[0, 0, petal.rotation]}>
          <mesh position={[0.6, 0, 0]}>
            <Sphere args={[0.7, 32, 32]} scale={[1.2, 0.6, 0.1]}>
              <MeshDistortMaterial
                color={color}
                speed={speed * 2}
                distort={0.2}
                radius={1}
              />
            </Sphere>
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const FloralScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#D88C9A" />
        <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={2} color="#FFFFFF" />
        
        {/* Đóa hoa chính ở giữa */}
        <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.8}>
          <Flower position={[0, 0, 0]} color="#D88C9A" scale={1.2} speed={0.4} />
        </Float>
        
        {/* Các đóa hoa nhỏ bay xung quanh */}
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
           <Flower position={[-5, 3, -3]} color="#FFD1DC" scale={0.6} speed={0.8} />
           <Flower position={[6, -2, -4]} color="#FDF0F3" scale={0.8} speed={0.6} />
           <Flower position={[-3, -4, 2]} color="#D88C9A" scale={0.4} speed={1.2} />
           <Flower position={[4, 4, -2]} color="#C5A059" scale={0.3} speed={0.7} />
        </Float>

        {/* Hiệu ứng vòng sáng tinh tế */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <ringGeometry args={[4, 4.05, 64]} />
          <meshStandardMaterial color="#D88C9A" transparent opacity={0.1} />
        </mesh>

        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
};
