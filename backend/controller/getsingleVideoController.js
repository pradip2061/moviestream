const axios = require("axios");
const videoModel = require("../model/videoModel");

const getsinglevideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const videoDoc = await videoModel.findById(videoId);

    if (!videoDoc) return res.status(404).json({ message: "Video not found" });

    const qualities = videoDoc.qualities;

    // Fetch related videos (same genres)
    const relatedVideos = await videoModel
      .find({
        genres: { $in: videoDoc.genres },
        _id: { $ne: videoId },
      })
      .sort({ createdAt: -1 })
      .limit(4);

    // Fetch same-name videos (like episodes of a series)
    let episodes = [];
    if (videoDoc.name) {
      episodes = await videoModel.find({
        name: videoDoc.name,
        _id: { $ne: videoId }, // exclude current video
      });
    }

    res.json({
      videoDoc,
      qualities,
      relatedVideos,
      episodes, // <-- episodes or videos with same name
    });
  } catch (err) {
    console.error("Error fetching video:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = getsinglevideo;
