import multer from "multer";
import logger from "../config/logger.js";

export default function errorHandler(err, req, res, next) {
  // Multer file size limit
  if (err && err.code === "LIMIT_FILE_SIZE") {
    logger.warn("Upload rejected: file too large");
    return res.status(413).json({ error: "File too large. Max size is 5MB" });
  }

  // Custom invalid file type
  if (err && err.code === "INVALID_FILE_TYPE") {
    logger.warn("Upload rejected: invalid file type");
    return res.status(400).json({ error: err.message || "Invalid file type" });
  }

  // Other multer errors
  if (err instanceof multer.MulterError) {
    logger.warn("Multer error: " + err.code);
    return res.status(400).json({ error: err.message || "File upload error" });
  }

  // Generic handler (log and return 500)
  if (err) {
    logger.error("Unhandled error", err);
    return res.status(500).json({ error: "Internal server error" });
  }

  next();
}
