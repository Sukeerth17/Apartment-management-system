import { useState, useRef, DragEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, X } from "lucide-react";

interface UploadCardProps {
  onUpload: (file: File) => void;
  loading: boolean;
}

export default function UploadCard({ onUpload, loading }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".xlsx")) {
      toast({ title: "Invalid File", description: "Please upload an .xlsx file.", variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5 text-primary" /> Upload Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Drag & drop your <strong>.xlsx</strong> file here, or tap to browse
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {file && (
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <span className="text-sm font-medium truncate">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Button
          className="w-full h-12 text-base"
          disabled={!file || loading}
          onClick={() => file && onUpload(file)}
        >
          {loading ? "Processing..." : "Upload & Analyze"}
        </Button>
      </CardContent>
    </Card>
  );
}
