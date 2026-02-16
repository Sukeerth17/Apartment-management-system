import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import UploadCard from "@/components/UploadCard";
import SummaryCards from "@/components/SummaryCards";
import CostInputs from "@/components/CostInputs";
import PreviewTable from "@/components/PreviewTable";
import DownloadButton from "@/components/DownloadButton";
import { Button } from "@/components/ui/button";
import { Droplets, LogOut } from "lucide-react";

export default function Dashboard() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [costPerUnit, setCostPerUnit] = useState("");
  const [fixedMaintenance, setFixedMaintenance] = useState("");

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const uploadRes = await api.upload(file);
      const fId = uploadRes.fileId;
      setFileId(fId);

      await api.process(fId);
      const summaryRes = await api.getSummary(fId);

      setSummary(summaryRes.summary);
      setTableData(summaryRes.rows || []);
      toast({ title: "Success", description: "File processed successfully!" });
    } catch (err: any) {
      toast({ title: "Processing Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const cpuNum = costPerUnit ? Number(costPerUnit) : null;
  const fmNum = fixedMaintenance ? Number(fixedMaintenance) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Water Billing AI</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl space-y-4 p-4 pb-24 md:pb-8">
        <UploadCard onUpload={handleUpload} loading={loading} />
        <SummaryCards data={summary} />
        {tableData.length > 0 && (
          <CostInputs
            costPerUnit={costPerUnit}
            fixedMaintenance={fixedMaintenance}
            onCostPerUnitChange={setCostPerUnit}
            onFixedMaintenanceChange={setFixedMaintenance}
          />
        )}
        <PreviewTable data={tableData} costPerUnit={cpuNum} fixedMaintenance={fmNum} />
        <DownloadButton fileId={fileId} />
      </main>
    </div>
  );
}
