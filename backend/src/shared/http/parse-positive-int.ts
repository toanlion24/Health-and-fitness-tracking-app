import { ApiErrorCodes } from "@health-fitness/shared";
import { AppError } from "../errors/app-error.js";

export function parsePositiveIntParam(
  value: string | undefined,
  label: string,
): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    throw new AppError(
      400,
      ApiErrorCodes.VALIDATION_ERROR,
      `Invalid ${label}`,
      { field: label, value },
    );
  }
  return n;
}
