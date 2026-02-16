import { AppError } from "./errors";

export const assertGmail = (value: string, fieldName = "Gmail") => {
  if (!value || !value.toLowerCase().endsWith("@gmail.com")) {
    throw new AppError(`${fieldName} must be a valid @gmail.com address`, 400);
  }
};

export const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
