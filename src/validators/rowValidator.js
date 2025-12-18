import { z } from "zod";

const rowSchema = z.object({
  id: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
  }, z.number().int().positive()),
  name: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val).trim()),
    z.string().min(1)
  ),
  age: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
  }, z.number().positive()),
  education: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val).trim()),
    z.string().min(1)
  ),
});

export function validateRow(rawRow) {
  // normalize keys (case-insensitive)
  const normalized = {
    id: rawRow.Id ?? rawRow.id ?? rawRow.ID,
    name: rawRow.Name ?? rawRow.name,
    age: rawRow.Age ?? rawRow.age,
    education: rawRow.Education ?? rawRow.education,
  };

  const res = rowSchema.safeParse(normalized);
  if (res.success) return { ok: true, data: res.data };
  const errors = res.error.errors.map(
    (e) => `${e.path.join(".")}: ${e.message}`
  );
  return { ok: false, errors };
}
