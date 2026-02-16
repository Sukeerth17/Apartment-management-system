import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-primary" /> User Inputs
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="costPerUnit">Cost Per Unit (₹)</Label>
          <Input
            id="costPerUnit"
            type="number"
            placeholder="Leave empty to use Excel default"
            value={costPerUnit}
            onChange={(e) => onCostPerUnitChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fixedMaintenance">Fixed Maintenance (₹)</Label>
          <Input
            id="fixedMaintenance"
            type="number"
            placeholder="Leave empty to use Excel default"
            value={fixedMaintenance}
            onChange={(e) => onFixedMaintenanceChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
