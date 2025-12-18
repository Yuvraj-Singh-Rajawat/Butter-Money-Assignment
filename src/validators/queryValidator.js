import { z } from "zod";

const querySchema = z.object({
  page: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
  }, z.number().int().min(1).optional()),
  limit: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
  }, z.number().int().min(1).optional()),
  education: z.preprocess(
    (val) => (val === undefined ? undefined : String(val)),
    z.string().optional()
  ),
});

export function parseQuery(raw) {
  const res = querySchema.safeParse(raw);
  if (!res.success) {
    const errors = res.error.errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    return { ok: false, errors };
  }

  const page = res.data.page ?? 1;
  const limit = Math.min(100, res.data.limit ?? 10);
  const education = res.data.education;
  return { ok: true, data: { page, limit, education } };
}
