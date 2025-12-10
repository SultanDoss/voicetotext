import { bigint, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Conversion/compression jobs table.
 * Tracks file processing jobs for anonymous users.
 */
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique job identifier for public API */
  jobId: varchar("jobId", { length: 64 }).notNull().unique(),
  /** Type of operation: convert or compress */
  type: mysqlEnum("type", ["convert", "compress"]).notNull(),
  /** Current status of the job */
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  /** Original filename */
  originalFilename: varchar("originalFilename", { length: 255 }).notNull(),
  /** Original file size in bytes */
  originalSize: bigint("originalSize", { mode: "number" }).notNull(),
  /** Target format for conversion (pdf or docx) */
  targetFormat: varchar("targetFormat", { length: 10 }),
  /** Compression preset (high, medium, low) */
  compressionPreset: varchar("compressionPreset", { length: 10 }),
  /** S3 key for input file */
  inputFileKey: varchar("inputFileKey", { length: 512 }).notNull(),
  /** S3 key for output file */
  outputFileKey: varchar("outputFileKey", { length: 512 }),
  /** Output file size in bytes */
  outputSize: bigint("outputSize", { mode: "number" }),
  /** Progress percentage (0-100) */
  progress: int("progress").default(0).notNull(),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  /** Download token for secure access */
  downloadToken: varchar("downloadToken", { length: 128 }),
  /** Token expiration timestamp */
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  /** IP address of requester for rate limiting */
  ipAddress: varchar("ipAddress", { length: 45 }),
  /** Job creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Last update timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  /** Scheduled deletion timestamp */
  expiresAt: timestamp("expiresAt").notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;
