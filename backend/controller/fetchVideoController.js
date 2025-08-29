const mongoose = require("mongoose");
const Video = require("../model/videoModel");

const fetchVideo = async (req, res) => {
  try {
    let { genres, category, page = 1, limit = 12 } = req.query;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build match query
    let matchQuery = {};
    if (genres && genres !== "All") {
      matchQuery.genres = genres;
    }

    // Sorting logic
    let sortStage = {};
    const cat = category.toLowerCase();

    if (cat === "trending" || cat === "newest") {
      sortStage = { createdAt: -1 };
    } else if (cat === "popular") {
      sortStage = { rating: -1 };
    }

    // 🎬 Trending slider movies (latest 3)
    const trendingmovies = await Video.find()
      .sort({ createdAt: -1 })
      .limit(3);

    // 🎥 Paginated movies
    const movies = await Video.find(matchQuery)
      .sort(sortStage)
      .skip(skip)
      .limit(limit);

    // 📊 Total count (for frontend pagination)
    const totalMovies = await Video.countDocuments(matchQuery);

    res.status(200).json({
      movies,
      category,
      genres,
      trendingmovies,
      currentPage: page,
      totalPages: Math.ceil(totalMovies / limit),
      totalMovies,
    });
  } catch (error) {
    console.error("Fetch Video Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { fetchVideo };
