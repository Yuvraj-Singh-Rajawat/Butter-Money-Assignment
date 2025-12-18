import { parseQuery } from "../validators/queryValidator.js";

export default function validateQuery(req, res, next) {
  const parsed = parseQuery(req.query);
  if (!parsed.ok) {
    return res.status(400).json({ errors: parsed.errors });
  }
  req.pagination = parsed.data;
  next();
}
