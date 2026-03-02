import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp } from "lucide-react";

interface PreviewTableProps {
  data: Record<string, unknown>[];
  costPerUnit: number | null;
  fixedMaintenance: number | null;
}

export default function PreviewTable({ data, costPerUnit, fixedMaintenance }: PreviewTableProps) {
  if (!data.length) return null;

  const baseColumns = Object.keys(data[0]);

  return (
    <Card className="relative overflow-hidden border-purple-200/50 dark:border-purple-800/50 shadow-lg">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          Billing Preview
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">{data.length} records calculated and ready</p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 sticky top-0">
                <TableRow className="hover:bg-transparent border-b-2 border-purple-200/50 dark:border-purple-800/50">
                  {baseColumns.map((col) => (
                    <TableHead key={col} className="whitespace-nowrap font-semibold text-foreground">
                      {col}
                    </TableHead>
                  ))}
                  <TableHead className="whitespace-nowrap font-semibold text-foreground">Water Bill</TableHead>
                  <TableHead className="whitespace-nowrap font-semibold text-foreground">Total Bill</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => {
                  const totalUnits = Number(row["Total Units"] || row["totalUnits"] || 0);
                  const cpu = costPerUnit ?? Number(row["Cost Per Unit"] || row["costPerUnit"] || 0);
                  const fm = fixedMaintenance ?? Number(row["Fixed Maintenance"] || row["fixedMaintenance"] || 0);
                  const waterBill = totalUnits * cpu;
                  const maintenance = waterBill + fm;

                  return (
                    <TableRow 
                      key={i} 
                      className={`transition-colors duration-200 ${
                        i % 2 === 0 
                          ? "bg-transparent hover:bg-purple-50/50 dark:hover:bg-purple-950/20" 
                          : "bg-slate-50/50 dark:bg-slate-900/20 hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
                      } border-b border-border`}
                    >
                      {baseColumns.map((col) => (
                        <TableCell key={col} className="whitespace-nowrap text-sm py-3">
                          {typeof row[col] === 'number' ? (
                            <span className="font-medium text-foreground">
                              {(row[col] as number).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-foreground">
                              {String(row[col])}
                            </span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="whitespace-nowrap py-3">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/70 font-semibold">
                          ₹{waterBill.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-3">
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/70 font-semibold flex items-center gap-1 w-fit">
                          <TrendingUp className="h-3 w-3" />
                          ₹{maintenance.toLocaleString()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
