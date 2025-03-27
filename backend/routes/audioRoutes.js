const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Grid = require("gridfs-stream");
const { GridFSBucket } = require("mongodb");
const { authenticate } = require("./authRoutes");

const router = express.Router();

// MongoDB Connection
const conn = mongoose.connection;
let gfs, gridFSBucket;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("audioFiles");
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "audioFiles" });
});

// Multer Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Audio (Protected Route)
router.post("/upload", authenticate, upload.single("audio"), (req, res) => {
  const { originalname, buffer } = req.file;

  const uploadStream = gridFSBucket.openUploadStream(originalname, {
    contentType: "audio/wav",
  });

  uploadStream.end(buffer);

  uploadStream.on("finish", () => {
    res.status(200).json({ message: "File uploaded successfully" });
  });

  uploadStream.on("error", (err) => {
    res.status(500).json({ error: err.message });
  });
});

// Get Audio File (Protected Route)
router.get("/file/:filename", authenticate, async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const readStream = gridFSBucket.openDownloadStream(file._id);
    res.set("Content-Type", file.contentType);
    readStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
