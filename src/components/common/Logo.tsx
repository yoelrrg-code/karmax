import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "blue" | "white";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = "blue", className = "" }) => {
  const isWhite = variant === "white";

  return (
    <Link href="/" className={`inline-flex items-center gap-2 group ${className}`}>
      <div
        className={`flex items-center justify-center font-black tracking-wider px-3.5 py-1.5 rounded-lg text-xl md:text-2xl transition-transform group-hover:scale-[1.02] shadow-sm ${
          isWhite
            ? "bg-white text-[#00509d]"
            : "bg-[#004e9a] text-white"
        }`}
      >
        <span className="font-extrabold tracking-tight">KARMA</span>
        <span className="text-[#38bdf8] font-black ml-0.5 text-2xl md:text-3xl leading-none">X</span>
      </div>
    </Link>
  );
};
