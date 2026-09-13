export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  featured?: boolean;
}

export interface IndustryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  iconUrl: string;
  catLink: string;
}

export interface BrandItem {
  id: number;
  name: string;
  logoText?: string;
  logoUrl?: string;
}

export interface TrustBadgeItem {
  id: string;
  label: string;
}

export interface QuoteStepItem {
  step: number;
  title: string;
  description: string;
  iconName: string;
}

export interface CatalogProductItem {
  id: number;
  name: string;
  slug: string;
  sku?: string | null;
  brand?: string | null;
  imageUrl?: string | null;
  regularPrice?: string | null;
  salePrice?: string | null;
  unit?: string | null;
  isFeatured?: boolean;
  categoryIds?: number[];
  industryIds?: number[];
  hasMultipleVariations?: boolean;
}

export type CatalogSortOption = "name" | "price_asc" | "price_desc";

export interface CatalogQueryOptions {
  categorySlug?: string;
  industrySlug?: string;
  search?: string;
  sortBy?: CatalogSortOption;
  page?: number;
  limit?: number;
}

export interface CatalogResponse {
  products: CatalogProductItem[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ProductAttributeItem {
  id: number;
  productId: number;
  name: string;
  value: string;
  sku?: string | null;
  attrPrice?: string | number | null;
  orderIndex?: number;
}

export interface ProductDocumentItem {
  id: number;
  productId: number;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string | null;
  orderIndex?: number;
}

export interface ProductDetailItem extends CatalogProductItem {
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  description?: string | null;
  shortDescription?: string | null;
  deliveryInfo?: string | null;
  stockStatus?: string;
  galleryImages?: string[];
  attributes: Record<string, string[]>;
  rawAttributes?: ProductAttributeItem[];
  documents: ProductDocumentItem[];
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  roleId: number;
  roleName: "admin" | "cliente" | string;
  discountPercentage?: number | null;
}

export interface AdminCustomerItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  roleId: number;
  roleName: string;
  isActive: boolean;
  discountPercentage: number;
  quotesCount: number;
  createdAt: string;
}

export interface QuoteCartItem {
  productId: number;
  slug: string;
  name: string;
  sku?: string | null;
  imageUrl?: string | null;
  presentation: string;
  unitPrice: number;
  regularPrice?: number | null;
  quantity: number;
}
