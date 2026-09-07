export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
}

export interface IndustryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconName: string;
}

export interface BrandItem {
  id: number;
  name: string;
  logoText?: string;
  logoUrl?: string;
}

export const TRUST_BADGES = [
  { id: "prices", label: "Precios competitivos" },
  { id: "advisory", label: "Asesoramiento por volumen" },
  { id: "shipping", label: "Envío a todo el país" },
  { id: "quality", label: "Calidad garantizada" },
];

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 1,
    name: "Limpieza general",
    slug: "limpieza-general",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Detergentes y cuidado textil",
    slug: "detergentes-y-cuidado-textil",
    imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Higiene de manos",
    slug: "higiene-de-manos",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Papel e higiene",
    slug: "papel-e-higiene",
    imageUrl: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Jarcería y accesorios",
    slug: "jarceria-y-accesorios",
    imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    name: "Bolsas y manejo de residuos",
    slug: "bolsas-y-manejo-de-residuos",
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 7,
    name: "Seguridad y protección",
    slug: "seguridad-y-proteccion",
    imageUrl: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 8,
    name: "Cuidado automotriz",
    slug: "cuidado-automotriz",
    imageUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80",
  },
];

export const QUICK_TAGS = [
  "Cloro y desengrasante",
  "Bolsas y tachos",
  "Aromatizantes y controladores",
  "Dispensadores",
  "Escobas y complementos",
];

export const BRANDS_DATA: BrandItem[] = [
  { id: 1, name: "KARMAX", logoText: "KARMAX" },
  { id: 2, name: "KIRKLAND", logoText: "KIRKLAND" },
  { id: 3, name: "Reynera", logoText: "Reynera" },
  { id: 4, name: "Georgia-Pacific", logoText: "GP PRO" },
  { id: 5, name: "Wiese", logoText: "Wiese" },
  { id: 6, name: "Oval", logoText: "Oval" },
  { id: 7, name: "Rubbermaid", logoText: "Rubbermaid" },
];

export const INDUSTRIES_DATA: IndustryItem[] = [
  {
    id: 1,
    name: "Hoteles y hospitalidad",
    slug: "hoteles-y-hospitalidad",
    description: "Limpieza profunda y consumibles para habitaciones, áreas comunes y lavandería.",
    iconName: "Hotel",
  },
  {
    id: 2,
    name: "Restaurantes y cocina",
    slug: "restaurantes-y-cocina",
    description: "Productos para cocina, sanitización de superficies y áreas de preparación.",
    iconName: "UtensilsCrossed",
  },
  {
    id: 3,
    name: "Oficinas y corporativos",
    slug: "oficinas-y-corporativos",
    description: "Soluciones para áreas de trabajo, sanitarios comunes y mantenimiento diario.",
    iconName: "Building2",
  },
  {
    id: 4,
    name: "Condominios y torres",
    slug: "condominios-y-torres",
    description: "Productos para áreas comunes, amenidades, sanitarios y mantenimiento de edificios.",
    iconName: "Building",
  },
  {
    id: 5,
    name: "Clínicas, hospitales y laboratorios",
    slug: "clinicas-hospitales-laboratorios",
    description: "Higiene de alto nivel y consumibles adecuados para pacientes y áreas operativas.",
    iconName: "Stethoscope",
  },
  {
    id: 6,
    name: "Gimnasios y clubes deportivos",
    slug: "gimnasios-clubes-deportivos",
    description: "Limpieza exigente para equipos, vestidores, sanitarios y áreas comunes.",
    iconName: "Dumbbell",
  },
  {
    id: 7,
    name: "Empresas de limpieza y facility services",
    slug: "empresas-limpieza-facility",
    description: "Productos para abastecer cuadrillas de limpieza recurrentes o de alto consumo.",
    iconName: "Sparkles",
  },
  {
    id: 8,
    name: "Automotriz y car wash",
    slug: "automotriz-car-wash",
    description: "Insumos de lavado, ceras y complementos para estética y cuidado automotriz.",
    iconName: "Car",
  },
];

export const QUOTE_STEPS = [
  {
    step: 1,
    title: "Arma tu cotización",
    description: "Selecciona los productos y cantidades que tu empresa necesita desde el catálogo.",
    iconName: "ShoppingCart",
  },
  {
    step: 2,
    title: "Recibe una propuesta a tu medida",
    description: "Personalizada según el volumen y frecuencia de compra con precios competitivos.",
    iconName: "FileSpreadsheet",
  },
  {
    step: 3,
    title: "Confirma y recibe tu pedido",
    description: "Acuerda el pago y tiempo de entrega según la cobertura de tu zona.",
    iconName: "CheckCircle2",
  },
];
