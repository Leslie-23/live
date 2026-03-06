import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import recordingRoutes from "./routes/recordings";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recordings", recordingRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok", ts: new Date() }));

// ── Start ─────────────────────────────────────────────────────────────────────

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀  Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
