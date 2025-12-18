import express from "express";
import uploadUpload from "../middlewares/uploadFile.js";
import controller from "../controllers/index.js";
import validateQuery from "../middlewares/validateQuery.js";
import validateFileExists from "../middlewares/validateFileExists.js";

const router = express.Router();

router.post(
  "/upload",
  uploadUpload().single("file"),
  validateFileExists,
  controller.uploadFile
);
router.post(
  "/process-excel",
  uploadUpload().single("file"),
  validateFileExists,
  controller.processExcelFile
);
router.get("/getAll", validateQuery, controller.getAllRecords);

export default router;
