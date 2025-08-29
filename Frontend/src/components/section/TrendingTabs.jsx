import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetVideos, setCategory } from "../../../store/fetchvideo/fetchvideoSlice";

const tabs = ["Trending", "Newest", "Popular", "Webseries"];
const genres = [
  "All",
  "Action",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Adventure",
];

const TrendingTabs = () => {
  const [activeTab, setActiveTab] = useState("Trending");
  const [activeGenre, setActiveGenre] = useState("All");
  const dispatch = useDispatch();

  useEffect(() => {
    // ✅ If Webseries tab is active → force genre = "webseries"
    const genreToSend = activeTab === "Webseries" ? "webseries" : activeGenre;

    dispatch(resetVideos());
    dispatch(
      setCategory({
        category: activeTab.toLowerCase(),
        genres: genreToSend,
      })
    );
  }, [dispatch, activeTab, activeGenre]);

  return (
    <div className="p-6 space-y-6 bg-gray-900 lg:px-40 pt-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Discover Movies</h1>
        <p className="text-gray-300">
          Find your next favorite movie or webseries with our advanced filters
        </p>
      </div>

      {/* Top Tabs */}
      <div className="flex flex-wrap gap-2 w-full sm:w-auto py-1 rounded">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded text-sm font-medium transition-all duration-300 ${
              activeTab === tab
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Genre Tabs */}
      <div className="flex gap-3 flex-wrap">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            disabled={activeTab === "Webseries"} // 🔒 disable genres if Webseries tab
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeGenre === genre && activeTab !== "Webseries"
                ? "bg-red-500 text-white shadow-md"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            } ${activeTab === "Webseries" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendingTabs;
