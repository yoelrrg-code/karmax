import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  variant?: "blue" | "white" | string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {

  return (
    <Link href="/" className={`inline-flex items-center gap-2 group ${className}`}>
      <Image src="/images/logo-karmax.svg" alt="Logo Karma" width={190} height={48} />
    </Link>
  );
};
