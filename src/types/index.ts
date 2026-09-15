export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
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
  metaTitle?: string | null;
  metaDescription?: string | null;
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

export type CatalogSortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc" | "name";

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
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  galleryImages?: string[];
  attributes: Record<string, string[]>;
  rawAttributes?: ProductAttributeItem[];
  documents: ProductDocumentItem[];
}

export interface SeoSettings {
  siteUrl?: string;
  metaTitleDefault?: string;
  metaDescriptionDefault?: string;
  metaKeywordsDefault?: string;
  ogImageUrlDefault?: string;
  companyName?: string;
  telephone?: string;
  address?: string;
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

export interface ContactPageData {
  bannerTitle?: string;
  formTitle?: string;
  formSubtitle?: string;
  submitButtonText?: string;
  whatsappText?: string;
  whatsappNumber?: string;
  phone?: string;
  email?: string;
  schedule?: string;
  address?: string;
}

export interface ContactMessageItem {
  id: number;
  fullName: string;
  company: string;
  phone: string;
  email: string;
  message: string;
  status: "unread" | "read" | "replied";
  ipAddress?: string | null;
  createdAt: string;
}

export interface AboutValueItem {
  id: string;
  iconName: string;
  title: string;
  description: string;
}

export interface AboutMosaicItem {
  id: number;
  imageUrl: string;
  alt: string;
  title?: string;
  bgColor?: string;
}

export interface AboutUsPageData {
  bannerTitle?: string;
  storyTitle?: string;
  storyParagraph1?: string;
  storyParagraph2?: string;
  missionTitle?: string;
  missionText?: string;
  visionTitle?: string;
  visionText?: string;
  mosaicImages?: AboutMosaicItem[];
  valuesTitle?: string;
  values?: AboutValueItem[];
}


