import express from "express";
import cors from "cors";
import fs from "fs";
import router from "./routes/index.js";
import morgan from "./config/morgan.js";

const app = express();

app.use(morgan.successHandler);
app.use(morgan.errorHandler);


app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/api/v1", router);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "✅ ok",
    message: "🚀 API is healthy",
  });
});

// Error handler (should be last middleware)
import errorHandler from "./middlewares/errorHandler.js";
app.use(errorHandler);

app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
