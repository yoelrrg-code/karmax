import React from "react";
import { TRUST_BADGES } from "@/lib/data/mockData";
import { Icon } from "@/components/icons";

export interface TrustBadgesProps {
  badges?: Array<{ id: string | number; label: string }>;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ badges }) => {
  const items = badges && badges.length > 0 ? badges : TRUST_BADGES;

  return (
    <section id="trust-badges" className="bg-[var(--light-bg-karmax)] h-auto md:py-0 py-6 md:h-33 flex items-center justify-center">
      <div className="md:max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 sm:gap-6 gap-4">
          {items.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center justify-start md:justify-center gap-2.5 text-center sm:text-left"
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