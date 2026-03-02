import { useState, useRef, DragEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";

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

  const fileSize = file ? (file.size / 1024).toFixed(2) : null;

  return (
    <Card className="relative overflow-hidden border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
            <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          Upload Excel File
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all cursor-pointer duration-300 ${
            dragActive 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-105" 
              : "border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <FileSpreadsheet className={`h-12 w-12 mb-4 transition-all duration-300 ${
            dragActive ? "text-blue-500 scale-110" : "text-blue-400 dark:text-blue-500"
          }`} />
          <p className="text-base font-medium text-foreground text-center mb-1">
            Drag & drop your Excel file here
          </p>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Or click to browse from your computer
          </p>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
            Supports .xlsx files
          </Badge>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            disabled={loading}
          />
        </div>

        {file && (
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/50 dark:border-emerald-800/50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{fileSize} KB</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }} 
              className="text-muted-foreground hover:text-destructive transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Button
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={!file || loading}
          onClick={() => file && onUpload(file)}
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing your file...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Analyze with AI
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your file will be analyzed using AI to extract water billing data accurately and efficiently
        </p>
      </CardContent>
    </Card>
  );
}
