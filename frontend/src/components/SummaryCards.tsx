import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, IndianRupee } from "lucide-react";

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

interface SummaryCardsProps {
  data: SummaryData | null;
}

function StatItem({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">
        {unit === "₹" && "₹"}{value.toLocaleString()}{unit === "units" && " units"}
      </span>
    </div>
  );
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  if (!data) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Droplets className="h-5 w-5 text-primary" /> Units Consumed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatItem label="Cauvery" value={data.cauveryUnits} unit="units" />
          <StatItem label="Tanker" value={data.tankerUnits} unit="units" />
          <StatItem label="Borewell" value={data.borewellUnits} unit="units" />
          <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-primary/20">
            <span className="font-medium">Total</span>
            <span className="font-bold text-primary tabular-nums">{data.totalUnits.toLocaleString()} units</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IndianRupee className="h-5 w-5 text-primary" /> Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatItem label="Cauvery Cost" value={data.cauveryCost} unit="₹" />
          <StatItem label="Tanker Cost" value={data.tankerCost} unit="₹" />
          <StatItem label="Borewell Cost" value={data.borewellCost} unit="₹" />
          <StatItem label="Operation Charges" value={data.operationCharges} unit="₹" />
          <StatItem label="Fixed Maintenance" value={data.fixedMaintenance} unit="₹" />
          <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-primary/20">
            <span className="font-medium">Total Amount</span>
            <span className="font-bold text-primary tabular-nums">₹{data.totalAmount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
