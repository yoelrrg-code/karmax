import React from "react";
import { TRUST_BADGES } from "@/lib/data/mockData";
import { Icon } from "@/components/icons";

export const TrustBadges: React.FC = () => {
  return (
    <section id="trust-badges" className="bg-[var(--light-bg-karmax)] h-33 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center justify-center gap-2.5 text-center sm:text-left"
            >
              <Icon
                name="check-mark"
                size={18}
                className=""
              />
              <span className="tracking-tight">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};