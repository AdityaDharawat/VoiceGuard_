import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { GridFSBucket } from "mongodb";
import { authenticate } from "../routes/authRoutes.js";

const router = express.Router();

// MongoDB Connection
const conn = mongoose.connection;
let gridFSBucket;

// Initialize GridFSBucket when MongoDB is connected
conn.once("open", () => {
  console.log("✅ MongoDB connection established!");
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "audioFiles" });
});

// Multer Storage (stores in memory before uploading to GridFS)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 Upload Audio (Protected Route)
router.post("/upload", authenticate, upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { originalname, buffer } = req.file;

  try {
    const uploadStream = gridFSBucket.openUploadStream(originalname, {
      contentType: "audio/wav",
    });

    uploadStream.write(buffer);
    uploadStream.end();

    uploadStream.on("finish", () => {
      res.status(200).json({ message: "✅ File uploaded successfully!", filename: originalname });
    });

    uploadStream.on("error", (err) => {
      console.error("❌ Upload Error:", err);
      res.status(500).json({ error: "File upload failed" });
    });

  } catch (err) {
    console.error("❌ Upload Exception:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Get Audio File (Protected Route)
router.get("/file/:filename", authenticate, async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename); // Handle special characters
    const file = await conn.db.collection("audioFiles.files").findOne({ filename });

    if (!file) {
      return res.status(404).json({ error: "❌ File not found" });
    }

    const readStream = gridFSBucket.openDownloadStream(file._id);
    res.set("Content-Type", file.contentType);
    readStream.pipe(res);
  } catch (err) {
    console.error("❌ File Fetch Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 List All Uploaded Files
router.get("/files", authenticate, async (req, res) => {
  try {
    const files = await conn.db.collection("audioFiles.files").find().toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: "No files found" });
    }
    res.json(files);
  } catch (err) {
    console.error("❌ File List Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Export the Router
export { router };