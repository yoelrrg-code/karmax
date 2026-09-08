import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: { w: number; h: number };
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = { w: 190, h: 48 },
}) => {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 group ${className}`}>
      <Image src="/images/logo-karmax.svg" alt="Logo Karma" width={size.w} height={size.h} />
    </Link>
  );
};
