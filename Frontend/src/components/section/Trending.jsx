import React, { useEffect, useState } from "react";
import Card from "../Card/Card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getvideoThunk } from "../../../store/fetchvideo/fetchvideoThunk";

const Trending = () => {
  const [page, setPage] = useState(1); // 👈 current page

  const { category, genres, limit, videos, hasMore, status } = useSelector(
    (state) => state.getvideo
  );
  const dispatch = useDispatch();

  // 🔄 Fetch videos
  const fetchVideos = async (pageNum) => {
    await dispatch(getvideoThunk({ page: pageNum, limit }));
  };

  // 📦 Initial + when category/genres change
  useEffect(() => {
    setPage(1); // reset page
    fetchVideos(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, genres]);

  // ⌛ Skeleton while loading first page
  if (status === "pending" && videos.length === 0) {
    return (
      <div className=" bg-gray-900 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 w-full mx-auto px-4 lg:px-20 pt-20">
        {Array(8)
          .fill(0)
          .map((_, idx) => (
            <div
              key={idx}
              className="bg-gray-800 rounded-xl overflow-hidden shadow animate-pulse h-60 w-full"
            ></div>
          ))}
      </div>
    );
  }

  return (
    <div className="h-full relative bg-gray-900 py-10">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-20">
        <h1 className="text-3xl font-bold text-white mb-6">
          {category} movies
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {videos.map((movie, index) => (
            <div
              key={`${movie._id}-${index}`}
              className="video-slide snap-start snap-always relative"
            >
              <Card
                id={movie?._id}
                title={movie?.title}
                year={movie?.year}
                duration={movie?.duration}
                genre={movie?.genres}
                rating={movie?.rating}
                image={movie?.image}
              />
            </div>
          ))}
        </div>

        {/* 📌 Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => {
              if (page > 1) {
                const newPage = page - 1;
                setPage(newPage);
                fetchVideos(newPage);
              }
            }}
            disabled={page === 1}
            className="flex items-center bg-gray-700 px-4 py-2 rounded text-white text-sm font-bold shadow-lg disabled:opacity-50"
          >
            <ChevronLeft className="mr-1 w-4 h-4" /> Prev
          </button>

          <span className="text-white font-semibold">Page {page}</span>

          <button
            onClick={() => {
              if (hasMore) {
                const newPage = page + 1;
                setPage(newPage);
                fetchVideos(newPage);
              }
            }}
            disabled={!hasMore}
            className="flex items-center bg-pink-500 px-4 py-2 rounded text-white text-sm font-bold shadow-lg disabled:opacity-50"
          >
            Next <ChevronRight className="ml-1 w-4 h-4" />
          </button>
        </div>

        {/* 🎬 No more videos */}
        {!hasMore && videos.length > 0 && (
          <p className="text-center text-gray-400 py-6">
            You’ve reached the end 🚀
          </p>
        )}
      </div>
    </div>
  );
};

export default Trending;
