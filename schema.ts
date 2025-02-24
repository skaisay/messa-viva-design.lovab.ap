import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegram_id: text("telegram_id").notNull().unique(),
  language: text("language").notNull().default("en"),
  crypto_api_key: text("crypto_api_key"),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image_url: text("image_url").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  public: boolean("public").default(true),
});

export const savedArticles = pgTable("saved_articles", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  article_id: integer("article_id").references(() => articles.id).notNull(),
  saved_at: timestamp("saved_at").defaultNow(),
});

// Упрощаем схему валидации для статей
export const insertArticleSchema = createInsertSchema(articles)
  .omit({ id: true, created_at: true })
  .extend({
    user_id: z.number().int(),
    image_url: z.string(),
    category: z.string(),
    title: z.string(),
    content: z.string(),
    public: z.boolean().default(true),
  });

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true })
  .extend({
    telegram_id: z.string(),
  });

export const insertSavedArticleSchema = createInsertSchema(savedArticles)
  .omit({ id: true, saved_at: true });

export const ArticleCategories = {
  PERSONAL: 'personal',
  NEWS: 'news',
  TECH: 'tech',
  PUBLIC: 'public'
} as const;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type InsertSavedArticle = z.infer<typeof insertSavedArticleSchema>;
export type User = typeof users.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type SavedArticle = typeof savedArticles.$inferSelect;