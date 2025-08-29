const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { cloudinary } = require("../utils/cloudinary");
const Video = require("../model/videoModel");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Helper: upload large video to Cloudinary
const uploadLargeVideo = (filePath, publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      filePath,
      {
        resource_type: "video",
        folder: "videos",
        chunk_size: 6000000,
        public_id: publicId,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
};

// Upload video + thumbnail
router.post(
  "/upload",
  upload.fields([
    { name: "videoUrl", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const videoFile = req.files["videoUrl"]?.[0];
      const imageFile = req.files["image"]?.[0];

      let videoResult = null;
      let imageResult = null;

      // Upload video to Cloudinary
      if (videoFile) {
        const publicId = Date.now() + "-" + videoFile.originalname.split(".")[0];
        const result = await uploadLargeVideo(videoFile.path, publicId);
        fs.unlinkSync(videoFile.path); // remove temp file

        // ✅ Generate HLS URLs with HTTPS
        const qualities = {
          "1080p": cloudinary.url(result.public_id, {
            resource_type: "video",
            format: "m3u8",
            secure: true,
            transformation: [{ height: 1080 }, { quality: "auto" }],
          }),
          "720p": cloudinary.url(result.public_id, {
            resource_type: "video",
            format: "m3u8",
            secure: true,
            transformation: [{ height: 720 }, { quality: "auto" }],
          }),
          "480p": cloudinary.url(result.public_id, {
            resource_type: "video",
            format: "m3u8",
            secure: true,
            transformation: [{ height: 480 }, { quality: "auto" }],
          }),
        };

        videoResult = { public_id: result.public_id, qualities };
      }

      // Upload thumbnail (image)
      if (imageFile) {
        const imgResult = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
          folder: "images",
          public_id: Date.now() + "-" + imageFile.originalname.split(".")[0],
        });
        fs.unlinkSync(imageFile.path);
        imageResult = imgResult;
      }

      // Parse genres
      let genres = [];
      if (req.body.genres) {
        try {
          const parsed = JSON.parse(req.body.genres);
          genres = parsed.map((g) => g.name);
        } catch {
          console.warn("Invalid genres format");
        }
      }

      // Save video in DB
      const newVideo = new Video({
        title: req.body.title,
        rating: req.body.rating || 0,
        year: req.body.year,
        duration: req.body.duration,
        genres,
        description: req.body.description,
        image: imageResult?.secure_url || null,
        videoUrl: null, // we store qualities instead
        qualities: videoResult?.qualities || null,
        comments: [],
        name: req.body.name,
      });

      await newVideo.save();
      res.json({ success: true, video: newVideo });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

module.exports = router;
