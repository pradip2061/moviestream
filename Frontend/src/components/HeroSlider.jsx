import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Play, Info, Star } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const HeroSlider = () => {
  const { trendingvideos, status } = useSelector((state) => state.getvideo);
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayRef = useRef(null);
  const navigate = useNavigate()
  // Placeholder slides if loading
  const slides = status === "pending" ? [1, 2, 3] : trendingvideos;

  // Outside click handler (capture phase so Swiper doesn't block it)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        setShowOverlay(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  return (
    <div className="w-full h-[85vh] relative">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        className="h-full"
      >
        {slides?.map((movie, index) => (
          <SwiperSlide key={index}>
            <div
              className="w-full h-[85vh] relative bg-black/90"
              style={{
                backgroundImage:
                  status !== "pending" ? `url(${movie.image})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay loader */}
              {status === "pending" ? (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/60 pointer-events-none" />
              )}

              {/* Slide content */}
              {status !== "pending" && (
                <div className="absolute  top-1/2 -translate-y-1/2 left-6 md:left-20 max-w-2xl text-white space-y-4">
                  <h1 className="text-4xl md:text-6xl font-extrabold">
                    {movie.title}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-200 text-sm md:text-base">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 h-5 w-5" />
                      <span>{movie.rating}</span>
                    </div>
                    <span>{movie.year}</span>
                    <span>{movie.duration}</span>
                    <div className="flex gap-2">
                      {movie.genres.map((genre, i) => (
                        <span
                          key={i}
                          className="bg-gray-800/80 px-2 py-1 rounded text-xs md:text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-200 text-lg md:text-lg">
                    {movie.description}
                  </p>

                  <div className="flex gap-4">
                    <button
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold"
                      onClick={() =>
                        navigate(
                          `/getsinglevideo/${encodeURIComponent(
                            btoa(movie._id)
                          )}`
                        )
                      }
                    >
                      <Play className="h-5 w-5" /> Play Now
                    </button>
                    <button
                      onClick={() => setShowOverlay(true)}
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-5 py-2 rounded-lg font-semibold"
                    >
                      <Info className="h-5 w-5" /> More Info
                    </button>
                  </div>
                </div>
              )}

              {/* Example Overlay that closes on outside click */}
              {showOverlay && (
                <div
                  ref={overlayRef}
                  className="absolute top-10 left-10 bg-gray-900 text-white p-6 rounded-lg shadow-lg z-50 w-[300px]"
                >
                  <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
                  <p className="text-gray-300 text-sm">{movie.description}</p>
                  <button
                    className="mt-3 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                    onClick={() => setShowOverlay(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSlider;
