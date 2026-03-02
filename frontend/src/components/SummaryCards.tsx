import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, IndianRupee, TrendingUp, Gauge } from "lucide-react";

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

function StatItem({ label, value, unit, icon: Icon, color }: { label: string; value: number; unit?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex justify-between items-center py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
      <div className="flex items-center gap-2 min-w-0">
        <div className={`text-${color}`}>
          {Icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className={`font-semibold tabular-nums text-${color} whitespace-nowrap ml-2`}>
        {unit === "₹" && "₹"}{value.toLocaleString()}{unit === "units" && " units"}
      </span>
    </div>
  );
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  if (!data) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Units Consumed Card */}
      <Card className="relative overflow-hidden border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-3 relative z-10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Units Consumed
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Water supply breakdown</p>
        </CardHeader>
        <CardContent className="relative z-10">
          <StatItem 
            label="Cauvery" 
            value={data.cauveryUnits} 
            unit="units" 
            icon={<Droplets className="h-4 w-4 text-blue-500" />}
            color="text-blue-600"
          />
          <StatItem 
            label="Tanker" 
            value={data.tankerUnits} 
            unit="units"
            icon={<Gauge className="h-4 w-4 text-amber-500" />}
            color="text-amber-600"
          />
          <StatItem 
            label="Borewell" 
            value={data.borewellUnits} 
            unit="units"
            icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
            color="text-emerald-600"
          />
          <div className="flex justify-between items-center pt-3 mt-3 px-2 border-t-2 border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg p-3 -mx-2">
            <span className="font-semibold text-foreground">Total Units</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{data.totalUnits.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown Card */}
      <Card className="relative overflow-hidden border-emerald-200/50 dark:border-emerald-800/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-3 relative z-10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Cost Breakdown
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Detailed expense summary</p>
        </CardHeader>
        <CardContent className="relative z-10">
          <StatItem 
            label="Cauvery Cost" 
            value={data.cauveryCost} 
            unit="₹"
            icon={<Droplets className="h-4 w-4 text-blue-500" />}
            color="text-blue-600"
          />
          <StatItem 
            label="Tanker Cost" 
            value={data.tankerCost} 
            unit="₹"
            icon={<Gauge className="h-4 w-4 text-amber-500" />}
            color="text-amber-600"
          />
          <StatItem 
            label="Borewell Cost" 
            value={data.borewellCost} 
            unit="₹"
            icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
            color="text-emerald-600"
          />
          <StatItem 
            label="Operations" 
            value={data.operationCharges} 
            unit="₹"
            icon={<Gauge className="h-4 w-4 text-purple-500" />}
            color="text-purple-600"
          />
          <StatItem 
            label="Fixed Maintenance" 
            value={data.fixedMaintenance} 
            unit="₹"
            icon={<TrendingUp className="h-4 w-4 text-rose-500" />}
            color="text-rose-600"
          />
          <div className="flex justify-between items-center pt-3 mt-3 px-2 border-t-2 border-emerald-200/50 dark:border-emerald-800/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg p-3 -mx-2">
            <span className="font-semibold text-foreground">Total Amount</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">₹{data.totalAmount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
