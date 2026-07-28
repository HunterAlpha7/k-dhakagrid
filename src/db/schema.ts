import { pgTable, uuid, varchar, integer, timestamp, pgEnum, doublePrecision } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["Green", "Yellow", "Red"]);
export const utilityEnum = pgEnum("utility_type", ["Electricity", "Water", "Gas"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  device_uuid: varchar("device_uuid", { length: 255 }).notNull().unique(),
  trust_score: integer("trust_score").default(1).notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  utility_type: utilityEnum("utility_type").notNull(),
  reporter_id: uuid("reporter_id").references(() => users.id).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
