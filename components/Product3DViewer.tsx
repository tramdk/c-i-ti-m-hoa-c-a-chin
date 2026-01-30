
import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ZoomIn, ZoomOut, Move, X } from 'lucide-react';

interface Product3DModelProps {
    imageUrl: string;
    productName: string;
}

const Product3DModel: React.FC<Product3DModelProps> = ({ imageUrl, productName }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Load texture
    const texture = useTexture(imageUrl);

    useFrame((state) => {
        if (meshRef.current && !hovered) {
            // Auto-rotate when not being controlled
            meshRef.current.rotation.y += 0.005;
        }
    });

    return (
        <group>
            {/* Main product display - using a cylinder to simulate a bouquet */}
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                castShadow
            >
                <cylinderGeometry args={[1, 0.8, 3, 32]} />
                <meshStandardMaterial
                    map={texture}
                    roughness={0.3}
                    metalness={0.1}
                />
            </mesh>

            {/* Decorative elements */}
            <mesh position={[0, -1.5, 0]} rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.85, 0.9, 0.3, 32]} />
                <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>

            {/* Ribbon */}
            <mesh position={[0, -1.2, 0]} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.95, 0.08, 16, 32]} />
                <meshStandardMaterial color="#D88C9A" roughness={0.2} metalness={0.6} />
            </mesh>
        </group>
    );
};

interface Product3DViewerProps {
    imageUrl: string;
    productName: string;
    isOpen: boolean;
    onClose: () => void;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({
    imageUrl,
    productName,
    isOpen,
    onClose
}) => {
    const controlsRef = useRef<any>(null);

    const handleReset = () => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    };

    const handleZoomIn = () => {
        if (controlsRef.current) {
            const camera = controlsRef.current.object;
            camera.position.z = Math.max(camera.position.z - 1, 3);
        }
    };

    const handleZoomOut = () => {
        if (controlsRef.current) {
            const camera = controlsRef.current.object;
            camera.position.z = Math.min(camera.position.z + 1, 15);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    {/* Viewer Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-5xl h-[80vh] bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-white/90 to-transparent backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif text-2xl text-floral-deep mb-1">{productName}</h3>
                                    <p className="text-sm text-stone-500">Xoay để xem 360° • Cuộn để zoom</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-stone-400 hover:text-floral-rose shadow-lg transition-colors"
                                >
                                    <X size={24} />
                                </motion.button>
                            </div>
                        </div>

                        {/* 3D Canvas */}
                        <Canvas shadows>
                            <PerspectiveCamera makeDefault position={[0, 1, 8]} fov={50} />

                            <ambientLight intensity={0.5} />
                            <spotLight
                                position={[10, 10, 10]}
                                angle={0.3}
                                penumbra={1}
                                intensity={1.5}
                                castShadow
                            />
                            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#D88C9A" />

                            <Product3DModel imageUrl={imageUrl} productName={productName} />

                            <ContactShadows
                                position={[0, -1.8, 0]}
                                opacity={0.4}
                                scale={10}
                                blur={2}
                                far={4}
                            />

                            <Environment preset="sunset" />

                            <OrbitControls
                                ref={controlsRef}
                                enablePan={true}
                                enableZoom={true}
                                enableRotate={true}
                                minDistance={3}
                                maxDistance={15}
                                minPolarAngle={Math.PI / 6}
                                maxPolarAngle={Math.PI / 2}
                            />
                        </Canvas>

                        {/* Controls */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-full p-3 shadow-xl">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleZoomIn}
                                className="w-10 h-10 bg-stone-100 hover:bg-floral-rose hover:text-white rounded-full flex items-center justify-center transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn size={18} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleZoomOut}
                                className="w-10 h-10 bg-stone-100 hover:bg-floral-rose hover:text-white rounded-full flex items-center justify-center transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut size={18} />
                            </motion.button>

                            <div className="w-px h-6 bg-stone-200" />

                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 180 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleReset}
                                className="w-10 h-10 bg-stone-100 hover:bg-floral-rose hover:text-white rounded-full flex items-center justify-center transition-colors"
                                title="Reset View"
                            >
                                <RotateCcw size={18} />
                            </motion.button>

                            <div className="px-4 py-2 bg-stone-100 rounded-full">
                                <div className="flex items-center gap-2 text-xs text-stone-600">
                                    <Move size={14} />
                                    <span className="font-medium">Kéo để xoay</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Badge */}
                        <div className="absolute top-24 right-6 z-10 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg max-w-xs">
                            <h4 className="font-bold text-sm text-floral-deep mb-2">💡 Hướng dẫn</h4>
                            <ul className="text-xs text-stone-600 space-y-1">
                                <li>• <strong>Xoay:</strong> Click và kéo</li>
                                <li>• <strong>Zoom:</strong> Cuộn chuột hoặc dùng nút</li>
                                <li>• <strong>Di chuyển:</strong> Click chuột phải và kéo</li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
