import React from "react";
import { ProductForm } from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const productId = Number(id);

  return <ProductForm initialProductId={productId} />;
}
