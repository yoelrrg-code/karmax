import type {
  CategoryItem,
  IndustryItem,
  BrandItem,
  TrustBadgeItem,
  QuoteStepItem,
} from "@/types";

export type {
  CategoryItem,
  IndustryItem,
  BrandItem,
  TrustBadgeItem,
  QuoteStepItem,
};

export const TRUST_BADGES: TrustBadgeItem[] = [
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
    featured: true,
  },
  {
    id: 2,
    name: "Detergentes y cuidado textil",
    slug: "detergentes-y-cuidado-textil",
    imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80",
    featured: true,
  },
  {
    id: 3,
    name: "Higiene de manos",
    slug: "higiene-de-manos",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    featured: true,
  },
  {
    id: 4,
    name: "Papel e higiene",
    slug: "papel-e-higiene",
    imageUrl: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=600&q=80",
    featured: true,
  },
  {
    id: 5,
    name: "Jarcería y accesorios",
    slug: "jarceria-y-accesorios",
    imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80",
    featured: true,
  },
  {
    id: 6,
    name: "Bolsas y manejo de residuos",
    slug: "bolsas-y-manejo-de-residuos",
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    featured: true,
  },
  {
    id: 7,
    name: "Seguridad y protección",
    slug: "seguridad-y-proteccion",
    imageUrl: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80",
    featured: true,
  },
  {
    id: 8,
    name: "Cuidado automotriz",
    slug: "cuidado-automotriz",
    imageUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80",
    featured: true,
  },
  // Categorías complementarias (featured: false)
  {
    id: 9,
    name: "Cocina y desengrase",
    slug: "cocina-y-desengrase",
    imageUrl: "",
    featured: false,
  },
  {
    id: 10,
    name: "Baños y sanitarios",
    slug: "banos-y-sanitarios",
    imageUrl: "",
    featured: false,
  },
  {
    id: 11,
    name: "Aromatización y control de olores",
    slug: "aromatizacion-y-control-de-olores",
    imageUrl: "",
    featured: false,
  },
  {
    id: 12,
    name: "Dispensadores",
    slug: "dispensadores",
    imageUrl: "",
    featured: false,
  },
  {
    id: 13,
    name: "Mascotas y complementos",
    slug: "mascotas-y-complementos",
    imageUrl: "",
    featured: false,
  },
  {
    id: 14,
    name: "Control de plagas",
    slug: "control-de-plagas",
    imageUrl: "",
    featured: false,
  },
  {
    id: 15,
    name: "Industria & Manufactura",
    slug: "industria-y-manufactura",
    imageUrl: "",
    featured: false,
  },
  {
    id: 16,
    name: "Oficinas & Corporativos",
    slug: "oficinas-y-corporativos",
    imageUrl: "",
    featured: false,
  },
  {
    id: 17,
    name: "Restaurantes & Cocinas",
    slug: "restaurantes-y-cocinas",
    imageUrl: "",
    featured: false,
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
  { id: 1, name: "KARMAX", logoText: "KARMAX", logoUrl: "/images/brands/l-karmax.svg" },
  { id: 2, name: "KIRKLAND", logoText: "KIRKLAND", logoUrl: "/images/brands/l-kirkland.svg" },
  { id: 3, name: "Reynera", logoText: "Reynera", logoUrl: "/images/brands/l-reynera.svg" },
  { id: 4, name: "Members Mark", logoText: "Members Mark", logoUrl: "/images/brands/l-membersmark.svg" },
  { id: 5, name: "Wiese", logoText: "Wiese", logoUrl: "/images/brands/l-wiese.svg" },
  { id: 6, name: "Oval", logoText: "Oval", logoUrl: "/images/brands/l-oval.svg" },
  { id: 7, name: "Arcoiris", logoText: "Arcoiris", logoUrl: "/images/brands/l-arcoiris.svg" },
];

export const INDUSTRIES_DATA: IndustryItem[] = [
  {
    id: 1,
    name: "Hoteles y hospitalidad",
    slug: "hoteles-y-hospitalidad",
    description: "Limpieza, higiene y consumibles para habitaciones, áreas comunes y lavandería.",
    iconName: "Hotel",
    iconUrl: "/icons/ico-hoteles.svg",
    catLink: "/category/hoteles-y-hospitalidad"
  },
  {
    id: 2,
    name: "Restaurantes y cocina",
    slug: "restaurantes-y-cocina",
    description: "Productos para cocina, sanitización, lavado, áreas de servicio y manejo de residuos.",
    iconName: "UtensilsCrossed",
    iconUrl: "/icons/ico-restaurantes.svg",
    catLink: "/category/restaurantes-y-cocinas"
  },
  {
    id: 3,
    name: "Oficinas y corporativos",
    slug: "oficinas-y-corporativos",
    description: "Soluciones para áreas de trabajo, sanitarios, cafeterías y mantenimiento diario.",
    iconName: "Building2",
    iconUrl: "/icons/ico-oficinas.svg",
    catLink: "/category/oficinas-y-corporativos"
  },
  {
    id: 4,
    name: "Condominios y torres",
    slug: "condominios-y-torres",
    description: "Productos para áreas comunes, amenidades, sanitarios y mantenimiento de edificios.",
    iconName: "Building",
    iconUrl: "/icons/ico-condominium.svg",
    catLink: "/category/industria-y-manufactura"
  },
  {
    id: 5,
    name: "Clínicas, hospitales y laboratorios",
    slug: "clinicas-hospitales-laboratorios",
    description: "Higiene, limpieza y consumibles para espacios de atención y áreas operativas.",
    iconName: "Stethoscope",
    iconUrl: "/icons/ico-clinicas.svg",
    catLink: "/category/hospitales-clinicas"
  },
  {
    id: 6,
    name: "Gimnasios y clubes deportivos",
    slug: "gimnasios-clubes-deportivos",
    description: "Limpieza e higiene para equipos, vestidores, sanitarios y áreas comunes.",
    iconName: "Dumbbell",
    iconUrl: "/icons/ico-gimnasios.svg",
    catLink: "/category/quimicos-limpieza"
  },
  {
    id: 7,
    name: "Empresas de limpieza y facility services",
    slug: "empresas-limpieza-facility",
    description: "Productos para abastecer operaciones de limpieza recurrentes y de alto consumo.",
    iconName: "Sparkles",
    iconUrl: "/icons/ico-limpieza.svg",
    catLink: "/category/limpieza-general"
  },
  {
    id: 8,
    name: "Automotriz y car wash",
    slug: "automotriz-car-wash",
    description: "Shampoo, abrillantadores y complementos para lavado y cuidado automotriz.",
    iconName: "Car",
    iconUrl: "/icons/ico-carwash.svg",
    catLink: "/category/automotriz"
  },
];

export const QUOTE_STEPS = [
  {
    step: 1,
    title: "Arma tu cotización",
    description: "Selecciona los productos y presentaciones que necesitas para obtener una cotización en línea.",
    iconUrl: "/icons/paso-1.svg",
  },
  {
    step: 2,
    title: "Recibe una propuesta a tu medida",
    description: "Revisamos tu solicitud y te contactamos para confirmar precios, disponibilidad y condiciones.",
    iconUrl: "/icons/paso-2.svg",
  },
  {
    step: 3,
    title: "Confirma y recibe tu pedido",
    description: "Aprueba la propuesta y coordina la entrega para que tu operación siga siempre abastecida.",
    iconUrl: "/icons/paso-3.svg",
  },
];
