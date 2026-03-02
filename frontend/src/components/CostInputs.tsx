import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sliders } from "lucide-react";

interface CostInputsProps {
  costPerUnit: string;
  fixedMaintenance: string;
  onCostPerUnitChange: (v: string) => void;
  onFixedMaintenanceChange: (v: string) => void;
}

export default function CostInputs({
  costPerUnit,
  fixedMaintenance,
  onCostPerUnitChange,
  onFixedMaintenanceChange,
}: CostInputsProps) {
  return (
    <Card className="relative overflow-hidden border-orange-200/50 dark:border-orange-800/50 shadow-lg">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <Sliders className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          Adjust Billing Parameters
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Override defaults if needed</p>
      </CardHeader>
      <CardContent className="relative z-10 grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="costPerUnit" className="text-sm font-semibold text-foreground">
            Cost Per Unit <span className="text-muted-foreground font-normal">(₹)</span>
          </Label>
          <Input
            id="costPerUnit"
            type="number"
            placeholder="Default from Excel"
            value={costPerUnit}
            onChange={(e) => onCostPerUnitChange(e.target.value)}
            className="border-orange-200/50 dark:border-orange-800/50 focus:border-orange-500 focus:ring-orange-500/20 h-10"
          />
          <p className="text-xs text-muted-foreground">Leave empty to use extracted value</p>
        </div>
        <div className="space-y-3">
          <Label htmlFor="fixedMaintenance" className="text-sm font-semibold text-foreground">
            Fixed Maintenance <span className="text-muted-foreground font-normal">(₹)</span>
          </Label>
          <Input
            id="fixedMaintenance"
            type="number"
            placeholder="Default from Excel"
            value={fixedMaintenance}
            onChange={(e) => onFixedMaintenanceChange(e.target.value)}
            className="border-orange-200/50 dark:border-orange-800/50 focus:border-orange-500 focus:ring-orange-500/20 h-10"
          />
          <p className="text-xs text-muted-foreground">Leave empty to use extracted value</p>
        </div>
      </CardContent>
    </Card>
  );
}
