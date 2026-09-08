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
