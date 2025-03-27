const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const { authenticate } = require("./authRoutes");

const router = express.Router();

// MongoDB Connection
const conn = mongoose.connection;
let gridFSBucket;

conn.once("open", () => {
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "audioFiles" });
});

// Multer Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Audio (Protected Route)
router.post("/upload", authenticate, upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { originalname, buffer } = req.file;

  try {
    const uploadStream = gridFSBucket.openUploadStream(originalname, {
      contentType: "audio/wav",
    });

    uploadStream.end(buffer);

    uploadStream.on("finish", () => {
      res.status(200).json({ message: "File uploaded successfully" });
    });

    uploadStream.on("error", (err) => {
      console.error("Upload Error:", err);
      res.status(500).json({ error: "File upload failed" });
    });
  } catch (err) {
    console.error("Upload Exception:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Audio File (Protected Route)
router.get("/file/:filename", authenticate, async (req, res) => {
  try {
    const file = await mongoose.connection.db.collection("audioFiles.files").findOne({ filename: req.params.filename });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const readStream = gridFSBucket.openDownloadStream(file._id);
    res.set("Content-Type", file.contentType);
    readStream.pipe(res);
  } catch (err) {
    console.error("File Fetch Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;