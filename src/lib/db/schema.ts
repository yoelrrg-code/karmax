import {
  mysqlTable,
  serial,
  varchar,
  text,
  int,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 1024 }),
  orderIndex: int("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  categoryId: int("category_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  sku: varchar("sku", { length: 100 }),
  brand: varchar("brand", { length: 150 }).default("KARMAX"),
  unit: varchar("unit", { length: 100 }).default("Pieza"), // Galón, Bidón, Caja, Pieza
  shortDescription: varchar("short_description", { length: 500 }),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 1024 }),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const industries = mysqlTable("industries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  iconName: varchar("icon_name", { length: 100 }).notNull(),
  orderIndex: int("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const quoteRequests = mysqlTable("quote_requests", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quoteItems = mysqlTable("quote_items", {
  id: serial("id").primaryKey(),
  quoteRequestId: int("quote_request_id").notNull(),
  productId: int("product_id"),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  notes: text("notes"),
});

// Relaciones
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const quoteRequestsRelations = relations(quoteRequests, ({ many }) => ({
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

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Industry = typeof industries.$inferSelect;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type QuoteItem = typeof quoteItems.$inferSelect;
