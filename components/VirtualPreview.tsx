
import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Briefcase, Coffee, X, Check } from 'lucide-react';

interface RoomScene {
    id: string;
    name: string;
    icon: React.ReactNode;
    background: string;
    floorColor: string;
    description: string;
}

const ROOM_SCENES: RoomScene[] = [
    {
        id: 'living',
        name: 'Phòng khách',
        icon: <Home size={20} />,
        background: '#F5F5DC',
        floorColor: '#D2B48C',
        description: 'Không gian ấm cúng cho gia đình'
    },
    {
        id: 'office',
        name: 'Văn phòng',
        icon: <Briefcase size={20} />,
        background: '#E8E8E8',
        floorColor: '#A9A9A9',
        description: 'Môi trường chuyên nghiệp'
    },
    {
        id: 'cafe',
        name: 'Quán cafe',
        icon: <Coffee size={20} />,
        background: '#FFF8DC',
        floorColor: '#8B4513',
        description: 'Không gian thư giãn'
    },
];

interface BouquetPreviewProps {
    imageUrl: string;
    position: [number, number, number];
    scale: number;
}

const BouquetPreview: React.FC<BouquetPreviewProps> = ({ imageUrl, position, scale }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const texture = useTexture(imageUrl);

    useFrame((state) => {
        if (meshRef.current) {
            const t = state.clock.getElapsedTime();
            meshRef.current.position.y = position[1] + Math.sin(t * 2) * 0.02;
            meshRef.current.rotation.y += 0.005;
        }
    });

    return (
        <group
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            {/* Bouquet */}
            <mesh
                ref={meshRef}
                position={position}
                scale={scale}
                castShadow
            >
                <cylinderGeometry args={[0.3, 0.25, 0.8, 32]} />
                <meshStandardMaterial
                    map={texture}
                    roughness={0.3}
                    metalness={0.1}
                />
            </mesh>

            {/* Vase */}
            <mesh position={[position[0], position[1] - 0.5, position[2]]} castShadow>
                <cylinderGeometry args={[0.28, 0.22, 0.4, 32]} />
                <meshStandardMaterial
                    color="#E8DCC4"
                    roughness={0.2}
                    metalness={0.3}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Glow effect when hovered */}
            {hovered && (
                <pointLight
                    position={[position[0], position[1], position[2]]}
                    intensity={0.5}
                    distance={2}
                    color="#D88C9A"
                />
            )}
        </group>
    );
};

interface RoomEnvironmentProps {
    scene: RoomScene;
    children: React.ReactNode;
}

const RoomEnvironment: React.FC<RoomEnvironmentProps> = ({ scene, children }) => {
    return (
        <>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color={scene.floorColor} roughness={0.8} />
            </mesh>

            {/* Back Wall */}
            <mesh position={[0, 2, -3]} receiveShadow>
                <planeGeometry args={[10, 6]} />
                <meshStandardMaterial color={scene.background} roughness={0.9} />
            </mesh>

            {/* Side Wall */}
            <mesh position={[-3, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[6, 6]} />
                <meshStandardMaterial color={scene.background} roughness={0.9} />
            </mesh>

            {/* Furniture based on room type */}
            {scene.id === 'living' && (
                <>
                    {/* Coffee table */}
                    <mesh position={[0, -0.3, 0]} castShadow>
                        <boxGeometry args={[1.5, 0.1, 0.8]} />
                        <meshStandardMaterial color="#8B4513" roughness={0.5} />
                    </mesh>
                    <mesh position={[0, -0.5, 0]} castShadow>
                        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
                        <meshStandardMaterial color="#654321" />
                    </mesh>
                </>
            )}

            {scene.id === 'office' && (
                <>
                    {/* Desk */}
                    <mesh position={[0, -0.2, 0]} castShadow>
                        <boxGeometry args={[2, 0.1, 1]} />
                        <meshStandardMaterial color="#2F4F4F" roughness={0.3} metalness={0.5} />
                    </mesh>
                </>
            )}

            {scene.id === 'cafe' && (
                <>
                    {/* Round table */}
                    <mesh position={[0, -0.3, 0]} castShadow>
                        <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
                        <meshStandardMaterial color="#8B4513" roughness={0.4} />
                    </mesh>
                    <mesh position={[0, -0.5, 0]} castShadow>
                        <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
                        <meshStandardMaterial color="#654321" />
                    </mesh>
                </>
            )}

            {children}
        </>
    );
};

interface VirtualPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    productImage: string;
    productName: string;
}

export const VirtualPreview: React.FC<VirtualPreviewProps> = ({
    isOpen,
    onClose,
    productImage,
    productName
}) => {
    const [selectedScene, setSelectedScene] = useState<RoomScene>(ROOM_SCENES[0]);
    const [bouquetScale, setBouquetScale] = useState(1);
    const [bouquetPosition, setBouquetPosition] = useState<[number, number, number]>([0, 0, 0]);

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

                    {/* Preview Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full max-w-6xl h-[85vh] bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-white/95 to-transparent backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif text-2xl text-floral-deep mb-1">{productName}</h3>
                                    <p className="text-sm text-stone-500">Xem trước trong không gian của bạn</p>
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
                            <PerspectiveCamera makeDefault position={[2, 1.5, 4]} fov={60} />

                            <ambientLight intensity={0.6} />
                            <directionalLight
                                position={[5, 5, 5]}
                                intensity={0.8}
                                castShadow
                                shadow-mapSize-width={2048}
                                shadow-mapSize-height={2048}
                            />
                            <pointLight position={[-3, 2, -2]} intensity={0.4} color="#FFE4B5" />

                            <RoomEnvironment scene={selectedScene}>
                                <BouquetPreview
                                    imageUrl={productImage}
                                    position={bouquetPosition}
                                    scale={bouquetScale}
                                />
                            </RoomEnvironment>

                            <Environment preset="apartment" />
                        </Canvas>

                        {/* Scene Selector */}
                        <div className="absolute top-24 left-6 z-10 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                            <h4 className="font-bold text-sm text-floral-deep mb-3">Chọn Không Gian</h4>
                            <div className="space-y-2">
                                {ROOM_SCENES.map((scene) => (
                                    <motion.button
                                        key={scene.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedScene(scene)}
                                        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${selectedScene.id === scene.id
                                                ? 'border-floral-rose bg-floral-petal'
                                                : 'border-stone-100 hover:border-floral-rose/30 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className={`${selectedScene.id === scene.id ? 'text-floral-rose' : 'text-stone-400'}`}>
                                                {scene.icon}
                                            </div>
                                            <span className="font-bold text-sm text-floral-deep">{scene.name}</span>
                                            {selectedScene.id === scene.id && (
                                                <Check size={16} className="text-floral-rose ml-auto" />
                                            )}
                                        </div>
                                        <p className="text-xs text-stone-500 ml-8">{scene.description}</p>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl min-w-[400px]">
                            <h4 className="font-bold text-sm text-floral-deep mb-3">Điều Chỉnh</h4>

                            {/* Scale Control */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs text-stone-600 font-medium">Kích thước</label>
                                    <span className="text-xs text-floral-rose font-bold">{Math.round(bouquetScale * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={bouquetScale}
                                    onChange={(e) => setBouquetScale(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-floral-rose"
                                />
                            </div>

                            {/* Position Controls */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-stone-600 font-medium mb-1 block">Trái/Phải</label>
                                    <input
                                        type="range"
                                        min="-1.5"
                                        max="1.5"
                                        step="0.1"
                                        value={bouquetPosition[0]}
                                        onChange={(e) => setBouquetPosition([parseFloat(e.target.value), bouquetPosition[1], bouquetPosition[2]])}
                                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-floral-rose"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-stone-600 font-medium mb-1 block">Trước/Sau</label>
                                    <input
                                        type="range"
                                        min="-1"
                                        max="1"
                                        step="0.1"
                                        value={bouquetPosition[2]}
                                        onChange={(e) => setBouquetPosition([bouquetPosition[0], bouquetPosition[1], parseFloat(e.target.value)])}
                                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-floral-rose"
                                    />
                                </div>
                            </div>

                            {/* Reset Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setBouquetScale(1);
                                    setBouquetPosition([0, 0, 0]);
                                }}
                                className="w-full mt-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-colors"
                            >
                                Đặt Lại
                            </motion.button>
                        </div>

                        {/* Info */}
                        <div className="absolute top-24 right-6 z-10 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg max-w-xs">
                            <h4 className="font-bold text-sm text-floral-deep mb-2">💡 Mẹo</h4>
                            <ul className="text-xs text-stone-600 space-y-1">
                                <li>• Kéo thanh trượt để điều chỉnh kích thước</li>
                                <li>• Di chuyển vị trí để xem phù hợp nhất</li>
                                <li>• Chọn không gian khác để so sánh</li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
