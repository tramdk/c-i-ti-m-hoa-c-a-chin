
import React, { useState, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Html, Float, Sparkles, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Palette, Sparkles as SparklesIcon, Wand2, ShoppingCart } from 'lucide-react';

interface FlowerType {
    id: string;
    name: string;
    color: string;
    price: number;
    icon: string;
    imageUrl: string;
}

interface PlacedFlower {
    id: string;
    type: FlowerType;
    position: [number, number, number];
    rotation: number;
    scale: number;
}

const FLOWER_TYPES: FlowerType[] = [
    {
        id: 'rose',
        name: 'Hồng',
        color: '#FF6B9D',
        price: 50000,
        icon: '🌹',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop'
    },
    {
        id: 'lily',
        name: 'Lily',
        color: '#FFE4E1',
        price: 60000,
        icon: '🌸',
        imageUrl: 'https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=400&h=400&fit=crop'
    },
    {
        id: 'tulip',
        name: 'Tulip',
        color: '#FF1493',
        price: 45000,
        icon: '🌷',
        imageUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400&h=400&fit=crop'
    },
    {
        id: 'sunflower',
        name: 'Hướng dương',
        color: '#FFD700',
        price: 40000,
        icon: '🌻',
        imageUrl: 'https://images.unsplash.com/photo-1597848212624-e530bb5d36c0?w=400&h=400&fit=crop'
    },
    {
        id: 'orchid',
        name: 'Lan',
        color: '#DDA0DD',
        price: 80000,
        icon: '🌺',
        imageUrl: 'https://images.unsplash.com/photo-1566146991569-696da38bb775?w=400&h=400&fit=crop'
    },
    {
        id: 'daisy',
        name: 'Cúc',
        color: '#FFFFFF',
        price: 30000,
        icon: '🌼',
        imageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=400&fit=crop'
    },
];

// Smart layering function
const calculateFlowerPosition = (index: number, total: number): [number, number, number] => {
    const layers = [
        { count: 3, radius: 0.25, height: 1.0 },
        { count: 5, radius: 0.45, height: 0.6 },
        { count: 7, radius: 0.60, height: 0.2 },
        { count: 9, radius: 0.70, height: -0.1 },
    ];

    let currentIndex = index;
    let layerIndex = 0;
    let positionInLayer = 0;

    for (let i = 0; i < layers.length; i++) {
        if (currentIndex < layers[i].count) {
            layerIndex = i;
            positionInLayer = currentIndex;
            break;
        }
        currentIndex -= layers[i].count;
    }

    if (layerIndex >= layers.length) {
        const extraIndex = currentIndex;
        const extraRing = Math.floor(extraIndex / 12);
        const extraRadius = 0.75 + extraRing * 0.12;
        const extraAngle = ((extraIndex % 12) / 12) * Math.PI * 2;
        const extraHeight = -0.3 - extraRing * 0.2;
        return [
            Math.cos(extraAngle) * extraRadius,
            extraHeight,
            Math.sin(extraAngle) * extraRadius
        ];
    }

    const layer = layers[layerIndex];
    const angle = (positionInLayer / layer.count) * Math.PI * 2;
    const randomRadius = (Math.random() - 0.5) * 0.08;
    const randomHeight = (Math.random() - 0.5) * 0.05;

    return [
        Math.cos(angle) * (layer.radius + randomRadius),
        layer.height + randomHeight,
        Math.sin(angle) * (layer.radius + randomRadius)
    ];
};

interface RealisticFlower3DProps {
    type: FlowerType;
    position: [number, number, number];
    rotation: number;
    scale: number;
    onClick?: () => void;
    isSelected?: boolean;
}

const RealisticFlower3D: React.FC<RealisticFlower3DProps> = ({
    type,
    position,
    rotation,
    scale,
    onClick,
    isSelected = false
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const stemHeight = 1.8;

    // Load texture
    const texture = useLoader(THREE.TextureLoader, type.imageUrl);

    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.getElapsedTime();
            groupRef.current.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.03;
            if (!isSelected) {
                groupRef.current.rotation.y = rotation + Math.sin(t * 0.5) * 0.1;
            }
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
            <group
                ref={groupRef}
                position={position}
                rotation={[0, rotation, 0]}
                scale={scale * (hovered ? 1.1 : 1)}
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                {/* Selection glow */}
                {isSelected && (
                    <>
                        <mesh position={[0, -stemHeight + 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <ringGeometry args={[0.9, 1.0, 32]} />
                            <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
                        </mesh>
                        <pointLight position={[0, 0, 0]} intensity={0.5} distance={2} color="#FFD700" />
                    </>
                )}

                {/* Sparkles */}
                {(hovered || isSelected) && (
                    <Sparkles count={20} scale={2} size={2} speed={0.4} color="#FFD700" />
                )}

                {/* Realistic flower using billboard */}
                <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                    <mesh>
                        <planeGeometry args={[1, 1]} />
                        <meshBasicMaterial
                            map={texture}
                            transparent
                            alphaTest={0.1}
                            side={THREE.DoubleSide}
                            toneMapped={false}
                        />
                    </mesh>
                </Billboard>

                {/* Stem with segments */}
                <group position={[0, -stemHeight / 2, 0]}>
                    <mesh castShadow>
                        <cylinderGeometry args={[0.05, 0.08, stemHeight, 16]} />
                        <meshStandardMaterial color="#2d5016" roughness={0.7} metalness={0.1} />
                    </mesh>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <mesh key={i} position={[0, -stemHeight / 2 + (i * stemHeight / 3), 0]}>
                            <torusGeometry args={[0.06, 0.015, 8, 16]} />
                            <meshStandardMaterial color="#234010" roughness={0.8} />
                        </mesh>
                    ))}
                </group>

                {/* Leaves */}
                <mesh position={[-0.2, -stemHeight * 0.3, 0]} rotation={[0, 0, Math.PI / 3]} scale={[1.2, 0.8, 0.3]}>
                    <sphereGeometry args={[0.18, 16, 16]} />
                    <meshStandardMaterial color="#3a7d44" roughness={0.6} metalness={0.1} />
                </mesh>
                <mesh position={[0.2, -stemHeight * 0.5, 0]} rotation={[0, 0, -Math.PI / 3]} scale={[1.2, 0.8, 0.3]}>
                    <sphereGeometry args={[0.18, 16, 16]} />
                    <meshStandardMaterial color="#3a7d44" roughness={0.6} metalness={0.1} />
                </mesh>
                <mesh position={[-0.15, -stemHeight * 0.7, 0.1]} rotation={[0, Math.PI / 4, Math.PI / 4]} scale={[1.1, 0.7, 0.3]}>
                    <sphereGeometry args={[0.16, 16, 16]} />
                    <meshStandardMaterial color="#3a7d44" roughness={0.6} metalness={0.1} />
                </mesh>

                {/* Hover tooltip */}
                {hovered && !isSelected && (
                    <Html center distanceFactor={8}>
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-gradient-to-r from-floral-rose to-floral-deep text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl pointer-events-none whitespace-nowrap backdrop-blur-sm"
                        >
                            {type.icon} {type.name}
                        </motion.div>
                    </Html>
                )}
            </group>
        </Float>
    );
};

const Vase3D: React.FC = () => {
    return (
        <group position={[0, -1, 0]}>
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.7, 0.55, 1.6, 64]} />
                <meshStandardMaterial color="#F5E6D3" roughness={0.1} metalness={0.4} envMapIntensity={1.5} />
            </mesh>
            <mesh position={[0, 0.8, 0]}>
                <torusGeometry args={[0.7, 0.06, 16, 64]} />
                <meshStandardMaterial color="#D4AF37" roughness={0.2} metalness={0.9} emissive="#D4AF37" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0, -0.8, 0]}>
                <cylinderGeometry args={[0.6, 0.7, 0.1, 64]} />
                <meshStandardMaterial color="#E8D5B7" roughness={0.3} metalness={0.3} />
            </mesh>
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(angle) * 0.65, 0, Math.sin(angle) * 0.65]} rotation={[0, angle, 0]}>
                        <sphereGeometry args={[0.03, 16, 16]} />
                        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
                    </mesh>
                );
            })}
        </group>
    );
};

interface BouquetBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (flowers: PlacedFlower[], totalPrice: number) => void;
}

export const BouquetBuilder: React.FC<BouquetBuilderProps> = ({
    isOpen,
    onClose,
    onSave
}) => {
    const [placedFlowers, setPlacedFlowers] = useState<PlacedFlower[]>([]);
    const [selectedFlower, setSelectedFlower] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<FlowerType>(FLOWER_TYPES[0]);
    const [showConfetti, setShowConfetti] = useState(false);

    const totalPrice = placedFlowers.reduce((sum, f) => sum + f.type.price, 0);

    const handleAddFlower = () => {
        const flowerIndex = placedFlowers.length;
        const position = calculateFlowerPosition(flowerIndex, placedFlowers.length + 1);

        const newFlower: PlacedFlower = {
            id: `flower-${Date.now()}`,
            type: selectedType,
            position: position,
            rotation: Math.random() * Math.PI * 2,
            scale: 0.75 + Math.random() * 0.35,
        };
        setPlacedFlowers([...placedFlowers, newFlower]);

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 500);
    };

    const handleRemoveFlower = (id: string) => {
        const newFlowers = placedFlowers.filter(f => f.id !== id);
        const rearranged = newFlowers.map((flower, index) => ({
            ...flower,
            position: calculateFlowerPosition(index, newFlowers.length)
        }));
        setPlacedFlowers(rearranged);
        if (selectedFlower === id) setSelectedFlower(null);
    };

    const handleSave = () => {
        if (onSave) {
            onSave(placedFlowers, totalPrice);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gradient-to-br from-black/90 via-floral-deep/80 to-black/90 backdrop-blur-2xl"
                    />

                    <AnimatePresence>
                        {showConfetti && (
                            <>
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: '50%', y: '50%', scale: 0, rotate: 0 }}
                                        animate={{
                                            x: `${50 + (Math.random() - 0.5) * 100}%`,
                                            y: `${50 + (Math.random() - 0.5) * 100}%`,
                                            scale: [0, 1, 0],
                                            rotate: Math.random() * 360
                                        }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="fixed w-3 h-3 rounded-full pointer-events-none"
                                        style={{
                                            background: FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)].color,
                                            boxShadow: '0 0 10px currentColor'
                                        }}
                                    />
                                ))}
                            </>
                        )}
                    </AnimatePresence>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-7xl h-[92vh] bg-gradient-to-br from-white via-floral-petal/30 to-white rounded-[2.5rem] shadow-2xl overflow-hidden flex border border-floral-rose/20"
                    >
                        <div className="flex-1 relative bg-gradient-to-br from-stone-50 to-stone-100">
                            <div className="absolute top-0 left-0 right-0 z-10 p-8 bg-gradient-to-b from-white/95 via-white/80 to-transparent backdrop-blur-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-14 h-14 bg-gradient-to-br from-floral-rose to-floral-deep rounded-2xl flex items-center justify-center shadow-lg"
                                        >
                                            <Wand2 className="text-white" size={28} />
                                        </motion.div>
                                        <div>
                                            <h3 className="font-serif text-4xl text-floral-deep mb-1 bg-gradient-to-r from-floral-deep to-floral-rose bg-clip-text text-transparent">
                                                Thiết Kế Bó Hoa
                                            </h3>
                                            <p className="text-sm text-stone-500 font-medium">Sáng tạo bó hoa độc đáo của riêng bạn</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={onClose}
                                        className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-stone-400 hover:text-floral-rose hover:bg-white shadow-lg transition-all border border-stone-200"
                                    >
                                        <X size={24} />
                                    </motion.button>
                                </div>
                            </div>

                            <Canvas shadows dpr={[1, 2]}>
                                <PerspectiveCamera makeDefault position={[0, 2.5, 5.5]} fov={45} />

                                <ambientLight intensity={0.7} />
                                <spotLight
                                    position={[5, 8, 5]}
                                    angle={0.3}
                                    penumbra={1}
                                    intensity={1.5}
                                    castShadow
                                    shadow-mapSize-width={2048}
                                    shadow-mapSize-height={2048}
                                />
                                <pointLight position={[-5, 3, -3]} intensity={0.6} color="#FFB6C1" />
                                <pointLight position={[5, 2, 3]} intensity={0.4} color="#DDA0DD" />

                                <Vase3D />

                                {placedFlowers.map((flower) => (
                                    <RealisticFlower3D
                                        key={flower.id}
                                        type={flower.type}
                                        position={flower.position}
                                        rotation={flower.rotation}
                                        scale={flower.scale}
                                        onClick={() => setSelectedFlower(flower.id)}
                                        isSelected={selectedFlower === flower.id}
                                    />
                                ))}

                                <ContactShadows
                                    position={[0, -1.75, 0]}
                                    opacity={0.6}
                                    scale={12}
                                    blur={2.5}
                                    far={4}
                                />

                                <Environment preset="sunset" />

                                <OrbitControls
                                    enablePan={false}
                                    minDistance={3.5}
                                    maxDistance={9}
                                    minPolarAngle={Math.PI / 6}
                                    maxPolarAngle={Math.PI / 2.3}
                                    enableDamping
                                    dampingFactor={0.05}
                                />
                            </Canvas>

                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="absolute bottom-8 left-8 right-8 z-10"
                            >
                                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-stone-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-8">
                                            <div>
                                                <p className="text-xs text-stone-500 mb-1 font-medium uppercase tracking-wider">Số lượng hoa</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-floral-rose to-floral-deep bg-clip-text text-transparent">
                                                    {placedFlowers.length}
                                                </p>
                                            </div>
                                            <div className="w-px h-12 bg-stone-200" />
                                            <div>
                                                <p className="text-xs text-stone-500 mb-1 font-medium uppercase tracking-wider">Tổng giá trị</p>
                                                <p className="text-3xl font-bold text-floral-rose">
                                                    {totalPrice.toLocaleString()}đ
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleSave}
                                            disabled={placedFlowers.length === 0}
                                            className="px-8 py-4 bg-gradient-to-r from-floral-rose to-floral-deep text-white rounded-2xl font-bold text-sm flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                                            Lưu & Đặt Hàng
                                            <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.div>
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="w-96 bg-gradient-to-br from-white to-floral-petal/20 p-8 overflow-y-auto border-l border-floral-rose/10">
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-floral-rose to-floral-deep rounded-xl flex items-center justify-center">
                                        <Palette size={20} className="text-white" />
                                    </div>
                                    <h4 className="font-serif text-2xl text-floral-deep">Chọn Loại Hoa</h4>
                                </div>

                                <div className="space-y-3">
                                    {FLOWER_TYPES.map((type) => (
                                        <motion.button
                                            key={type.id}
                                            whileHover={{ scale: 1.02, x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedType(type)}
                                            className={`w-full p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden ${selectedType.id === type.id
                                                    ? 'border-floral-rose bg-gradient-to-r from-floral-petal to-white shadow-lg'
                                                    : 'border-stone-100 hover:border-floral-rose/30 bg-white hover:shadow-md'
                                                }`}
                                        >
                                            {selectedType.id === type.id && (
                                                <motion.div
                                                    layoutId="selectedFlowerBg"
                                                    className="absolute inset-0 bg-gradient-to-r from-floral-rose/5 to-transparent"
                                                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                                />
                                            )}

                                            <div className="relative flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <motion.div
                                                        animate={selectedType.id === type.id ? { rotate: [0, 10, -10, 0] } : {}}
                                                        transition={{ duration: 0.5 }}
                                                        className="text-4xl"
                                                    >
                                                        {type.icon}
                                                    </motion.div>
                                                    <div>
                                                        <span className="font-bold text-lg text-floral-deep block mb-1">{type.name}</span>
                                                        <span className="text-sm text-floral-rose font-bold">
                                                            {type.price.toLocaleString()}đ
                                                        </span>
                                                    </div>
                                                </div>
                                                <div
                                                    className="w-8 h-8 rounded-full border-3 border-white shadow-lg group-hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: type.color }}
                                                />
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddFlower}
                                className="w-full py-5 bg-gradient-to-r from-floral-deep to-floral-rose text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all mb-8 group relative overflow-hidden"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                />
                                <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                                <span>Thêm {selectedType.name}</span>
                                <SparklesIcon size={20} className="group-hover:scale-110 transition-transform" />
                            </motion.button>

                            <div className="border-t-2 border-floral-rose/10 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-serif text-xl text-floral-deep">Hoa Đã Chọn</h4>
                                    <span className="px-3 py-1 bg-gradient-to-r from-floral-rose to-floral-deep text-white rounded-full text-xs font-bold">
                                        {placedFlowers.length}
                                    </span>
                                </div>

                                {placedFlowers.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-12"
                                    >
                                        <motion.div
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="text-6xl mb-4"
                                        >
                                            🌸
                                        </motion.div>
                                        <p className="text-sm text-stone-400 italic">
                                            Chưa có hoa nào được thêm<br />
                                            Hãy bắt đầu sáng tạo!
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                        <AnimatePresence mode="popLayout">
                                            {placedFlowers.map((flower, index) => (
                                                <motion.div
                                                    key={flower.id}
                                                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`p-4 rounded-xl border-2 flex items-center justify-between group hover:shadow-md transition-all ${selectedFlower === flower.id
                                                            ? 'border-floral-rose bg-gradient-to-r from-floral-petal to-white shadow-lg'
                                                            : 'border-stone-100 bg-white hover:border-floral-rose/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <span className="text-2xl">{flower.type.icon}</span>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-floral-deep">
                                                                {flower.type.name}
                                                            </p>
                                                            <p className="text-xs text-stone-500">
                                                                {flower.type.price.toLocaleString()}đ
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleRemoveFlower(flower.id)}
                                                        className="w-9 h-9 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center text-red-500 transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={16} />
                                                    </motion.button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
