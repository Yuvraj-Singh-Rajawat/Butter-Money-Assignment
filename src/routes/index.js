import express from "express";
import uploadFile from "../middlewares/uploadFile.js";
import commonController from "../controllers/index.js";

const router = express.Router();

import filesRouter from "./files.js";

router.use("/files", filesRouter);

export default router;
