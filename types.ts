/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

/**
 * Shared types for file conversion service
 */

export type ConversionType = "convert" | "compress";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type TargetFormat = "pdf" | "docx";

export type CompressionPreset = "high" | "medium" | "low";

export interface ConvertRequest {
  fileName: string;
  fileData: string; // base64 encoded
  fileSize: number;
  mimeType: string;
  targetFormat: TargetFormat;
}

export interface CompressRequest {
  fileName: string;
  fileData: string; // base64 encoded
  fileSize: number;
  mimeType: string;
  preset: CompressionPreset;
}

export interface JobResponse {
  jobId: string;
  status: JobStatus;
  message?: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress: number;
  type: ConversionType;
  originalFilename: string;
  originalSize: number;
  outputSize?: number;
  downloadToken?: string;
  errorMessage?: string;
}

export interface DownloadResponse {
  url: string;
  filename: string;
  size: number;
}

export interface HealthResponse {
  status: "ok";
  timestamp: string;
  version: string;
}

// File size limits
export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Allowed file types
export const ALLOWED_CONVERT_EXTENSIONS = [".pdf", ".docx"];
export const ALLOWED_COMPRESS_EXTENSIONS = [".pdf"];

// MIME types
export const MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;
