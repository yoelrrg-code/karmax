"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";

interface LoadingSpinnerProps {
  size?: number;
  showText?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 150,
  showText = true,
}) => {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center justify-center gap-4 select-none">
      {/* Container del logo con círculo animado */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* SVG Circular Loader giratorio */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
        >
          <defs>
            <linearGradient id="karmaxLoaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10BCE5" />
              <stop offset="50%" stopColor="#16C24A" />
              <stop offset="100%" stopColor="#003E7E" />
            </linearGradient>
          </defs>

          {/* Círculo base tenue */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
          />

          {/* Círculo animado giratorio */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#karmaxLoaderGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.4}
            fill="none"
            style={{ transformOrigin: "50% 50%" }}
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "linear",
            }}
          />
        </svg>

        {/* Halo decorativo pulsante */}
        <motion.div
          animate={{ scale: [0.94, 1.04, 0.94], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#10BCE5]/10 to-[#16C24A]/10 pointer-events-none"
        />

        {/* Logo central con micro-escala suave */}
        <motion.div
          animate={{ scale: [0.97, 1.02, 0.97] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="relative z-10 flex items-center justify-center p-3"
        >
          <Image
            src="/images/logo-karmax.svg"
            alt="KARMAX"
            width={size * 0.62}
            height={size * 0.22}
            priority
            className="object-contain"
          />
        </motion.div>
      </div>

      {/* Texto de carga elegante */}
      {showText && (
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="text-xs font-semibold uppercase tracking-widest text-[var(--dark-blue-karmax)]/70"
        >
          Cargando...
        </motion.span>
      )}
    </div>
  );
};
