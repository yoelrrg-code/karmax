import React from "react";

interface AboutHeroBarProps {
  title?: string;
}

export const AboutHeroBar: React.FC<AboutHeroBarProps> = ({
  title = "Quiénes Somos",
}) => {
  return (
    <div
      className="w-full text-white shadow-md"
      style={{
        background:
          "linear-gradient(90deg, var(--blue-karmax) 0%, var(--light-blue-karmax) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="tracking-tight text-white font-bold text-2xl sm:text-3xl">
          {title}
        </h1>
      </div>
    </div>
  );
};
