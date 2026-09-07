import React from "react";
import { CheckCircle2 } from "lucide-react";
import { TRUST_BADGES } from "@/lib/data/mockData";

export const TrustBadges: React.FC = () => {
  return (
    <section className="bg-white border-b border-slate-200/80 py-4 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center justify-center gap-2.5 text-center sm:text-left"
            >
              <CheckCircle2 className="w-5 h-5 text-[#22c55e] flex-shrink-0 fill-[#22c55e]/15" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
