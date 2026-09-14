"use client";

import React from "react";
import { motion, type Transition } from "motion/react";

export interface RevealOnScrollProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  amount?: number | "some" | "all";
  className?: string;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  direction = "up",
  delay = 0,
  duration = 0.9,
  distance = 50,
  once = true,
  amount = 0.1,
  className = "",
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: distance, x: 0 };
      case "down":
        return { opacity: 0, y: -distance, x: 0 };
      case "left":
        return { opacity: 0, x: distance, y: 0 };
      case "right":
        return { opacity: 0, x: -distance, y: 0 };
      case "none":
      default:
        return { opacity: 0, x: 0, y: 0 };
    }
  };

  const transition: Transition = {
    duration,
    delay,
    ease: [0.16, 1, 0.3, 1],
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};
