export type BillingRow = {
  flatUnit: string;
  cauveryUnits: number;
  tankerUnits: number;
  borewellUnits: number;
  totalUnits: number;
  waterBill: number;
  maintenance: number;
};

export type BillingSummary = {
  totalCauveryUnits: number;
  totalTankerUnits: number;
  totalBorewellUnits: number;
  totalUnits: number;
  cauveryCost: number;
  tankerCost: number;
  borewellCost: number;
  operationCharges: number;
  fixedMaintenance: number;
  totalAmount: number;
};

export type ProcessResult = {
  fileId: string;
  rows: BillingRow[];
  summary: BillingSummary;
  outputPath: string;
};

export type User = {
  id: string;
  gmail: string;
  passwordHash: string;
};

export type UploadRecord = {
  id: string;
  userId: string;
  originalFileName: string;
  storedPath: string;
  createdAt: string;
};

export type ProcessedRecord = {
  id: string;
  sourceUploadId: string;
  userId: string;
  outputPath: string;
  rows: BillingRow[];
  summary: BillingSummary;
  createdAt: string;
};

// AI-extracted data from the Excel file
export type ExtractedExcelData = {
  flatTable: {
    flatNumber: string;
    unitsConsumed: number;
  }[];
  cauveryUnits: number;
  cauveryBill: number;
  tankerUnitsPerUnit: number;
  tankerCount: number;
  tankerTotalUnits: number;
  tankerCostPerUnit: number;
  tankerTotalPaid: number;
  operationFee: number;
  fixedMaintenance: number;
};

export type CalculatedData = {
  totalUnitsConsumed: number;
  totalSpent: number;
  borewellUnits: number;
  costPerUnit: number;
};

export type ProcessResponseWithExtracted = {
  extracted: ExtractedExcelData;
  calculated: CalculatedData;
  rows: BillingRow[];
  summary: BillingSummary;
  outputPath: string;
  fileId: string;
};

