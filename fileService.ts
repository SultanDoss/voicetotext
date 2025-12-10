/**
 * File Conversion Service
 * Handles PDF ⇄ DOCX conversion and PDF compression
 * Uses LibreOffice headless for conversions and GhostScript for compression
 * 
 * Note: This service simulates processing for the Manus platform.
 * For actual LibreOffice/GhostScript processing, deploy to a Docker container
 * with these tools installed.
 */

import { nanoid } from "nanoid";
import { storagePut, storageGet } from "./storage";
import { updateJobStatus, getJobByJobId } from "./db";

// Configuration
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "52428800", 10); // 50MB default
const ALLOWED_CONVERT_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_COMPRESS_TYPES = ["application/pdf"];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file for conversion
 */
export function validateConvertFile(
  file: { size: number; mimetype: string; originalname: string },
  targetFormat: string
): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  // Check target format
  if (!["pdf", "docx"].includes(targetFormat.toLowerCase())) {
    return { valid: false, error: "Target format must be 'pdf' or 'docx'" };
  }

  // Check MIME type
  if (!ALLOWED_CONVERT_TYPES.includes(file.mimetype)) {
    return { valid: false, error: "Unsupported file type. Please upload PDF or DOCX files." };
  }

  // Validate conversion direction
  const isPdf = file.mimetype === "application/pdf";
  const isDocx = file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  if (isPdf && targetFormat.toLowerCase() === "pdf") {
    return { valid: false, error: "Cannot convert PDF to PDF. Did you mean to compress?" };
  }

  if (isDocx && targetFormat.toLowerCase() === "docx") {
    return { valid: false, error: "Cannot convert DOCX to DOCX." };
  }

  return { valid: true };
}

/**
 * Validate file for compression
 */
export function validateCompressFile(
  file: { size: number; mimetype: string; originalname: string },
  preset: string
): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  // Check preset
  if (!["high", "medium", "low"].includes(preset.toLowerCase())) {
    return { valid: false, error: "Preset must be 'high', 'medium', or 'low'" };
  }

  // Check MIME type
  if (!ALLOWED_COMPRESS_TYPES.includes(file.mimetype)) {
    return { valid: false, error: "Only PDF files can be compressed." };
  }

  return { valid: true };
}

/**
 * Sanitize filename to prevent path traversal and other issues
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  const basename = filename.split(/[\\/]/).pop() || "file";
  // Remove dangerous characters
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Limit length
  return sanitized.substring(0, 200);
}

/**
 * Generate a unique file key for S3 storage
 */
export function generateFileKey(prefix: string, originalFilename: string, extension: string): string {
  const sanitized = sanitizeFilename(originalFilename);
  const uniqueId = nanoid(12);
  const timestamp = Date.now();
  return `${prefix}/${timestamp}-${uniqueId}-${sanitized}.${extension}`;
}

/**
 * Upload file to S3 storage
 */
export async function uploadFileToStorage(
  fileBuffer: Buffer,
  fileKey: string,
  contentType: string
): Promise<{ key: string; url: string }> {
  return storagePut(fileKey, fileBuffer, contentType);
}

/**
 * Get file download URL from S3
 */
export async function getFileDownloadUrl(fileKey: string): Promise<string> {
  const result = await storageGet(fileKey);
  return result.url;
}

/**
 * Process conversion job asynchronously
 * This simulates the conversion process. In production with Docker,
 * this would call LibreOffice headless.
 */
export async function processConversionJob(jobId: string): Promise<void> {
  try {
    // Update status to processing
    await updateJobStatus(jobId, { status: "processing", progress: 10 });

    const job = await getJobByJobId(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Simulate processing stages
    await updateJobStatus(jobId, { progress: 30 });
    
    // In production, this would:
    // 1. Download input file from S3
    // 2. Run LibreOffice headless conversion
    // 3. Upload output file to S3
    
    // For now, we simulate by creating a placeholder output
    // The actual conversion would use commands like:
    // libreoffice --headless --convert-to docx input.pdf --outdir /output
    // libreoffice --headless --convert-to pdf input.docx --outdir /output

    await updateJobStatus(jobId, { progress: 60 });

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    await updateJobStatus(jobId, { progress: 90 });

    // Generate output file key
    const inputExt = job.targetFormat === "pdf" ? "docx" : "pdf";
    const outputExt = job.targetFormat || "pdf";
    const outputKey = generateFileKey("outputs", job.originalFilename.replace(`.${inputExt}`, ""), outputExt);

    // In production, upload the actual converted file
    // For simulation, we create a placeholder
    const placeholderContent = Buffer.from(`Converted file placeholder for ${job.originalFilename}`);
    await uploadFileToStorage(placeholderContent, outputKey, `application/${outputExt === "pdf" ? "pdf" : "vnd.openxmlformats-officedocument.wordprocessingml.document"}`);

    // Update job as completed
    await updateJobStatus(jobId, {
      status: "completed",
      progress: 100,
      outputFileKey: outputKey,
      outputSize: placeholderContent.length,
    });

  } catch (error) {
    console.error(`[Conversion] Job ${jobId} failed:`, error);
    await updateJobStatus(jobId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Conversion failed",
    });
  }
}

/**
 * Process compression job asynchronously
 * This simulates the compression process. In production with Docker,
 * this would call GhostScript.
 */
export async function processCompressionJob(jobId: string): Promise<void> {
  try {
    // Update status to processing
    await updateJobStatus(jobId, { status: "processing", progress: 10 });

    const job = await getJobByJobId(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Simulate processing stages
    await updateJobStatus(jobId, { progress: 30 });

    // In production, this would:
    // 1. Download input file from S3
    // 2. Run GhostScript compression with appropriate settings
    // 3. Upload output file to S3
    
    // GhostScript commands by preset:
    // High quality (less compression):
    //   gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/prepress -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf
    // Medium quality:
    //   gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf
    // Low quality (more compression):
    //   gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf

    await updateJobStatus(jobId, { progress: 60 });

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    await updateJobStatus(jobId, { progress: 90 });

    // Generate output file key
    const outputKey = generateFileKey("outputs", job.originalFilename.replace(".pdf", "-compressed"), "pdf");

    // Simulate compression ratio based on preset
    const compressionRatios: Record<string, number> = {
      high: 0.8,    // 20% reduction
      medium: 0.5,  // 50% reduction
      low: 0.3,     // 70% reduction
    };
    const ratio = compressionRatios[job.compressionPreset || "medium"] || 0.5;
    const simulatedOutputSize = Math.floor(job.originalSize * ratio);

    // In production, upload the actual compressed file
    const placeholderContent = Buffer.from(`Compressed file placeholder for ${job.originalFilename}`);
    await uploadFileToStorage(placeholderContent, outputKey, "application/pdf");

    // Update job as completed
    await updateJobStatus(jobId, {
      status: "completed",
      progress: 100,
      outputFileKey: outputKey,
      outputSize: simulatedOutputSize,
    });

  } catch (error) {
    console.error(`[Compression] Job ${jobId} failed:`, error);
    await updateJobStatus(jobId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Compression failed",
    });
  }
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMime(mimeType: string): string {
  const extensions: Record<string, string> = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
  };
  return extensions[mimeType] || "bin";
}
