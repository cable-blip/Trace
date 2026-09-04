"use client";
import React, { createContext, useState, useContext } from "react";

interface CardContextType {
  mousePosition: { x: number; y: number };
  setMousePosition: (pos: { x: number; y: number }) => void;
}

const CardContext = createContext<CardContextType>({
  mousePosition: { x: 0, y: 0 },
  setMousePosition: () => {},
});

export const useCardContext = () => useContext(CardContext);

export const CardContainer = ({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMousePosition({ x, y });
  };

  return (
    <CardContext.Provider value={{ mousePosition, setMousePosition }}>
      <div
        onMouseMove={handleMouseMove}
        className={`perspective-[1000px] ${containerClassName ?? ""}`}
      >
        <div className={className}>{children}</div>
      </div>
    </CardContext.Provider>
  );
};

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { mousePosition } = useCardContext();

  const rotateX = mousePosition.y * 15;
  const rotateY = -mousePosition.x * 15;

  return (
    <div
      className={`transform-style-3d transition-transform duration-200 ease-out ${className ?? ""}`}
      style={{
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
}) => {
  const { mousePosition } = useCardContext();

  const tx =
    typeof translateX === "number"
      ? mousePosition.x * translateX
      : translateX;
  const ty =
    typeof translateY === "number"
      ? mousePosition.y * translateY
      : translateY;
  const tz =
    typeof translateZ === "number"
      ? Math.abs(mousePosition.x * mousePosition.y) * translateZ
      : translateZ;

  return (
    <Tag
      className={`transition-transform duration-200 ease-out ${className ?? ""}`}
      style={{
        transform: `translateX(${tx}px) translateY(${ty}px) translateZ(${tz}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </Tag>
  );
};
