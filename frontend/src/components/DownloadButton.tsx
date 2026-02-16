import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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
    a.download = "processed.xlsx";
    a.click();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none z-50">
      <Button onClick={handleDownload} className="w-full h-12 text-base">
        <Download className="mr-2 h-5 w-5" /> Download Excel
      </Button>
    </div>
  );
}
