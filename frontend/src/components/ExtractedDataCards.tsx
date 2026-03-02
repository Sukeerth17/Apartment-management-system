import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Zap, Gauge, TrendingUp } from "lucide-react";

interface ExtractedDataCardsProps {
  extracted: {
    cauveryUnits?: number;
    cauveryBill?: number;
    tankerUnits?: number;
    tankerBill?: number;
    operationFee?: number;
    fixedMaintenance?: number;
    [key: string]: unknown;
  } | null;
  calculated: {
    totalUnitsConsumed?: number;
    totalSpent?: number;
    costPerUnit?: number;
    borewellUnits?: number;
    [key: string]: unknown;
  } | null;
}

export default function ExtractedDataCards({ extracted, calculated }: ExtractedDataCardsProps) {
  if (!extracted || !calculated) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1 w-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
        <h3 className="font-semibold text-lg text-foreground">Extracted Data</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Cauvery Section */}
        {extracted.cauveryUnits && (
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Droplets className="h-4 w-4 text-blue-500" />
                Cauvery Supply
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Units</p>
                <p className="text-2xl font-bold text-blue-600">{extracted.cauveryUnits.toLocaleString()}</p>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Cost</p>
                <p className="text-lg font-semibold text-blue-600">₹{(extracted.cauveryBill || 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tanker Section */}
        {extracted.tankerUnits && (
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Zap className="h-4 w-4 text-amber-500" />
                Tanker Supply
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Units</p>
                <p className="text-2xl font-bold text-amber-600">{extracted.tankerUnits.toLocaleString()}</p>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Cost</p>
                <p className="text-lg font-semibold text-amber-600">₹{(extracted.tankerBill || 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Operation Fee */}
        {extracted.operationFee && (
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Gauge className="h-4 w-4 text-emerald-500" />
                Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">Charges</p>
              <p className="text-2xl font-bold text-emerald-600">₹{extracted.operationFee.toLocaleString()}</p>
            </CardContent>
          </Card>
        )}

        {/* Calculated Metrics */}
        {calculated.costPerUnit && (
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Cost / Unit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">Rate</p>
              <p className="text-2xl font-bold text-purple-600">₹{calculated.costPerUnit.toLocaleString()}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Row */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Total Units</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              {(calculated.totalUnitsConsumed || 0).toLocaleString()}
            </p>
            <Badge className="mt-3 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              units consumed
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Borewell</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              {(calculated.borewellUnits || 0).toLocaleString()}
            </p>
            <Badge className="mt-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
              units extracted
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/30 dark:to-rose-950/30 border-orange-200/50 dark:border-orange-800/50">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Total Spent</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 dark:from-orange-400 dark:to-rose-400 bg-clip-text text-transparent">
              ₹{(calculated.totalSpent || 0).toLocaleString()}
            </p>
            <Badge className="mt-3 bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
              total amount
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
