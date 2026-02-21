import { CohereClient } from "cohere-ai";
import ExcelJS from "exceljs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import { BillingRow, ExtractedExcelData, CalculatedData } from "../types";

const cohere = new CohereClient({
  token: env.cohereApiKey,
});

// Helper to convert Excel file to text representation for Cohere (limited to first 100 rows to avoid token limits)
async function excelToText(inputPath: string): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputPath);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new AppError("Uploaded workbook has no worksheet", 400);

  let text = "Excel Sheet Content:\n";
  let rowCount = 0;
  const maxRows = 100; // Limit to first 100 rows to avoid token limits

  sheet.eachRow((row, rowNumber) => {
    if (rowCount >= maxRows) return;
    const values = row.values
      ? (row.values as unknown as any[]).slice(1).map((v) => (v ? String(v).trim() : ""))
      : [];
    // Skip completely empty rows
    if (values.some((v) => v)) {
      text += `Row ${rowNumber}: ${values.join(" | ")}\n`;
      rowCount++;
    }
  });

  return text;
}

// Ask Cohere to extract data from the Excel
async function extractDataWithCohere(excelText: string): Promise<ExtractedExcelData> {
  const prompt = `You are an Excel data extraction expert. Analyze this water billing Excel sheet and extract the required information in JSON format.

${excelText}

IMPORTANT: Return ONLY valid JSON in this exact format, no other text or markdown:
{
  "flatTable": [
    { "flatNumber": "G1", "unitsConsumed": 15 }
  ],
  "cauveryUnits": 205,
  "cauveryBill": 7810,
  "tankerUnitsPerUnit": 6,
  "tankerCount": 2,
  "tankerTotalUnits": 12,
  "tankerCostPerUnit": 950,
  "tankerTotalPaid": 1900,
  "operationFee": 1000,
  "fixedMaintenance": 2800
}

Rules:
- flatTable: Array of flats. Each has flatNumber (string like "G1", "1F1") and unitsConsumed (number)
- cauveryUnits: Total units supplied by Cauvery (number, or 0 if not found)
- cauveryBill: Total bill from Cauvery (number, or 0 if not found)
- tankerUnitsPerUnit: Units per tanker (number, or 0 if not found)
- tankerCount: Number of tankers (number, or 0 if not found)
- tankerTotalUnits: Total tanker units supplied (number, or 0 if not found)
- tankerCostPerUnit: Cost per tanker (number, or 0 if not found)
- tankerTotalPaid: Total amount paid for tanker (number, or 0 if not found)
- operationFee: Operation or maintenance fee (number, or 0 if not found)
- fixedMaintenance: Fixed maintenance charge per flat (number, or 0 if not found)`;

  try {
    console.log("Calling Cohere API for Excel data extraction...");
    const response = await cohere.generate({
      model: "command",
      prompt: prompt,
      maxTokens: 2000,
      temperature: 0.3, // Lower temperature for more deterministic JSON output
    });

    const responseText = response.generations[0].text || "";
    console.log("Cohere response:", responseText.substring(0, 200));

    // Extract JSON from the response (Cohere might wrap it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to find JSON in Cohere response:", responseText);
      throw new AppError("Cohere did not return valid JSON. Response: " + responseText.substring(0, 100), 400);
    }

    const extracted = JSON.parse(jsonMatch[0]) as ExtractedExcelData;
    console.log("Successfully extracted Excel data:", {
      flatCount: extracted.flatTable?.length || 0,
      cauveryUnits: extracted.cauveryUnits,
      tankerUnits: extracted.tankerTotalUnits,
    });
    return extracted;
  } catch (error: any) {
    console.error("Error calling Cohere API:", error.message || error);
    if (error.status === 401 || error.message?.includes("Unauthorized")) {
      throw new AppError("Cohere API key is invalid or expired. Check your COHERE_API_KEY in .env", 500);
    }
    if (error.message?.includes("ECONNREFUSED")) {
      throw new AppError("Failed to connect to Cohere. Check your internet connection.", 500);
    }
    throw new AppError("AI extraction failed: " + (error.message || "Unknown error"), 500);
  }
}

// Calculate totals and cost per unit
function calculateMetrics(extracted: ExtractedExcelData): CalculatedData {
  const totalUnitsConsumed = extracted.flatTable.reduce((sum, flat) => sum + flat.unitsConsumed, 0);
  const totalSpent = extracted.cauveryBill + extracted.tankerTotalPaid + extracted.operationFee;
  const borewellUnits =
    totalUnitsConsumed - extracted.cauveryUnits - extracted.tankerTotalUnits;
  const costPerUnit = totalUnitsConsumed > 0 ? totalSpent / totalUnitsConsumed : 0;

  return {
    totalUnitsConsumed,
    totalSpent,
    borewellUnits: Math.max(0, borewellUnits), // Ensure non-negative
    costPerUnit,
  };
}

// Create output Excel file with water bills
async function createOutputWorkbook(
  outputPath: string,
  extracted: ExtractedExcelData,
  calculated: CalculatedData
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Water Billing AI";
  workbook.created = new Date();

  const billing = workbook.addWorksheet("Billing Data");
  billing.properties.defaultRowHeight = 20;
  billing.views = [{ state: "frozen", ySplit: 1 }];

  // Column headers
  billing.columns = [
    { header: "Flat / Unit", key: "flatUnit" },
    { header: "Units Consumed", key: "unitsConsumed" },
    { header: "Water Bill (₹)", key: "waterBill" },
    { header: "Fixed Maintenance (₹)", key: "maintenance" },
    { header: "Total Bill (₹)", key: "totalBill" },
  ];

  const header = billing.getRow(1);
  header.height = 24;
  header.eachCell((cell) => {
    cell.font = { name: "Calibri", bold: true, size: 13 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF2F2F2" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle", indent: 1 };
    cell.border = {
      top: { style: "thin", color: { argb: "FFD9D9D9" } },
      left: { style: "thin", color: { argb: "FFD9D9D9" } },
      bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
      right: { style: "thin", color: { argb: "FFD9D9D9" } },
    };
  });

  // Data rows
  extracted.flatTable.forEach((flat) => {
    const waterBill = flat.unitsConsumed * calculated.costPerUnit;
    const totalBill = waterBill + extracted.fixedMaintenance;

    const row = billing.addRow({
      flatUnit: flat.flatNumber,
      unitsConsumed: flat.unitsConsumed,
      waterBill: Number(waterBill.toFixed(2)),
      maintenance: extracted.fixedMaintenance,
      totalBill: Number(totalBill.toFixed(2)),
    });

    row.eachCell((cell, col) => {
      cell.font = { name: "Calibri", size: 11 };
      if (col === 1) {
        cell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
      } else {
        cell.alignment = { horizontal: "right", vertical: "middle", indent: 1 };
      }
      cell.border = {
        top: { style: "thin", color: { argb: "FFD9D9D9" } },
        left: { style: "thin", color: { argb: "FFD9D9D9" } },
        bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
        right: { style: "thin", color: { argb: "FFD9D9D9" } },
      };

      // Currency format for bill columns
      if (col === 3 || col === 4 || col === 5) {
        cell.numFmt = '[$₹-en-IN] #,##0.00';
      } else if (col === 2) {
        cell.numFmt = "0.00";
      }
    });
  });

  // Summary sheet
  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.properties.defaultRowHeight = 20;
  summarySheet.columns = [{ width: 34 }, { width: 24 }];

  summarySheet.getCell("A1").value = "Billing Summary";
  summarySheet.getCell("A1").font = { name: "Calibri", bold: true, size: 14 };

  summarySheet.addRow(["Metric", "Value"]);
  summarySheet.addRow(["Total Units Consumed", calculated.totalUnitsConsumed.toFixed(2)]);
  summarySheet.addRow(["Cauvery Units", extracted.cauveryUnits]);
  summarySheet.addRow(["Tanker Units", extracted.tankerTotalUnits]);
  summarySheet.addRow(["Borewell Units (Calculated)", calculated.borewellUnits.toFixed(2)]);
  summarySheet.addRow([]);
  summarySheet.addRow(["Cost Summary", ""]);
  summarySheet.addRow(["Cauvery Bill", `₹${extracted.cauveryBill.toFixed(2)}`]);
  summarySheet.addRow(["Tanker Cost", `₹${extracted.tankerTotalPaid.toFixed(2)}`]);
  summarySheet.addRow(["Operation Fee", `₹${extracted.operationFee.toFixed(2)}`]);
  summarySheet.addRow(["Total Amount Spent", `₹${calculated.totalSpent.toFixed(2)}`]);
  summarySheet.addRow(["Cost Per Unit", `₹${calculated.costPerUnit.toFixed(2)}`]);
  summarySheet.addRow(["Fixed Maintenance (per flat)", `₹${extracted.fixedMaintenance.toFixed(2)}`]);

  await workbook.xlsx.writeFile(outputPath);
}

// Main process function
export const aiExcelService = {
  async process(
    inputPath: string,
    _options?: { costPerUnit?: number; fixedMaintenanceCharge?: number }
  ): Promise<{
    fileId: string;
    rows: BillingRow[];
    summary: any;
    outputPath: string;
    extracted: ExtractedExcelData;
    calculated: CalculatedData;
  }> {
    if (!env.cohereApiKey) {
      throw new AppError(
        "COHERE_API_KEY is not configured. Please set it in the .env file.",
        500
      );
    }

    // Convert Excel to text for Cohere
    const excelText = await excelToText(inputPath);

    // Use Cohere to extract data
    const extracted = await extractDataWithCohere(excelText);

    // Validate extracted data
    if (!extracted.flatTable || extracted.flatTable.length === 0) {
      throw new AppError("No flat data found in the Excel file", 400);
    }

    // Calculate metrics
    const calculated = calculateMetrics(extracted);

    // Build billing rows
    const rows: BillingRow[] = extracted.flatTable.map((flat: any) => ({
      flatUnit: flat.flatNumber,
      cauveryUnits: (extracted.cauveryUnits / calculated.totalUnitsConsumed) * flat.unitsConsumed,
      tankerUnits: (extracted.tankerTotalUnits / calculated.totalUnitsConsumed) * flat.unitsConsumed,
      borewellUnits: (calculated.borewellUnits / calculated.totalUnitsConsumed) * flat.unitsConsumed,
      totalUnits: flat.unitsConsumed,
      waterBill: Number((flat.unitsConsumed * calculated.costPerUnit).toFixed(2)),
      maintenance: Number((flat.unitsConsumed * calculated.costPerUnit + extracted.fixedMaintenance).toFixed(2)),
    }));

    // Summary
    const summary = {
      totalCauveryUnits: extracted.cauveryUnits,
      totalTankerUnits: extracted.tankerTotalUnits,
      totalBorewellUnits: calculated.borewellUnits,
      totalUnits: calculated.totalUnitsConsumed,
      cauveryCost: extracted.cauveryBill,
      tankerCost: extracted.tankerTotalPaid,
      borewellCost: 0,
      operationCharges: extracted.operationFee,
      fixedMaintenance: extracted.fixedMaintenance * extracted.flatTable.length,
      totalAmount: calculated.totalSpent,
    };

    // Create output file
    const fileId = uuidv4();
    const outputPath = path.join(process.cwd(), "storage", "outputs", `${fileId}.xlsx`);
    await createOutputWorkbook(outputPath, extracted, calculated);

    return {
      fileId,
      rows,
      summary,
      outputPath,
      extracted,
      calculated,
    };
  },
};
