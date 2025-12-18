export default function validateFileExists(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  next();
}
