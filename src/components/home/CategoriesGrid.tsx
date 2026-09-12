import Image from "next/image";
import Link from "next/link";
import type { CategoryItem } from "@/types";

interface CategoriesGridProps {
  categories: CategoryItem[];
  otherCategories?: CategoryItem[];
}

export const CategoriesGrid = ({
  categories,
  otherCategories = [],
}: CategoriesGridProps) => {
  return (
    <section id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mx-auto mb-15">
          <h2 className="tracking-tight">
            Productos para cada espacio y necesidad
          </h2>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 md:gap-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="card-group group relative rounded-[16px] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Card Header Title Pill */}
              <div className="p-4 text-left absolute z-2 card-header">
                <h3 className="text-shadow font-semibold text-[var(--blue-karmax)] group-hover:text-[var(--green-hover-karmax)] transition-colors">
                  {cat.name}
                </h3>
              </div>

              {/* Image Container */}
              <div className="relative w-full aspect-1/1 bg-slate-100 overflow-hidden">
                <Image
                  src={cat.imageUrl || "/images/categories/limpieza-general.jpg"}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary Categories ("Además") */}
        {otherCategories.length > 0 && (
          <div className="mt-10 flex flex-col items-center">
            <h3 className="text-base font-bold text-[var(--dark-blue-karmax)] mb-8 text-center">
              Además
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {otherCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="px-4 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[12px] md:text-[17px] sm:text-base font-semibold text-[var(--blue-karmax)] bg-[var(--light-bg-karmax)] hover:text-[var(--green-hover-karmax)] transition-all duration-200 shadow-2xs"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};