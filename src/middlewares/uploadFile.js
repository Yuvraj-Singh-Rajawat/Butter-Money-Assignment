import multer from "multer";
import path from "path";
import fs from "fs";
import {
  MAX_FILE_SIZE,
  FILE_UPLOAD_DIR_ON_SERVER,
  ALLOWED_FILE_TYPE,
} from "../constants/index.js";

// Ensure upload dir exists
if (!fs.existsSync(FILE_UPLOAD_DIR_ON_SERVER)) {
  fs.mkdirSync(FILE_UPLOAD_DIR_ON_SERVER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, FILE_UPLOAD_DIR_ON_SERVER),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_");
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const limits = {
  fileSize: MAX_FILE_SIZE,
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = ALLOWED_FILE_TYPE;
  const extension = path.extname(file.originalname).slice(1);

  if (allowedTypes.test(extension)) {
    cb(null, true);
  } else {
    const err = new Error("Only xls, xlsx, and csv files are allowed!");
    err.code = "INVALID_FILE_TYPE";
    cb(err, false);
  }
};

export default function uploadFile() {
  return multer({
    storage,
    limits,
    fileFilter,
  });
}
