import { Button } from "@/components/ui/button";
import { Download, FileCheck } from "lucide-react";
import { api } from "@/lib/api";

interface DownloadButtonProps {
  fileId: string | null;
}

export default function DownloadButton({ fileId }: DownloadButtonProps) {
  if (!fileId) return null;

  const handleDownload = () => {
    const url = api.downloadUrl(fileId);
    const a = document.createElement("a");
    a.href = url;
    a.download = "billing-report.xlsx";
    a.click();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-white/0 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900/0 backdrop-blur-lg border-t border-emerald-200/30 dark:border-emerald-800/30 md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none z-50">
      <Button 
        onClick={handleDownload} 
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 md:mt-4"
      >
        <FileCheck className="mr-2 h-5 w-5" />
        Download Billing Report
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-2 md:mt-3">
        Excel file with calculated water bills per flat
      </p>
    </div>
  );
}
