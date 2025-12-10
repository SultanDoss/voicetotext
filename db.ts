import { and, eq, gt, gte, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertJob, InsertUser, jobs, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Job-related functions ============

const FILE_TTL_MINUTES = parseInt(process.env.FILE_TTL_MINUTES || "60", 10);

/**
 * Create a new conversion/compression job
 */
export async function createJob(params: {
  type: "convert" | "compress";
  originalFilename: string;
  originalSize: number;
  targetFormat?: string;
  compressionPreset?: string;
  inputFileKey: string;
  ipAddress?: string;
}): Promise<{ jobId: string; downloadToken: string } | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create job: database not available");
    return null;
  }

  const jobId = nanoid(16);
  const downloadToken = nanoid(32);
  const expiresAt = new Date(Date.now() + FILE_TTL_MINUTES * 60 * 1000);
  const tokenExpiresAt = new Date(Date.now() + FILE_TTL_MINUTES * 60 * 1000);

  const jobData: InsertJob = {
    jobId,
    type: params.type,
    status: "pending",
    originalFilename: params.originalFilename,
    originalSize: params.originalSize,
    targetFormat: params.targetFormat || null,
    compressionPreset: params.compressionPreset || null,
    inputFileKey: params.inputFileKey,
    downloadToken,
    tokenExpiresAt,
    ipAddress: params.ipAddress || null,
    expiresAt,
    progress: 0,
  };

  await db.insert(jobs).values(jobData);
  return { jobId, downloadToken };
}

/**
 * Get job by jobId
 */
export async function getJobByJobId(jobId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(jobs).where(eq(jobs.jobId, jobId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get job by download token (for secure downloads)
 */
export async function getJobByDownloadToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;

  const now = new Date();
  const result = await db
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.downloadToken, token),
        gt(jobs.tokenExpiresAt, now),
        eq(jobs.status, "completed")
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update job status and progress
 */
export async function updateJobStatus(
  jobId: string,
  updates: {
    status?: "pending" | "processing" | "completed" | "failed";
    progress?: number;
    outputFileKey?: string;
    outputSize?: number;
    errorMessage?: string;
  }
) {
  const db = await getDb();
  if (!db) return;

  await db.update(jobs).set(updates).where(eq(jobs.jobId, jobId));
}

/**
 * Get expired jobs for cleanup
 */
export async function getExpiredJobs() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return db.select().from(jobs).where(lt(jobs.expiresAt, now));
}

/**
 * Delete job by id
 */
export async function deleteJob(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(jobs).where(eq(jobs.id, id));
}

/**
 * Count requests from IP in the last minute (for rate limiting)
 */
export async function countRecentRequestsByIp(ipAddress: string, minutes: number = 1): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const since = new Date(Date.now() - minutes * 60 * 1000);
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(jobs)
    .where(and(eq(jobs.ipAddress, ipAddress), gte(jobs.createdAt, since)));

  return result[0]?.count || 0;
}

/**
 * Get admin stats (last 24h conversions, pending jobs)
 */
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { conversions24h: 0, pendingJobs: 0 };

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [conversions, pending] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(gte(jobs.createdAt, since24h)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(eq(jobs.status, "pending")),
  ]);

  return {
    conversions24h: conversions[0]?.count || 0,
    pendingJobs: pending[0]?.count || 0,
  };
}
