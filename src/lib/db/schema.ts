import {
  mysqlTable,
  serial,
  varchar,
  text,
  int,
  bigint,
  boolean,
  timestamp,
  decimal,
  json,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 1024 }),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  featured: boolean("featured").default(false).notNull(),
  orderIndex: int("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = mysqlTable(
  "products",
  {
    id: serial("id").primaryKey(),
    categoryId: int("category_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    sku: varchar("sku", { length: 100 }),
    brand: varchar("brand", { length: 150 }).default("KARMAX"),
    unit: varchar("unit", { length: 100 }).default("Pieza"),
    shortDescription: text("short_description"),
    description: text("description"),
    imageUrl: varchar("image_url", { length: 1024 }),
    regularPrice: decimal("regular_price", { precision: 10, scale: 2 }),
    salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
    stockStatus: varchar("stock_status", { length: 50 }).default("instock").notNull(),
    postStatus: varchar("post_status", { length: 50 }).default("publish").notNull(),
    postDate: timestamp("post_date"),
    deliveryInfo: text("delivery_info"),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    metaKeywords: varchar("meta_keywords", { length: 500 }),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("products_category_id_idx").on(table.categoryId),
    index("products_is_active_idx").on(table.isActive),
    index("products_is_featured_idx").on(table.isFeatured),
    index("products_sku_idx").on(table.sku),
    index("products_active_cat_idx").on(table.isActive, table.categoryId),
  ]
);

export const productImages = mysqlTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
    url: varchar("url", { length: 1024 }).notNull(),
    alt: varchar("alt", { length: 255 }),
    title: varchar("title", { length: 255 }),
    caption: text("caption"),
    isPrimary: boolean("is_primary").default(false).notNull(),
    orderIndex: int("order_index").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("product_images_product_id_idx").on(table.productId)]
);

export const industries = mysqlTable("industries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  iconName: varchar("icon_name", { length: 100 }).notNull(),
  iconUrl: varchar("icon_url", { length: 1024 }),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  orderIndex: int("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const productCategories = mysqlTable(
  "product_categories",
  {
    id: serial("id").primaryKey(),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
    categoryId: int("category_id").notNull(),
  },
  (table) => [
    index("product_categories_product_id_idx").on(table.productId),
    index("product_categories_category_id_idx").on(table.categoryId),
  ]
);

export const productIndustries = mysqlTable(
  "product_industries",
  {
    id: serial("id").primaryKey(),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
    industryId: bigint("industry_id", { mode: "number", unsigned: true }).notNull(),
  },
  (table) => [
    index("product_industries_product_id_idx").on(table.productId),
    index("product_industries_industry_id_idx").on(table.industryId),
  ]
);

export const productAttributes = mysqlTable(
  "product_attributes",
  {
    id: serial("id").primaryKey(),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    sku: varchar("sku", { length: 100 }),
    attrPrice: decimal("attr_price", { precision: 10, scale: 2 }),
    orderIndex: int("order_index").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("product_attributes_product_id_idx").on(table.productId),
    index("product_attributes_sku_idx").on(table.sku),
  ]
);

export const productVariants = mysqlTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
    sku: varchar("sku", { length: 100 }).notNull().unique(),
    price: decimal("price", { precision: 10, scale: 2 }),
    stockStatus: varchar("stock_status", { length: 50 }).default("instock").notNull(),
    attributes: json("attributes").$type<Record<string, string>>().notNull(),
    orderIndex: int("order_index").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("product_variants_product_id_idx").on(table.productId)]
);

export const productDocuments = mysqlTable(
  "product_documents",
  {
    id: serial("id").primaryKey(),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    fileUrl: varchar("file_url", { length: 1024 }).notNull(),
    fileType: varchar("file_type", { length: 50 }).default("pdf").notNull(),
    fileSize: varchar("file_size", { length: 50 }),
    orderIndex: int("order_index").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("product_documents_product_id_idx").on(table.productId)]
);

export const roles = mysqlTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = mysqlTable(
  "users",
  {
    id: serial("id").primaryKey(),
    roleId: bigint("role_id", { mode: "number", unsigned: true }).notNull().default(2),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 50 }),
    companyName: varchar("company_name", { length: 255 }),
    passwordHash: varchar("password_hash", { length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0.00").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("users_role_id_idx").on(table.roleId),
    index("users_is_active_idx").on(table.isActive),
  ]
);

export const quoteRequests = mysqlTable(
  "quote_requests",
  {
    id: serial("id").primaryKey(),
    quoteNumber: varchar("quote_number", { length: 50 }),
    userId: bigint("user_id", { mode: "number", unsigned: true }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    companyName: varchar("company_name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    notes: text("notes"),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
    tax: decimal("tax", { precision: 10, scale: 2 }),
    total: decimal("total", { precision: 10, scale: 2 }),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("quote_requests_user_id_idx").on(table.userId),
    index("quote_requests_quote_number_idx").on(table.quoteNumber),
    index("quote_requests_status_idx").on(table.status),
    index("quote_requests_created_at_idx").on(table.createdAt),
  ]
);

export const quoteItems = mysqlTable(
  "quote_items",
  {
    id: serial("id").primaryKey(),
    quoteRequestId: int("quote_request_id").notNull(),
    productId: int("product_id"),
    productName: varchar("product_name", { length: 255 }).notNull(),
    presentation: varchar("presentation", { length: 100 }),
    sku: varchar("sku", { length: 100 }),
    imageUrl: varchar("image_url", { length: 1024 }),
    quantity: int("quantity").default(1).notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
    notes: text("notes"),
  },
  (table) => [
    index("quote_items_quote_request_id_idx").on(table.quoteRequestId),
    index("quote_items_product_id_idx").on(table.productId),
  ]
);

// Relaciones
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  quotes: many(quoteRequests),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  productCategories: many(productCategories),
}));

export const industriesRelations = relations(industries, ({ many }) => ({
  productIndustries: many(productIndustries),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, {
    fields: [productCategories.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [productCategories.categoryId],
    references: [categories.id],
  }),
}));

export const productIndustriesRelations = relations(productIndustries, ({ one }) => ({
  product: one(products, {
    fields: [productIndustries.productId],
    references: [products.id],
  }),
  industry: one(industries, {
    fields: [productIndustries.industryId],
    references: [industries.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  productCategories: many(productCategories),
  productIndustries: many(productIndustries),
  images: many(productImages),
  attributes: many(productAttributes),
  variants: many(productVariants),
  documents: many(productDocuments),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const productAttributesRelations = relations(productAttributes, ({ one }) => ({
  product: one(products, {
    fields: [productAttributes.productId],
    references: [products.id],
  }),
}));

export const productDocumentsRelations = relations(productDocuments, ({ one }) => ({
  product: one(products, {
    fields: [productDocuments.productId],
    references: [products.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const quoteRequestsRelations = relations(quoteRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [quoteRequests.userId],
    references: [users.id],
  }),
  items: many(quoteItems),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quoteRequest: one(quoteRequests, {
    fields: [quoteItems.quoteRequestId],
    references: [quoteRequests.id],
  }),
  product: one(products, {
    fields: [quoteItems.productId],
    references: [products.id],
  }),
}));

export const siteSettings = mysqlTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  section: varchar("section", { length: 100 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactMessages = mysqlTable(
  "contact_messages",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    company: varchar("company", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    message: text("message").notNull(),
    status: varchar("status", { length: 50 }).default("unread").notNull(),
    ipAddress: varchar("ip_address", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("contact_messages_status_idx").on(table.status),
    index("contact_messages_created_at_idx").on(table.createdAt),
  ]
);

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Industry = typeof industries.$inferSelect;
export type ProductCategory = typeof productCategories.$inferSelect;
export type ProductIndustry = typeof productIndustries.$inferSelect;
export type ProductAttribute = typeof productAttributes.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductDocument = typeof productDocuments.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type User = typeof users.$inferSelect;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;

