"use client";
import React from "react";
import { cn } from "../../lib/utils";

export const Spotlight = ({
  className,
  fill = "white",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <svg
      className={cn(
        "pointer-events-none absolute -top-1/2 -left-1/2 -z-10 h-[800px] w-[800px] animate-spotlight opacity-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3743 3743"
    >
      <defs>
        <radialGradient
          id="spotlightGrad"
          cx="50%"
          cy="50%"
          r="50%"
          fx="50%"
          fy="50%"
        >
          <stop offset="0%" stopColor={fill} stopOpacity="0.3" />
          <stop offset="50%" stopColor={fill} stopOpacity="0.1" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        cx="1871.5"
        cy="1871.5"
        r="1871.5"
        fill="url(#spotlightGrad)"
      />
    </svg>
  );
};
