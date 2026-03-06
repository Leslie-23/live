import { Router, Response } from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { Readable } from "stream";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

// Store upload in memory, then pipe to GridFS
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("audio/")) cb(null, true);
    else cb(new Error("Only audio files are accepted"));
  },
});

router.use(protect);

// ── POST /api/recordings/upload ───────────────────────────────────────────────

router.post(
  "/upload",
  upload.single("audio"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ message: "No audio file provided" });
      return;
    }

    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ message: "Database not ready" });
      return;
    }

    const bucket = new GridFSBucket(db, { bucketName: "audio" });

    const filename = `${req.user!._id}_${Date.now()}_${req.file.originalname}`;

    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        userId: req.user!._id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        uploadedAt: new Date(),
        transcriptStatus: "pending",
      },
    });

    const readable = Readable.from(req.file.buffer);
    readable.pipe(uploadStream);

    uploadStream.on("finish", () => {
      res.status(201).json({
        _id: uploadStream.id,
        filename,
        size: req.file!.size,
      });
    });

    uploadStream.on("error", (err) => {
      console.error("GridFS upload error:", err);
      res.status(500).json({ message: "Failed to store recording" });
    });
  }
);

// ── GET /api/recordings ───────────────────────────────────────────────────────

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  const db = mongoose.connection.db;
  if (!db) { res.status(503).json({ message: "Database not ready" }); return; }

  const bucket = new GridFSBucket(db, { bucketName: "audio" });

  const files = await bucket
    .find({ "metadata.userId": req.user!._id })
    .sort({ uploadDate: -1 })
    .toArray();

  res.json(files);
});

// ── GET /api/recordings/:id/stream ───────────────────────────────────────────

router.get("/:id/stream", async (req: AuthRequest, res: Response): Promise<void> => {
  const db = mongoose.connection.db;
  if (!db) { res.status(503).json({ message: "Database not ready" }); return; }

  try {
    const bucket = new GridFSBucket(db, { bucketName: "audio" });
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const [file] = await bucket.find({ _id: fileId }).toArray();
    if (!file) { res.status(404).json({ message: "Recording not found" }); return; }

    res.set("Content-Type", file.metadata?.mimeType ?? "audio/mpeg");
    bucket.openDownloadStream(fileId).pipe(res);
  } catch {
    res.status(400).json({ message: "Invalid recording ID" });
  }
});

export default router;
