import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

interface PreviewTableProps {
  data: Record<string, any>[];
  costPerUnit: number | null;
  fixedMaintenance: number | null;
}

export default function PreviewTable({ data, costPerUnit, fixedMaintenance }: PreviewTableProps) {
  if (!data.length) return null;

  const baseColumns = Object.keys(data[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5 text-primary" /> Preview Table
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {baseColumns.map((col) => (
                    <TableHead key={col} className="whitespace-nowrap">{col}</TableHead>
                  ))}
                  <TableHead className="whitespace-nowrap">Water Bill</TableHead>
                  <TableHead className="whitespace-nowrap">Maintenance</TableHead>
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
                    <TableRow key={i}>
                      {baseColumns.map((col) => (
                        <TableCell key={col} className="whitespace-nowrap">{row[col]}</TableCell>
                      ))}
                      <TableCell className="whitespace-nowrap font-medium">₹{waterBill.toLocaleString()}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium">₹{maintenance.toLocaleString()}</TableCell>
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
