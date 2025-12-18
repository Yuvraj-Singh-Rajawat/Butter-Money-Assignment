import fs from "fs";
import path from "path";
import * as xlsx from "xlsx";
import logger from "../config/logger.js";
import User from "../models/user.js";
import { validateRow } from "../validators/rowValidator.js";
import { parseQuery } from "../validators/queryValidator.js";

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Return stored path relative to public directory so it can be served statically
    const publicRoot = path.join(process.cwd(), "public");
    console.log("publicRoot", publicRoot);
    const publicRelative = path
      .relative(publicRoot, file.path)
      .replace(/\\/g, "/");
    const urlPath = publicRelative.startsWith("uploads")
      ? `/${publicRelative}`
      : `/uploads/${publicRelative}`;

    // Add full URL and absolute path (optional)
    const host = req.get("host");
    const proto = req.get("x-forwarded-proto") || req.protocol;
    const fullUrl = `${proto}://${host}${urlPath}`;

    return res.status(201).json({
      message: "File uploaded",
      path: urlPath,
      url: fullUrl, 
    });
  } catch (error) {
    logger.error("Upload error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const processExcelFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = fs.readFileSync(file.path);
    let workbook;
    try {
      workbook = xlsx.read(fileBuffer, { type: "buffer", cellDates: true });
    } catch (err) {
      logger.error("Failed to parse spreadsheet", err);
      return res
        .status(400)
        .json({
          error:
            "Failed to parse spreadsheet. Ensure file is a valid xls/xlsx/csv",
        });
    }

    const sheetName = workbook.SheetNames && workbook.SheetNames[0];
    if (!sheetName)
      return res.status(400).json({ error: "No sheets found in spreadsheet" });

    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

    const skipped = [];
    const inserted = [];

    // Collect ids in file to detect duplicates in-file
    const seenIds = new Set();

    for (const [idx, row] of rows.entries()) {
      const rowNum = idx + 2; // header -> row 1
      const validation = validateRow(row);
      if (!validation.ok) {
        skipped.push({ row: rowNum, errors: validation.errors });
        logger.warn(`Skipping row ${rowNum}: ${validation.errors.join("; ")}`);
        continue;
      }

      const parsed = validation.data;

      if (seenIds.has(parsed.id)) {
        skipped.push({ row: rowNum, errors: ["Duplicate id in file"] });
        logger.warn(`Skipping row ${rowNum}: duplicate id in file`);
        continue;
      }

      // Check uniqueness in DB
      const existing = await User.findByPk(parsed.id);
      if (existing) {
        skipped.push({ row: rowNum, errors: ["Duplicate id in database"] });
        logger.warn(`Skipping row ${rowNum}: duplicate id in database`);
        continue;
      }

      // Insert
      try {
        const created = await User.create({
          id: parsed.id,
          name: parsed.name,
          age: parsed.age,
          education: parsed.education,
        });
        inserted.push({ id: created.id });
        seenIds.add(parsed.id);
      } catch (err) {
        skipped.push({ row: rowNum, errors: ["DB insert failed"] });
        logger.error(`Failed to insert row ${rowNum}`, err);
      }
    }

    return res.status(200).json({
      message: "Processing complete",
      insertedCount: inserted.length,
      skipped,
      inserted,
    });
  } catch (error) {
    logger.error("Processing error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllRecords = async (req, res) => {
  try {
    const { page, limit, education } = req.pagination || { page: 1, limit: 10 };
    const offset = (page - 1) * limit;
    const where = {};
    if (education) where.education = education;

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    return res.status(200).json({ page, limit, total: count, data: rows });
  } catch (error) {
    logger.error("GetAll error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default { uploadFile, processExcelFile, getAllRecords };
