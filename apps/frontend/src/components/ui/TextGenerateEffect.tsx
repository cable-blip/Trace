"use client";
import React, { useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

export const TextGenerateEffect = ({
  words,
  className,
  duration = 0.5,
  filter = true,
}: {
  words: string;
  className?: string;
  duration?: number;
  filter?: boolean;
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();
  const wordArray = words.split(" ");

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const container = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: { staggerChildren: duration / wordArray.length, delayChildren: i * 0.01 },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      filter: filter ? "blur(0px)" : "none",
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      filter: filter ? "blur(10px)" : "none",
      y: 20,
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={container}
      initial="hidden"
      animate={controls}
    >
      {wordArray.map((word, idx) => (
        <motion.span
          key={idx}
          variants={child}
          className="mr-3 inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};
