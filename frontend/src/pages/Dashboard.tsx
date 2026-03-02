import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import UploadCard from "@/components/UploadCard";
import SummaryCards from "@/components/SummaryCards";
import CostInputs from "@/components/CostInputs";
import PreviewTable from "@/components/PreviewTable";
import DownloadButton from "@/components/DownloadButton";
import ExtractedDataCards from "@/components/ExtractedDataCards";
import { Button } from "@/components/ui/button";
import { Droplets, LogOut, Zap } from "lucide-react";

interface SummaryData {
  cauveryUnits: number;
  tankerUnits: number;
  borewellUnits: number;
  totalUnits: number;
  cauveryCost: number;
  tankerCost: number;
  borewellCost: number;
  operationCharges: number;
  fixedMaintenance: number;
  totalAmount: number;
}

interface ExtractedData {
  cauveryUnits?: number;
  cauveryBill?: number;
  tankerUnits?: number;
  tankerBill?: number;
  operationFee?: number;
  fixedMaintenance?: number;
  [key: string]: unknown;
}

interface CalculatedData {
  totalUnitsConsumed?: number;
  totalSpent?: number;
  costPerUnit?: number;
  borewellUnits?: number;
  [key: string]: unknown;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [calculated, setCalculated] = useState<CalculatedData | null>(null);
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
      setExtracted(summaryRes.extracted);
      setCalculated(summaryRes.calculated);
      setTableData(summaryRes.rows || []);
      toast({ title: "Success", description: "File processed successfully!" });
    } catch (err) {
      const error = err as { message?: string };
      toast({ title: "Processing Error", description: error.message || "An error occurred", variant: "destructive" });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-blue-200/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Water Billing AI
              </h1>
              <p className="text-xs text-muted-foreground">Smart Apartment Management</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
          >
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6 pb-24 md:pb-8">
        {/* Welcome Section */}
        {!summary && (
          <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/30 dark:border-blue-800/30 p-6 mb-8">
            <div className="flex items-start gap-4">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-lg text-foreground mb-2">Welcome to Water Billing AI</h2>
                <p className="text-sm text-muted-foreground">
                  Upload your apartment water billing Excel file to automatically extract data, calculate costs, and generate comprehensive billing reports powered by AI.
                </p>
              </div>
            </div>
          </div>
        )}

        <UploadCard onUpload={handleUpload} loading={loading} />
        
        {/* Extracted Data Section */}
        {extracted && (
          <ExtractedDataCards extracted={extracted} calculated={calculated} />
        )}

        {summary && (
          <>
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
          </>
        )}

        <DownloadButton fileId={fileId} />
      </main>
    </div>
  );
}
