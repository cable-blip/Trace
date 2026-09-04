"use client";
import React from "react";
import { cn } from "../../lib/utils";

export const GlowingEffect = ({
  borderClassName,
  containerClassName,
  glowColor = "#00D2FF",
  spread = 40,
  intensity = 0.6,
}: {
  borderClassName?: string;
  containerClassName?: string;
  glowColor?: string;
  spread?: number;
  intensity?: number;
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
        containerClassName
      )}
      style={{
        boxShadow: `0 0 ${spread}px ${glowColor}${Math.round(intensity * 255).toString(16).padStart(2, "0")}, inset 0 0 ${spread / 2}px ${glowColor}${Math.round(intensity * 0.3 * 255).toString(16).padStart(2, "0")}`,
      }}
    />
  );
};
