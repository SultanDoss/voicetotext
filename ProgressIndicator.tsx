import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Loader2, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
  className?: string;
}

export function ProgressIndicator({
  status,
  progress,
  message,
  className,
}: ProgressIndicatorProps) {
  const statusConfig = {
    pending: {
      icon: Loader2,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      label: "Waiting...",
      iconAnimate: true,
    },
    processing: {
      icon: Loader2,
      color: "text-primary",
      bgColor: "bg-primary/10",
      label: "Processing...",
      iconAnimate: true,
    },
    completed: {
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      label: "Completed!",
      iconAnimate: false,
    },
    failed: {
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      label: "Failed",
      iconAnimate: false,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl p-6", config.bgColor, className)}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            status === "completed" ? "bg-green-100" : "bg-white/80"
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5",
              config.color,
              config.iconAnimate && "animate-spin"
            )}
          />
        </div>

        <div className="flex-1">
          <p className={cn("font-medium", config.color)}>{config.label}</p>
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </div>

        {status === "processing" && (
          <span className="text-lg font-semibold text-primary">
            {progress}%
          </span>
        )}
      </div>

      {(status === "pending" || status === "processing") && (
        <Progress value={progress} className="h-2" />
      )}
    </motion.div>
  );
}

interface DownloadReadyProps {
  filename: string;
  originalSize: number;
  outputSize: number;
  onDownload: () => void;
  isDownloading?: boolean;
}

export function DownloadReady({
  filename,
  originalSize,
  outputSize,
  onDownload,
  isDownloading = false,
}: DownloadReadyProps) {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const reduction = originalSize > 0 ? ((1 - outputSize / originalSize) * 100).toFixed(1) : 0;
  const showReduction = outputSize < originalSize && outputSize > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>

        <div className="flex-1">
          <p className="font-semibold text-green-800">Ready for Download!</p>
          <p className="text-sm text-green-600 truncate">{filename}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="text-muted-foreground">
          <span>Original: {formatSize(originalSize)}</span>
          {outputSize > 0 && (
            <>
              <span className="mx-2">→</span>
              <span className="text-green-600 font-medium">
                {formatSize(outputSize)}
              </span>
            </>
          )}
        </div>
        {showReduction && (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            {reduction}% smaller
          </span>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onDownload}
        disabled={isDownloading}
        className={cn(
          "w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors",
          "bg-green-600 text-white hover:bg-green-700",
          isDownloading && "opacity-70 cursor-not-allowed"
        )}
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <FileDown className="w-5 h-5" />
            Download File
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
