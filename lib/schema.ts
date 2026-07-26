import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  phonetic: text("phonetic"),
  meaning: text("meaning").notNull(),
  imageUrl: text("image_url"),
  displayDate: text("display_date").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
