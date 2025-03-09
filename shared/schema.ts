import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  desktopUrl: text("desktop_url").notNull(),
  mobileUrl: text("mobile_url").notNull(),
  enabled: boolean("enabled").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDomainSchema = createInsertSchema(domains).pick({
  desktopUrl: true,
  mobileUrl: true,
  enabled: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Domain = typeof domains.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;