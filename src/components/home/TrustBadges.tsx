"use client";

import React from "react";
import { motion } from "motion/react";
import { TRUST_BADGES } from "@/lib/data/mockData";
import { Icon } from "@/components/icons";

export interface TrustBadgesProps {
  badges?: Array<{ id: string | number; label: string }>;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ badges }) => {
  const items = badges && badges.length > 0 ? badges : TRUST_BADGES;

  return (
    <section id="trust-badges" className="bg-[var(--light-bg-karmax)] h-auto md:py-0 py-6 md:h-33 flex items-center justify-center overflow-hidden">
      <div className="md:max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 sm:gap-6 gap-2.5">
          {items.map((badge, idx) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.8,
                delay: idx * 0.16,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center justify-start md:justify-start lg:justify-center gap-2.5 text-center sm:text-left"
            >
              <Icon
                name="check-mark"
                size={18}
                className=""
              />
              <span className="tracking-tight">
                {badge.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};