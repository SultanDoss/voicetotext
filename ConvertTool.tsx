import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, FileType2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileUploader } from "@/components/FileUploader";
import { ProgressIndicator, DownloadReady } from "@/components/ProgressIndicator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ALLOWED_CONVERT_EXTENSIONS, TargetFormat } from "@shared/types";

type ConversionStep = "upload" | "processing" | "complete";

export default function ConvertTool() {
  const [step, setStep] = useState<ConversionStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("docx");
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<{
    status: string;
    progress: number;
    outputSize?: number;
    downloadToken?: string;
    errorMessage?: string;
  } | null>(null);

  // Convert mutation
  const convertMutation = trpc.files.convert.useMutation({
    onSuccess: (data) => {
      setJobId(data.jobId);
      setStep("processing");
    },
    onError: (error) => {
      toast.error(error.message || "Conversion failed");
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
        return 1000; // Poll every second
      },
    }
  );

  // Download query
  const downloadQuery = trpc.files.download.useQuery(
    { token: jobStatus?.downloadToken || "" },
    {
      enabled: false, // Manual trigger
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
        toast.error(statusQuery.data.errorMessage || "Conversion failed");
      }
    }
  }, [statusQuery.data]);

  // Determine available target format based on selected file
  useEffect(() => {
    if (selectedFile) {
      const ext = selectedFile.name.toLowerCase().split(".").pop();
      if (ext === "pdf") {
        setTargetFormat("docx");
      } else if (ext === "docx") {
        setTargetFormat("pdf");
      }
    }
  }, [selectedFile]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setStep("upload");
    setJobId(null);
    setJobStatus(null);
  }, []);

  const handleConvert = async () => {
    if (!selectedFile) return;

    // Read file as base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];

      convertMutation.mutate({
        fileName: selectedFile.name,
        fileData: base64,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        targetFormat,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDownload = async () => {
    if (!jobStatus?.downloadToken) return;

    try {
      const result = await downloadQuery.refetch();
      if (result.data?.url) {
        // Create a temporary link and trigger download
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

  const isPdf = selectedFile?.name.toLowerCase().endsWith(".pdf");
  const isDocx = selectedFile?.name.toLowerCase().endsWith(".docx");

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
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileType2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Convert File</h1>
                <p className="text-sm text-muted-foreground">
                  PDF ⇄ DOCX Conversion
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
                  1. Select Your File
                </h2>
                <FileUploader
                  accept=".pdf,.docx"
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onClear={handleClear}
                  acceptedTypes={ALLOWED_CONVERT_EXTENSIONS}
                  disabled={convertMutation.isPending}
                />
              </div>

              {/* Format Selection */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-6 shadow-sm border"
                >
                  <h2 className="font-semibold text-lg mb-4">
                    2. Choose Target Format
                  </h2>

                  <RadioGroup
                    value={targetFormat}
                    onValueChange={(v) => setTargetFormat(v as TargetFormat)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="format-pdf"
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        targetFormat === "pdf"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      } ${isPdf ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <RadioGroupItem
                        value="pdf"
                        id="format-pdf"
                        disabled={isPdf}
                      />
                      <div>
                        <span className="font-medium">PDF</span>
                        <p className="text-xs text-muted-foreground">
                          Portable Document
                        </p>
                      </div>
                    </Label>

                    <Label
                      htmlFor="format-docx"
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        targetFormat === "docx"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      } ${isDocx ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <RadioGroupItem
                        value="docx"
                        id="format-docx"
                        disabled={isDocx}
                      />
                      <div>
                        <span className="font-medium">DOCX</span>
                        <p className="text-xs text-muted-foreground">
                          Word Document
                        </p>
                      </div>
                    </Label>
                  </RadioGroup>
                </motion.div>
              )}

              {/* Convert Button */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={handleConvert}
                    disabled={convertMutation.isPending}
                    className="w-full py-6 text-lg"
                    size="lg"
                  >
                    {convertMutation.isPending ? (
                      "Uploading..."
                    ) : (
                      <>
                        Convert to {targetFormat.toUpperCase()}
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
                  Converting Your File
                </h2>
                <ProgressIndicator
                  status={jobStatus.status as any}
                  progress={jobStatus.progress}
                  message={`Converting ${selectedFile?.name} to ${targetFormat.toUpperCase()}`}
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
                filename={selectedFile.name.replace(
                  /\.[^.]+$/,
                  `.${targetFormat}`
                )}
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
                Convert Another File
              </Button>
            </motion.div>
          )}

          {/* Info Section */}
          <div className="mt-8 p-4 bg-muted/50 rounded-xl">
            <h3 className="font-medium text-sm mb-2">How it works</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload your PDF or DOCX file (max 50MB)</li>
              <li>• Select your desired output format</li>
              <li>• Download your converted file</li>
              <li>• Files are automatically deleted after 60 minutes</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
