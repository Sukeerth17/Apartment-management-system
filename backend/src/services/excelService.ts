import path from "path";
import ExcelJS from "exceljs";
import { v4 as uuidv4 } from "uuid";
import { BillingRow, ProcessResult } from "../types";
import { AppError } from "../utils/errors";
import { toNumber } from "../utils/validators";

type ParsedWorkbook = {
  rows: Omit<BillingRow, "waterBill" | "maintenance">[];
  extractedCostPerUnit: number;
  extractedFixedMaintenance: number;
  extractedOperationCharges: number;
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const getCellText = (cell: ExcelJS.Cell): string => {
  if (cell.value === null || cell.value === undefined) return "";
  if (typeof cell.value === "object") {
    if ("text" in cell.value && typeof cell.value.text === "string") return cell.value.text;
    if ("result" in cell.value && cell.value.result !== undefined) return String(cell.value.result);
  }
  return String(cell.value).trim();
};

const getNumberFromCell = (cell: ExcelJS.Cell): number => {
  const raw = getCellText(cell).replace(/,/g, "");
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  return toNumber(cleaned, 0);
};

const findHeaderRow = (sheet: ExcelJS.Worksheet): number => {
  for (let i = 1; i <= Math.min(sheet.rowCount, 20); i += 1) {
    const row = sheet.getRow(i);
    // row.values has a union type in exceljs; coerce to any[] to safely use slice/map
    const rawValues = row.values as unknown as any[];
    const labels = (rawValues || [])
      .slice(1)
      .map((v: any) => normalize(String(v || "")))
      .filter(Boolean) as string[];
    if (labels.some((v: string) => v.includes("flat") || v.includes("unit")) && labels.some((v: string) => v.includes("cauvery"))) {
      return i;
    }
  }
  throw new AppError("Could not detect header row in uploaded Excel", 400);
};

const extractStaticValues = (sheet: ExcelJS.Worksheet) => {
  let costPerUnit = 0;
  let fixedMaintenance = 0;
  let operationCharges = 0;

  sheet.eachRow((row) => {
    row.eachCell((cell, colNumber) => {
      const key = normalize(getCellText(cell));
      if (!key) return;

      const nearby = [colNumber + 1, colNumber + 2]
        .map((c) => getNumberFromCell(row.getCell(c)))
        .find((n) => n > 0);

      if (!nearby) return;

      if (key.includes("costperunit") || key.includes("rateperunit")) {
        costPerUnit = nearby;
      }
      if (key.includes("fixedmaintenance")) {
        fixedMaintenance = nearby;
      }
      if (key.includes("operationcharges")) {
        operationCharges = nearby;
      }
    });
  });

  return { costPerUnit, fixedMaintenance, operationCharges };
};

const parseWorkbook = async (inputPath: string): Promise<ParsedWorkbook> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputPath);

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new AppError("Uploaded workbook has no worksheet", 400);

  const { costPerUnit, fixedMaintenance, operationCharges } = extractStaticValues(sheet);

  const headerRowNumber = findHeaderRow(sheet);
  const headerRow = sheet.getRow(headerRowNumber);

  const headerMap = new Map<string, number>();
  headerRow.eachCell((cell, col) => {
    const key = normalize(getCellText(cell));
    if (key) headerMap.set(key, col);
  });

  const getCol = (...keys: string[]) => {
    for (const key of keys) {
      for (const [header, col] of headerMap.entries()) {
        if (header.includes(normalize(key))) return col;
      }
    }
    return 0;
  };

  const flatCol = getCol("flat", "unit", "flatunit");
  const cauveryCol = getCol("cauveryunits", "cauvery");
  const tankerCol = getCol("tankerunits", "tanker");
  const borewellCol = getCol("borewellunits", "borewell");
  const totalCol = getCol("totalunits", "total");

  if (!flatCol || !cauveryCol || !tankerCol) {
    throw new AppError("Missing required columns. Need Flat/Unit, Cauvery Units, Tanker Units", 400);
  }

  const rows: Omit<BillingRow, "waterBill" | "maintenance">[] = [];

  for (let i = headerRowNumber + 1; i <= sheet.rowCount; i += 1) {
    const row = sheet.getRow(i);
    const flatUnit = getCellText(row.getCell(flatCol));
    const cauveryUnits = getNumberFromCell(row.getCell(cauveryCol));
    const tankerUnits = getNumberFromCell(row.getCell(tankerCol));

    const totalUnitsRaw = totalCol ? getNumberFromCell(row.getCell(totalCol)) : 0;
    const borewellRaw = borewellCol ? getNumberFromCell(row.getCell(borewellCol)) : 0;

    if (!flatUnit && cauveryUnits === 0 && tankerUnits === 0 && totalUnitsRaw === 0 && borewellRaw === 0) {
      continue;
    }

    const totalUnits = totalUnitsRaw > 0 ? totalUnitsRaw : cauveryUnits + tankerUnits + borewellRaw;
    const borewellUnits = borewellCol ? borewellRaw : totalUnits - (cauveryUnits + tankerUnits);

    rows.push({
      flatUnit,
      cauveryUnits,
      tankerUnits,
      borewellUnits: Number(borewellUnits.toFixed(2)),
      totalUnits: Number(totalUnits.toFixed(2))
    });
  }

  if (!rows.length) {
    throw new AppError("No billing rows found in uploaded Excel", 400);
  }

  return {
    rows,
    extractedCostPerUnit: costPerUnit,
    extractedFixedMaintenance: fixedMaintenance,
    extractedOperationCharges: operationCharges
  };
};

const applyCellBorder = (cell: ExcelJS.Cell) => {
  cell.border = {
    top: { style: "thin", color: { argb: "FFD9D9D9" } },
    left: { style: "thin", color: { argb: "FFD9D9D9" } },
    bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
    right: { style: "thin", color: { argb: "FFD9D9D9" } }
  };
};

const autoFitColumns = (sheet: ExcelJS.Worksheet) => {
  sheet.columns.forEach((column) => {
    if (!column) return;
    let maxLen = 12;
    // column.eachCell may be undefined on some ExcelJS column objects in the
    // type union. Check at runtime before invoking to satisfy TypeScript.
    if (typeof (column as any).eachCell === "function") {
      (column as any).eachCell({ includeEmpty: true }, (cell: ExcelJS.Cell) => {
        const value = getCellText(cell);
        maxLen = Math.max(maxLen, value.length + 2);
      });
    }
    column.width = Math.min(maxLen, 40);
  });
};

const currencyFormat = '[$₹-en-IN] #,##0.00';

const createOutputWorkbook = async (
  outputPath: string,
  rows: BillingRow[],
  summary: ProcessResult["summary"]
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Water Billing AI";
  workbook.created = new Date();

  const billing = workbook.addWorksheet("Billing Data");
  billing.properties.defaultRowHeight = 20;
  billing.views = [{ state: "frozen", ySplit: 1 }];

  billing.columns = [
    { header: "Flat / Unit", key: "flatUnit" },
    { header: "Cauvery Units", key: "cauveryUnits" },
    { header: "Tanker Units", key: "tankerUnits" },
    { header: "Borewell Units", key: "borewellUnits" },
    { header: "Total Units", key: "totalUnits" },
    { header: "Water Bill", key: "waterBill" },
    { header: "Maintenance", key: "maintenance" }
  ];

  const header = billing.getRow(1);
  header.height = 24;
  header.eachCell((cell) => {
    cell.font = { name: "Calibri", bold: true, size: 13 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF2F2F2" }
    };
    cell.alignment = { horizontal: "center", vertical: "middle", indent: 1 };
    applyCellBorder(cell);
  });

  rows.forEach((row) => {
    billing.addRow(row);
  });

  for (let i = 2; i <= billing.rowCount; i += 1) {
    const row = billing.getRow(i);
    row.eachCell((cell, col) => {
      cell.font = { name: "Calibri", size: 11 };
      if (col === 1) {
        cell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
      } else {
        cell.alignment = { horizontal: "right", vertical: "middle", indent: 1 };
      }
      applyCellBorder(cell);
    });

    row.getCell(2).numFmt = "0.00";
    row.getCell(3).numFmt = "0.00";
    row.getCell(4).numFmt = "0.00";
    row.getCell(5).numFmt = "0.00";
    row.getCell(6).numFmt = currencyFormat;
    row.getCell(7).numFmt = currencyFormat;
  }

  autoFitColumns(billing);

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.properties.defaultRowHeight = 20;
  summarySheet.columns = [{ width: 34 }, { width: 24 }];

  summarySheet.getCell("A1").value = "Units Summary";
  summarySheet.getCell("A1").font = { name: "Calibri", bold: true, size: 14 };

  summarySheet.addRow(["Metric", "Value"]);
  summarySheet.addRow(["Total Cauvery Units", summary.totalCauveryUnits]);
  summarySheet.addRow(["Total Tanker Units", summary.totalTankerUnits]);
  summarySheet.addRow(["Total Borewell Units", summary.totalBorewellUnits]);
  summarySheet.addRow(["Total Units", summary.totalUnits]);

  summarySheet.addRow([]);
  summarySheet.getCell("A8").value = "Cost Summary";
  summarySheet.getCell("A8").font = { name: "Calibri", bold: true, size: 14 };
  summarySheet.addRow(["Metric", "Value"]);
  summarySheet.addRow(["Cauvery Cost", summary.cauveryCost]);
  summarySheet.addRow(["Tanker Cost", summary.tankerCost]);
  summarySheet.addRow(["Borewell Cost", summary.borewellCost]);
  summarySheet.addRow(["Operation Charges", summary.operationCharges]);
  summarySheet.addRow(["Fixed Maintenance", summary.fixedMaintenance]);
  summarySheet.addRow(["Total Amount", summary.totalAmount]);

  const applySummaryHeaderStyle = (rowNumber: number) => {
    const row = summarySheet.getRow(rowNumber);
    row.eachCell((cell) => {
      cell.font = { name: "Calibri", bold: true, size: 12 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
      cell.alignment = { horizontal: "center", vertical: "middle", indent: 1 };
      applyCellBorder(cell);
    });
  };

  applySummaryHeaderStyle(2);
  applySummaryHeaderStyle(9);

  [3, 4, 5, 6, 10, 11, 12, 13, 14, 15].forEach((rowNumber) => {
    const row = summarySheet.getRow(rowNumber);
    row.getCell(1).font = { name: "Calibri", bold: true, size: 11 };
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    row.getCell(2).font = { name: "Calibri", size: 11 };
    row.getCell(2).alignment = { horizontal: "right", vertical: "middle", indent: 1 };
    applyCellBorder(row.getCell(1));
    applyCellBorder(row.getCell(2));
  });

  [3, 4, 5, 6].forEach((rowNumber) => {
    summarySheet.getRow(rowNumber).getCell(2).numFmt = "0.00";
  });
  [10, 11, 12, 13, 14, 15].forEach((rowNumber) => {
    summarySheet.getRow(rowNumber).getCell(2).numFmt = currencyFormat;
  });

  await workbook.xlsx.writeFile(outputPath);
};

export const excelService = {
  async process(inputPath: string, options: { costPerUnit?: number; fixedMaintenanceCharge?: number }) {
    const parsed = await parseWorkbook(inputPath);

    const costPerUnit = options.costPerUnit ?? parsed.extractedCostPerUnit;
    const fixedMaintenancePerFlat = options.fixedMaintenanceCharge ?? parsed.extractedFixedMaintenance;
    const operationCharges = parsed.extractedOperationCharges;

    const rows: BillingRow[] = parsed.rows.map((row) => {
      const waterBill = Number((row.totalUnits * costPerUnit).toFixed(2));
      const maintenance = Number((waterBill + fixedMaintenancePerFlat).toFixed(2));
      return {
        ...row,
        waterBill,
        maintenance
      };
    });

    const totalCauveryUnits = Number(rows.reduce((sum, row) => sum + row.cauveryUnits, 0).toFixed(2));
    const totalTankerUnits = Number(rows.reduce((sum, row) => sum + row.tankerUnits, 0).toFixed(2));
    const totalBorewellUnits = Number(rows.reduce((sum, row) => sum + row.borewellUnits, 0).toFixed(2));
    const totalUnits = Number(rows.reduce((sum, row) => sum + row.totalUnits, 0).toFixed(2));

    const cauveryCost = Number((totalCauveryUnits * costPerUnit).toFixed(2));
    const tankerCost = Number((totalTankerUnits * costPerUnit).toFixed(2));
    const borewellCost = Number((totalBorewellUnits * costPerUnit).toFixed(2));
    const fixedMaintenance = Number((fixedMaintenancePerFlat * rows.length).toFixed(2));
    const totalAmount = Number((rows.reduce((sum, row) => sum + row.maintenance, 0) + operationCharges).toFixed(2));

    const fileId = uuidv4();
    const outputPath = path.join(process.cwd(), "storage", "outputs", `${fileId}.xlsx`);

    const summary = {
      totalCauveryUnits,
      totalTankerUnits,
      totalBorewellUnits,
      totalUnits,
      cauveryCost,
      tankerCost,
      borewellCost,
      operationCharges,
      fixedMaintenance,
      totalAmount
    };

    await createOutputWorkbook(outputPath, rows, summary);

    const result: ProcessResult = {
      fileId,
      rows,
      summary,
      outputPath
    };

    return result;
  }
};
