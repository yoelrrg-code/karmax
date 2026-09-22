"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import type { IndustryItem } from "@/types";

interface IndustrySolutionsProps {
  industries?: IndustryItem[];
}

export const IndustrySolutions: React.FC<IndustrySolutionsProps> = ({
  industries = [],
}) => {
  return (
    <section id="industries" className="bg-[var(--light-bg-karmax)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-10 md:mb-14"
        >
          <h2 className="tracking-tight">
            Soluciones para cada industria
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-6">
          {industries.map((ind, idx) => (
            <motion.div
              key={ind.id}
              initial={{ opacity: 0, y: 55 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.9,
                delay: (idx % 4) * 0.16,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="bg-white rounded-[20px] p-3.5 md:p-6 transition-all duration-300 flex flex-col justify-between group text-center h-full"
            >
              <div className="flex flex-col items-center">
                {/* Icon Circle */}
                <div className="w-auto h-auto flex items-center justify-center mb-3 md:mb-5">
                  <Image
                    src={ind.iconUrl}
                    alt={ind.name}
                    width={100}
                    height={100}
                    className="object-contain group-hover:scale-105 transition-transform duration-500 ease-out w-[50px] h-[50px] md:w-[100px] md:h-[100px]"
                  />
                </div>

                {/* Industry Title */}
                <h3 className="text-base text-[var(--blue-karmax)] mb-2 flex items-center justify-center px-2">
                  {ind.name}
                </h3>

                {/* Description */}
                <p className="leading-relaxed mb-3 md:mb-6 text-[var(--text-karmax)]">
                  {ind.description}
                </p>
              </div>

              {/* "Ver productos" Outline Button */}
              <div className="pt-2">
                <Link
                  href={`${ind.catLink}`}
                  className="btn-secondary inline-flex items-center justify-center py-2 px-4 md:py-3 md:px-5 rounded-full border border-[var(--green-karmax)] text-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] hover:text-white transition-all duration-200"
                >
                  Ver productos
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
