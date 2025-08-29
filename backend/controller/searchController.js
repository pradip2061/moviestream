const videoModel = require("../model/videoModel");

const search = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    // Case-insensitive partial match on title or description
    const videos = await videoModel.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    }).select("title thumbnailUrl duration qualities createdAt image");

    if (!videos.length) {
      return res.status(404).json({ success: false, message: "No videos found" });
    }

    res.json({ success: true, videos });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = search