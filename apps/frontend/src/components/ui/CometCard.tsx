"use client";
import React, { useRef, useState } from "react";
import { cn } from "../../lib/utils";

export const CometCard = ({
  children,
  className,
  glareColor = "rgba(0, 255, 255, 0.12)",
}: {
  children: React.ReactNode;
  className?: string;
  glareColor?: string;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glareOpacity, setGlareOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setPosition({ x, y });
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setGlareOpacity(0.15);
  };

  const handleMouseEnter = () => setGlareOpacity(0.15);
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlareOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-2xl border border-white/[0.08] bg-gray-950/50 backdrop-blur-sm overflow-hidden transition-transform duration-200 ease-out",
        className
      )}
      style={{
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Glare overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${glareColor}, transparent 40%)`,
          opacity: glareOpacity,
        }}
      />
      {/* Shine reflection */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl transition-opacity duration-300"
        style={{
          background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)`,
          opacity: glareOpacity > 0 ? 1 : 0,
          transform: `translateX(${position.x * 0.1}px) translateY(${position.y * 0.1}px)`,
        }}
      />
      <div className="relative z-20">{children}</div>
    </div>
  );
};
