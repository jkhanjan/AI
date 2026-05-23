require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const ingestRoutes = require("./routes/ingest");

const app = express();
const PORT = process.env.INGESTION_PORT || 4000;
const MONGO_URI = process.env.MONGODB_URL;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use((req, _res, next) => {
  next();
});

app.use("/api/ingest", ingestRoutes);

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "ingestion-service", timestamp: new Date().toISOString() })
);

app.use((_req, res) => res.status(404).json({ error: "Route not found." }));

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[MongoDB] Connected`);
    app.listen(PORT, () =>
      console.log(`[Ingestion Service] Running on ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("[MongoDB] Connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;