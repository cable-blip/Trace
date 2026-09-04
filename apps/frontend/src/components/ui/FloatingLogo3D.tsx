"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export const FloatingLogo3D = ({
  children,
  className,
  intensity = 15,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [translateZ, setTranslateZ] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setRotateX(-y * intensity);
    setRotateY(x * intensity);
    setTranslateZ(20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setTranslateZ(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className ?? ""}`}
      style={{
        perspective: "800px",
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
          translateZ,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
      {/* 3D depth shadow */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none transition-all duration-300"
        style={{
          transform: `translateZ(-20px) rotateX(${rotateX * 0.5}deg) rotateY(${rotateY * 0.5}deg)`,
          background: "rgba(0, 255, 255, 0.05)",
          filter: "blur(20px)",
          opacity: translateZ > 0 ? 0.6 : 0,
          transformStyle: "preserve-3d",
        }}
      />
    </motion.div>
  );
};
