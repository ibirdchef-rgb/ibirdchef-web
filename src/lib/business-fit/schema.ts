import { z } from "zod";
import {
  BUSINESS_TYPES,
  CUISINES,
  FACILITY_SIZES,
  INVESTMENT_BUDGETS,
  OWNER_EXPERIENCE,
  SERVICE_MODELS,
  type BusinessFitInput,
} from "@/lib/business-fit/types";

const ZIP_RE = /^\d{5}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const businessFitInputSchema = z
  .object({
    zipCode: z
      .string()
      .trim()
      .max(16)
      .regex(ZIP_RE, "zipCode must be a 5-digit U.S. ZIP code"),
    businessType: z.enum(BUSINESS_TYPES),
    cuisine: z.enum(CUISINES),
    investmentBudget: z.enum(INVESTMENT_BUDGETS),
    ownerExperience: z.enum(OWNER_EXPERIENCE),
    facilitySize: z.enum(FACILITY_SIZES),
    serviceModel: z.enum(SERVICE_MODELS),
    targetOpeningDate: z
      .string()
      .trim()
      .max(32)
      .regex(ISO_DATE_RE, "targetOpeningDate must be YYYY-MM-DD")
      .refine((value) => {
        const [y, m, d] = value.split("-").map(Number);
        const date = new Date(Date.UTC(y, m - 1, d));
        return (
          date.getUTCFullYear() === y &&
          date.getUTCMonth() === m - 1 &&
          date.getUTCDate() === d
        );
      }, "targetOpeningDate must be a valid calendar date"),
  })
  .strict();

export type ParsedBusinessFitInput = z.infer<typeof businessFitInputSchema>;

export type ValidationSuccess = {
  ok: true;
  data: BusinessFitInput;
};

export type ValidationFailure = {
  ok: false;
  error: {
    code: "validation_error";
    message: string;
    issues: Array<{ path: string; message: string }>;
  };
};

export function parseBusinessFitInput(raw: unknown): ValidationSuccess | ValidationFailure {
  const parsed = businessFitInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "validation_error",
        message: "Invalid business-fit input",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join(".") || "(root)",
          message: issue.message,
        })),
      },
    };
  }

  return { ok: true, data: parsed.data };
}

export const compareConceptsInputSchema = z
  .object({
    concepts: z
      .array(
        z
          .object({
            label: z.string().trim().min(1).max(80),
            input: businessFitInputSchema,
          })
          .strict(),
      )
      .min(2)
      .max(3),
  })
  .strict();

export function parseCompareConceptsInput(raw: unknown) {
  const parsed = compareConceptsInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: {
        code: "validation_error" as const,
        message: "Invalid compare-concepts input",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join(".") || "(root)",
          message: issue.message,
        })),
      },
    };
  }
  return { ok: true as const, data: parsed.data };
}
