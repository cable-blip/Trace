"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TooltipItem = {
  id: number;
  name: string;
  designation?: string;
  image?: string;
};

export const AnimatedTooltip = ({
  items,
  children,
}: {
  items: TooltipItem[];
  children: React.ReactNode;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="group/tooltip relative inline-flex">
      <div
        onMouseEnter={() => setHoveredIndex(0)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {children}
      </div>
      <AnimatePresence>
        {hoveredIndex !== null && items[hoveredIndex] && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.4 }}
            className="absolute -top-16 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-gray-900/95 px-4 py-2 text-xs shadow-xl backdrop-blur-md"
          >
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900/95 border-r border-b border-white/10" />
            <div className="font-bold text-cyan-400">{items[hoveredIndex].name}</div>
            {items[hoveredIndex].designation && (
              <div className="text-gray-400 text-[10px]">{items[hoveredIndex].designation}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
