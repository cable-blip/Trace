"use client";
import React from "react";
import { cn } from "../../lib/utils";

export const MovingBorder = ({
  children,
  className,
  duration = 3000,
  borderRadius = "1.75rem",
  borderClassName,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  borderRadius?: string;
  borderClassName?: string;
}) => {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ borderRadius }}
    >
      <div
        className={cn(
          "absolute inset-0",
          borderClassName
        )}
        style={{
          background: `conic-gradient(from 0deg, transparent, #00D2FF, transparent ${duration}ms)`,
          animation: `spin ${duration}ms linear infinite`,
        }}
      />
      <div
        className="relative z-10 m-[1px] rounded-[inherit] bg-gray-950"
        style={{ borderRadius: `calc(${borderRadius} - 1px)` }}
      >
        {children}
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
