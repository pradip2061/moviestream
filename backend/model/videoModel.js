// models/Video.js
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    rating: { type: Number, min: 0, max: 10 },
    name:{
      type:String
    },
    year: { type: Number },
    duration: { type: String }, // e.g., "2h 56m"
    genres: [String],
    description: { type: String },
    image: { type: String },
    videoUrl: { type: String },
    qualities: {
      "1080p": { type: String },
      "720p": { type: String },
      "480p": { type: String },
    },
    hlsUrl: { type: String },
    comments: [
      {
        username: { type: String },
        userid: { type: String },
        replies: [
          {
            username: { type: String },
            userid: { type: String },
            createdAt: { type: Date, default: Date.now },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
