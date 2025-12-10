import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, FileArchive, Gauge } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileUploader } from "@/components/FileUploader";
import { ProgressIndicator, DownloadReady } from "@/components/ProgressIndicator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ALLOWED_COMPRESS_EXTENSIONS, CompressionPreset } from "@shared/types";

type CompressionStep = "upload" | "processing" | "complete";

const presetInfo: Record<CompressionPreset, { label: string; description: string; icon: string }> = {
  high: {
    label: "High Quality",
    description: "Minimal compression, best quality",
    icon: "🎯",
  },
  medium: {
    label: "Balanced",
    description: "Good balance of size and quality",
    icon: "⚖️",
  },
  low: {
    label: "Maximum Compression",
    description: "Smallest file size",
    icon: "📦",
  },
};

export default function CompressTool() {
  const [step, setStep] = useState<CompressionStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<CompressionPreset>("medium");
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<{
    status: string;
    progress: number;
    outputSize?: number;
    downloadToken?: string;
    errorMessage?: string;
  } | null>(null);

  // Compress mutation
  const compressMutation = trpc.files.compress.useMutation({
    onSuccess: (data) => {
      setJobId(data.jobId);
      setStep("processing");
    },
    onError: (error) => {
      toast.error(error.message || "Compression failed");
    },
  });

  // Status polling query
  const statusQuery = trpc.files.status.useQuery(
    { jobId: jobId || "" },
    {
      enabled: !!jobId && step === "processing",
      refetchInterval: (query) => {
        const data = query.state.data;
        if (data?.status === "completed" || data?.status === "failed") {
          return false;
        }
        return 1000;
      },
    }
  );

  // Download query
  const downloadQuery = trpc.files.download.useQuery(
    { token: jobStatus?.downloadToken || "" },
    {
      enabled: false,
    }
  );

  // Update job status when query data changes
  useEffect(() => {
    if (statusQuery.data) {
      setJobStatus({
        status: statusQuery.data.status,
        progress: statusQuery.data.progress,
        outputSize: statusQuery.data.outputSize,
        downloadToken: statusQuery.data.downloadToken,
        errorMessage: statusQuery.data.errorMessage,
      });

      if (statusQuery.data.status === "completed") {
        setStep("complete");
      } else if (statusQuery.data.status === "failed") {
        toast.error(statusQuery.data.errorMessage || "Compression failed");
      }
    }
  }, [statusQuery.data]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setStep("upload");
    setJobId(null);
    setJobStatus(null);
  }, []);

  const handleCompress = async () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];

      compressMutation.mutate({
        fileName: selectedFile.name,
        fileData: base64,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        preset,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDownload = async () => {
    if (!jobStatus?.downloadToken) return;

    try {
      const result = await downloadQuery.refetch();
      if (result.data?.url) {
        const link = document.createElement("a");
        link.href = result.data.url;
        link.download = result.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started!");
      }
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleStartNew = () => {
    setSelectedFile(null);
    setStep("upload");
    setJobId(null);
    setJobStatus(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <FileArchive className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Compress PDF</h1>
                <p className="text-sm text-muted-foreground">
                  Reduce file size
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          {step === "upload" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* File Upload */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border">
                <h2 className="font-semibold text-lg mb-4">
                  1. Select Your PDF
                </h2>
                <FileUploader
                  accept=".pdf"
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onClear={handleClear}
                  acceptedTypes={ALLOWED_COMPRESS_EXTENSIONS}
                  disabled={compressMutation.isPending}
                />
              </div>

              {/* Preset Selection */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-6 shadow-sm border"
                >
                  <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Gauge className="w-5 h-5" />
                    2. Choose Compression Level
                  </h2>

                  <RadioGroup
                    value={preset}
                    onValueChange={(v) => setPreset(v as CompressionPreset)}
                    className="space-y-3"
                  >
                    {(Object.keys(presetInfo) as CompressionPreset[]).map(
                      (key) => (
                        <Label
                          key={key}
                          htmlFor={`preset-${key}`}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            preset === key
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value={key} id={`preset-${key}`} />
                          <span className="text-2xl">
                            {presetInfo[key].icon}
                          </span>
                          <div className="flex-1">
                            <span className="font-medium">
                              {presetInfo[key].label}
                            </span>
                            <p className="text-sm text-muted-foreground">
                              {presetInfo[key].description}
                            </p>
                          </div>
                          {key === "medium" && (
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                              Recommended
                            </span>
                          )}
                        </Label>
                      )
                    )}
                  </RadioGroup>
                </motion.div>
              )}

              {/* Compress Button */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={handleCompress}
                    disabled={compressMutation.isPending}
                    className="w-full py-6 text-lg bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    {compressMutation.isPending ? (
                      "Uploading..."
                    ) : (
                      <>
                        Compress PDF
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === "processing" && jobStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-2xl p-6 shadow-sm border">
                <h2 className="font-semibold text-lg mb-4">
                  Compressing Your PDF
                </h2>
                <ProgressIndicator
                  status={jobStatus.status as any}
                  progress={jobStatus.progress}
                  message={`Compressing ${selectedFile?.name} with ${presetInfo[preset].label.toLowerCase()} settings`}
                />
              </div>
            </motion.div>
          )}

          {step === "complete" && jobStatus && selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <DownloadReady
                filename={selectedFile.name.replace(".pdf", "-compressed.pdf")}
                originalSize={selectedFile.size}
                outputSize={jobStatus.outputSize || 0}
                onDownload={handleDownload}
                isDownloading={downloadQuery.isFetching}
              />

              <Button
                variant="outline"
                onClick={handleStartNew}
                className="w-full"
              >
                Compress Another PDF
              </Button>
            </motion.div>
          )}

          {/* Info Section */}
          <div className="mt-8 p-4 bg-muted/50 rounded-xl">
            <h3 className="font-medium text-sm mb-2">Compression Levels</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <strong>High Quality:</strong> ~20% size reduction, best for
                printing
              </li>
              <li>
                • <strong>Balanced:</strong> ~50% size reduction, good for
                sharing
              </li>
              <li>
                • <strong>Maximum:</strong> ~70% size reduction, best for web
              </li>
              <li>• Files are automatically deleted after 60 minutes</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
