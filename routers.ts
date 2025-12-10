import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createJob,
  getJobByJobId,
  getJobByDownloadToken,
  countRecentRequestsByIp,
  getAdminStats,
} from "./db";
import {
  validateConvertFile,
  validateCompressFile,
  sanitizeFilename,
  generateFileKey,
  uploadFileToStorage,
  getFileDownloadUrl,
  processConversionJob,
  processCompressionJob,
  getMimeType,
} from "./fileService";
import { TRPCError } from "@trpc/server";

// Configuration
const RATE_LIMIT_PER_MINUTE = parseInt(process.env.RATE_LIMIT_PER_MINUTE || "10", 10);
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "52428800", 10);
const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN || "";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // File conversion router
  files: router({
    /**
     * Convert file (PDF ⇄ DOCX)
     * Accepts base64 encoded file data
     */
    convert: publicProcedure
      .input(
        z.object({
          fileName: z.string().min(1).max(255),
          fileData: z.string(), // base64 encoded
          fileSize: z.number().positive().max(MAX_FILE_SIZE),
          mimeType: z.string(),
          targetFormat: z.enum(["pdf", "docx"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Get client IP for rate limiting
        const ipAddress = ctx.req.headers["x-forwarded-for"]?.toString().split(",")[0] || 
                         ctx.req.socket?.remoteAddress || 
                         "unknown";

        // Rate limiting check
        const recentRequests = await countRecentRequestsByIp(ipAddress);
        if (recentRequests >= RATE_LIMIT_PER_MINUTE) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Rate limit exceeded. Please try again later.",
          });
        }

        // Validate file
        const validation = validateConvertFile(
          {
            size: input.fileSize,
            mimetype: input.mimeType,
            originalname: input.fileName,
          },
          input.targetFormat
        );

        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.error || "Invalid file",
          });
        }

        // Decode and upload file to S3
        const fileBuffer = Buffer.from(input.fileData, "base64");
        const sanitizedName = sanitizeFilename(input.fileName);
        const inputKey = generateFileKey("inputs", sanitizedName, input.mimeType.includes("pdf") ? "pdf" : "docx");

        await uploadFileToStorage(fileBuffer, inputKey, input.mimeType);

        // Create job
        const jobResult = await createJob({
          type: "convert",
          originalFilename: sanitizedName,
          originalSize: input.fileSize,
          targetFormat: input.targetFormat,
          inputFileKey: inputKey,
          ipAddress,
        });

        if (!jobResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create conversion job",
          });
        }

        // Start async processing (fire and forget)
        processConversionJob(jobResult.jobId).catch(console.error);

        return {
          jobId: jobResult.jobId,
          status: "processing",
          message: "Conversion started",
        };
      }),

    /**
     * Compress PDF
     * Accepts base64 encoded file data
     */
    compress: publicProcedure
      .input(
        z.object({
          fileName: z.string().min(1).max(255),
          fileData: z.string(), // base64 encoded
          fileSize: z.number().positive().max(MAX_FILE_SIZE),
          mimeType: z.string(),
          preset: z.enum(["high", "medium", "low"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Get client IP for rate limiting
        const ipAddress = ctx.req.headers["x-forwarded-for"]?.toString().split(",")[0] || 
                         ctx.req.socket?.remoteAddress || 
                         "unknown";

        // Rate limiting check
        const recentRequests = await countRecentRequestsByIp(ipAddress);
        if (recentRequests >= RATE_LIMIT_PER_MINUTE) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Rate limit exceeded. Please try again later.",
          });
        }

        // Validate file
        const validation = validateCompressFile(
          {
            size: input.fileSize,
            mimetype: input.mimeType,
            originalname: input.fileName,
          },
          input.preset
        );

        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.error || "Invalid file",
          });
        }

        // Decode and upload file to S3
        const fileBuffer = Buffer.from(input.fileData, "base64");
        const sanitizedName = sanitizeFilename(input.fileName);
        const inputKey = generateFileKey("inputs", sanitizedName, "pdf");

        await uploadFileToStorage(fileBuffer, inputKey, input.mimeType);

        // Create job
        const jobResult = await createJob({
          type: "compress",
          originalFilename: sanitizedName,
          originalSize: input.fileSize,
          compressionPreset: input.preset,
          inputFileKey: inputKey,
          ipAddress,
        });

        if (!jobResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create compression job",
          });
        }

        // Start async processing (fire and forget)
        processCompressionJob(jobResult.jobId).catch(console.error);

        return {
          jobId: jobResult.jobId,
          status: "processing",
          message: "Compression started",
        };
      }),

    /**
     * Get job status
     */
    status: publicProcedure
      .input(z.object({ jobId: z.string().min(1) }))
      .query(async ({ input }) => {
        const job = await getJobByJobId(input.jobId);

        if (!job) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Job not found",
          });
        }

        const response: {
          jobId: string;
          status: string;
          progress: number;
          type: string;
          originalFilename: string;
          originalSize: number;
          outputSize?: number;
          downloadToken?: string;
          errorMessage?: string;
        } = {
          jobId: job.jobId,
          status: job.status,
          progress: job.progress,
          type: job.type,
          originalFilename: job.originalFilename,
          originalSize: job.originalSize,
        };

        if (job.status === "completed") {
          response.outputSize = job.outputSize || undefined;
          response.downloadToken = job.downloadToken || undefined;
        }

        if (job.status === "failed") {
          response.errorMessage = job.errorMessage || "Unknown error";
        }

        return response;
      }),

    /**
     * Get download URL for completed job
     */
    download: publicProcedure
      .input(z.object({ token: z.string().min(1) }))
      .query(async ({ input }) => {
        const job = await getJobByDownloadToken(input.token);

        if (!job) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Download not found or expired",
          });
        }

        if (!job.outputFileKey) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Output file not available",
          });
        }

        const downloadUrl = await getFileDownloadUrl(job.outputFileKey);
        const outputExt = job.targetFormat || "pdf";
        const outputFilename = job.originalFilename.replace(/\.[^.]+$/, `.${outputExt}`);

        return {
          url: downloadUrl,
          filename: outputFilename,
          size: job.outputSize || 0,
        };
      }),

    /**
     * Health check endpoint
     */
    health: publicProcedure.query(() => ({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    })),

    /**
     * Admin stats (protected by secret token)
     */
    adminStats: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        if (!ADMIN_SECRET_TOKEN || input.token !== ADMIN_SECRET_TOKEN) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid admin token",
          });
        }

        const stats = await getAdminStats();
        return {
          ...stats,
          timestamp: new Date().toISOString(),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
