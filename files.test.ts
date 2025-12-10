import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  createJob: vi.fn().mockResolvedValue({ jobId: "test-job-123", downloadToken: "test-token-abc" }),
  getJobByJobId: vi.fn().mockResolvedValue({
    id: 1,
    jobId: "test-job-123",
    type: "convert",
    status: "completed",
    originalFilename: "test.pdf",
    originalSize: 1024,
    targetFormat: "docx",
    progress: 100,
    outputFileKey: "outputs/test-output.docx",
    outputSize: 512,
    downloadToken: "test-token-abc",
    tokenExpiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
  }),
  getJobByDownloadToken: vi.fn().mockResolvedValue({
    id: 1,
    jobId: "test-job-123",
    type: "convert",
    status: "completed",
    originalFilename: "test.pdf",
    originalSize: 1024,
    targetFormat: "docx",
    progress: 100,
    outputFileKey: "outputs/test-output.docx",
    outputSize: 512,
    downloadToken: "test-token-abc",
    tokenExpiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
  }),
  countRecentRequestsByIp: vi.fn().mockResolvedValue(0),
  getAdminStats: vi.fn().mockResolvedValue({ conversions24h: 10, pendingJobs: 2 }),
  updateJobStatus: vi.fn().mockResolvedValue(undefined),
}));

// Mock the file service
vi.mock("./fileService", () => ({
  validateConvertFile: vi.fn().mockReturnValue({ valid: true }),
  validateCompressFile: vi.fn().mockReturnValue({ valid: true }),
  sanitizeFilename: vi.fn().mockImplementation((name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_")),
  generateFileKey: vi.fn().mockReturnValue("inputs/test-file.pdf"),
  uploadFileToStorage: vi.fn().mockResolvedValue({ key: "inputs/test-file.pdf", url: "https://example.com/test-file.pdf" }),
  getFileDownloadUrl: vi.fn().mockResolvedValue("https://example.com/download/test-file.docx"),
  processConversionJob: vi.fn().mockResolvedValue(undefined),
  processCompressionJob: vi.fn().mockResolvedValue(undefined),
  getMimeType: vi.fn().mockReturnValue("application/pdf"),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "https://example.com/test" }),
  storageGet: vi.fn().mockResolvedValue({ key: "test-key", url: "https://example.com/test" }),
}));

function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {
        "x-forwarded-for": "127.0.0.1",
      },
      socket: {
        remoteAddress: "127.0.0.1",
      },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("files.health", () => {
  it("returns health status", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.files.health();

    expect(result).toHaveProperty("status", "ok");
    expect(result).toHaveProperty("timestamp");
    expect(result).toHaveProperty("version", "1.0.0");
  });
});

describe("files.status", () => {
  it("returns job status for valid jobId", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.files.status({ jobId: "test-job-123" });

    expect(result).toHaveProperty("jobId", "test-job-123");
    expect(result).toHaveProperty("status", "completed");
    expect(result).toHaveProperty("progress", 100);
    expect(result).toHaveProperty("type", "convert");
    expect(result).toHaveProperty("originalFilename", "test.pdf");
    expect(result).toHaveProperty("downloadToken", "test-token-abc");
  });
});

describe("files.download", () => {
  it("returns download URL for valid token", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.files.download({ token: "test-token-abc" });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("filename");
    expect(result).toHaveProperty("size");
  });
});

describe("files.convert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a conversion job successfully", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Create a small base64 encoded PDF placeholder
    const testFileData = Buffer.from("test pdf content").toString("base64");

    const result = await caller.files.convert({
      fileName: "test.pdf",
      fileData: testFileData,
      fileSize: 1024,
      mimeType: "application/pdf",
      targetFormat: "docx",
    });

    expect(result).toHaveProperty("jobId", "test-job-123");
    expect(result).toHaveProperty("status", "processing");
    expect(result).toHaveProperty("message", "Conversion started");
  });
});

describe("files.compress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a compression job successfully", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const testFileData = Buffer.from("test pdf content").toString("base64");

    const result = await caller.files.compress({
      fileName: "test.pdf",
      fileData: testFileData,
      fileSize: 1024,
      mimeType: "application/pdf",
      preset: "medium",
    });

    expect(result).toHaveProperty("jobId", "test-job-123");
    expect(result).toHaveProperty("status", "processing");
    expect(result).toHaveProperty("message", "Compression started");
  });
});

describe("files.adminStats", () => {
  it("rejects request when no admin token is configured", async () => {
    // When ADMIN_SECRET_TOKEN is empty/not set, all requests should be rejected
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.files.adminStats({ token: "any-token" })
    ).rejects.toThrow("Invalid admin token");
  });

  it("rejects invalid admin token", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.files.adminStats({ token: "wrong-token" })
    ).rejects.toThrow("Invalid admin token");
  });
});
