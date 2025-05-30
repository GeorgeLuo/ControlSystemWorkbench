import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  data: jsonb("data").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const blocks = pgTable("blocks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  type: text("type").notNull(),
  position: jsonb("position").notNull(),
  properties: jsonb("properties").notNull(),
});

export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  sourceBlockId: integer("source_block_id").notNull(),
  targetBlockId: integer("target_block_id").notNull(),
  sourcePort: text("source_port").notNull(),
  targetPort: text("target_port").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  userId: true,
  data: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlockSchema = createInsertSchema(blocks).pick({
  projectId: true,
  type: true,
  position: true,
  properties: true,
});

export const insertConnectionSchema = createInsertSchema(connections).pick({
  projectId: true,
  sourceBlockId: true,
  targetBlockId: true,
  sourcePort: true,
  targetPort: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type Block = typeof blocks.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;
