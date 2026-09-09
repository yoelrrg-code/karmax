import { redirect } from "next/navigation";
import { getIndustries } from "@/lib/services/karmaxService";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const industries = await getIndustries();
  const isIndustry = industries.some((i) => i.slug === slug);

  if (isIndustry) {
    redirect(`/productos?industry=${encodeURIComponent(slug)}`);
  }
  redirect(`/productos?category=${encodeURIComponent(slug)}`);
}
