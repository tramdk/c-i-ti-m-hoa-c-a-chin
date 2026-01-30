import React from 'react';
import { motion } from 'framer-motion';

interface SimpleFlowerProps {
    isVisible: boolean;
    color?: string;
}

export const SimpleFlower: React.FC<SimpleFlowerProps> = ({
    isVisible,
    color = '#D88C9A'
}) => {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
            {/* Flower with 3-stage animation: appear at 2x with 50% opacity, then zoom and fade */}
            <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: isVisible ? [0, 2, 3] : 0,
                    opacity: isVisible ? [0, 0.5, 0] : 0,
                }}
                transition={{
                    duration: 1.2,
                    ease: "easeOut",
                    times: [0, 0.2, 1]
                }}
                width="140"
                height="140"
                viewBox="0 0 140 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* 8 petals outline */}
                {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i / 8) * 360;
                    return (
                        <g key={i} transform={`rotate(${angle} 70 70)`}>
                            {/* Petal shape */}
                            <path
                                d="M 70 25 Q 60 25 60 35 L 60 55 Q 60 65 70 65 Q 80 65 80 55 L 80 35 Q 80 25 70 25 Z"
                                stroke={color}
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </g>
                    );
                })}

                {/* Center circle outline */}
                <circle
                    cx="70"
                    cy="70"
                    r="18"
                    stroke={color}
                    strokeWidth="6"
                    fill="none"
                />

                {/* Inner center circle */}
                <circle
                    cx="70"
                    cy="70"
                    r="8"
                    stroke={color}
                    strokeWidth="4"
                    fill="none"
                />

                {/* 8 lines from center */}
                {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i / 8) * 360;
                    const rad = (angle * Math.PI) / 180;
                    const x1 = 70 + Math.cos(rad) * 26;
                    const y1 = 70 + Math.sin(rad) * 26;
                    const x2 = 70 + Math.cos(rad) * 45;
                    const y2 = 70 + Math.sin(rad) * 45;

                    return (
                        <line
                            key={`line-${i}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={color}
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    );
                })}
            </motion.svg>
        </div>
    );
};
