import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  Loader2,
} from "lucide-react";
import Card from "../components/Card/Card";

const SingleVideoWatch = () => {
  const { id } = useParams();
  const decodedId = atob(decodeURIComponent(id));
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [qualities, setQualities] = useState({});
  const [currentQuality, setCurrentQuality] = useState("");
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [video, setVideo] = useState({});
  const [relatedvideos, setRelatedVideos] = useState([]);
  const[episodes,setEpisodes]=useState([])
  // Fetch video and qualities
useEffect(() => {
  const fetchVideo = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/getsinglevideo/${decodedId}`
      );
      const data = await res.json();

      setVideo(data.videoDoc);
      setRelatedVideos(data.relatedVideos);
      setEpisodes(data.episodes);

      const videoQualities = data.qualities || {};
      const mappedQualities = {
        "1080p": videoQualities["1080p"],
        "720p": videoQualities["720p"] || videoQualities["1080p"],
        "480p":
          videoQualities["480p"] ||
          videoQualities["720p"] ||
          videoQualities["1080p"],
      };

      setQualities(mappedQualities);
      setCurrentQuality("1080p");
    } catch (err) {
      console.error("Video not found:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchVideo();

  return () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }
  };
}, [decodedId]);

// 🔥 Separate effect: init HLS when quality is set
useEffect(() => {
  if (qualities && currentQuality && videoRef.current) {
    initHLS(qualities[currentQuality]);
  }
}, [qualities, currentQuality]);

const initHLS = (src) => {
  const video = videoRef.current;
  if (!video) return;

  // Reset UI states
  setPlaying(false);
  setProgress(0);
  setCurrentTime(0);

  // Destroy old HLS
  if (hlsRef.current) {
    hlsRef.current.destroy();
    hlsRef.current = null;
  }

  if (Hls.isSupported()) {
    const hls = new Hls();
    hlsRef.current = hls;
    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.currentTime = 0;
      video.muted = true; // ✅ allow autoplay without user interaction
           setMuted(true);
      video.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    });
  } else {
    video.src = src;
    video.currentTime = 0;
    video.muted = true;
         setMuted(true);
    video.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }
};


  // Video progress & buffering
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
    };
    const handleBuffering = () => setBuffering(true);
    const handlePlaying = () => setBuffering(false);

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("waiting", handleBuffering);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("loadedmetadata", () => setDuration(video.duration));

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("waiting", handleBuffering);
      video.removeEventListener("playing", handlePlaying);
    };
  }, [playing, isOnline]);

  // Network tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Controls hide/show
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(window.hideControlsTimeout);
    window.hideControlsTimeout = setTimeout(() => setShowControls(false), 3000);
  };

  // Format time
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  // Progress
  const handleProgressChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = (e.target.value / 100) * video.duration;
  };

  // Volume
  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    setMuted(vol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  };

  // Speed
  const handleSpeedChange = (e) => {
    const video = videoRef.current;
    const rate = parseFloat(e.target.value);
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

// Fullscreen
// Fullscreen
const toggleFullscreen = async () => {
  const container = containerRef.current;
  const video = videoRef.current;

  if (!container || !video) return;

  // iOS Safari: only video fullscreen works
  if (video.webkitEnterFullscreen) {
    video.webkitEnterFullscreen();
    return;
  }

  // Other browsers
  if (
    !document.fullscreenElement &&
    !document.webkitFullscreenElement &&
    !document.msFullscreenElement
  ) {
    try {
      if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        await container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        await container.msRequestFullscreen();
      }

      // Force landscape if supported
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock("landscape");
      }
      setFullscreen(true);
    } catch (err) {
      console.warn("Fullscreen request or orientation lock failed:", err);
    }
  } else {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }

      // Back to portrait if supported
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock("portrait");
      }
      setFullscreen(false);
    } catch (err) {
      console.warn("Exit fullscreen or orientation unlock failed:", err);
    }
  }
};



 // Quality change (fixed resume issue)
const handleQualityChange = (q) => {
  if (currentQuality === q) return;
  setCurrentQuality(q);

  const video = videoRef.current;
  if (!video) return;

  const currentTime = video.currentTime; // save position
  const wasPlaying = !video.paused;

  // Clean up existing HLS
  if (hlsRef.current) {
    hlsRef.current.destroy();
    hlsRef.current = null;
  }

  if (Hls.isSupported()) {
    const hls = new Hls();
    hlsRef.current = hls;

    hls.loadSource(qualities[q]);
    hls.attachMedia(video);

    // Ensure resume after manifest load
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.currentTime = currentTime;

      if (wasPlaying) {
        video.play().catch(() => {});
      }
    });

    // Sometimes "MANIFEST_PARSED" fires before media is seekable
    hls.on(Hls.Events.LEVEL_SWITCHED, () => {
      if (video.currentTime < currentTime - 0.5 || video.currentTime > currentTime + 0.5) {
        video.currentTime = currentTime;
      }
    });

  } else {
    // Fallback for browsers with native HLS
    video.src = qualities[q];
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = currentTime;
      if (wasPlaying) video.play().catch(() => {});
    }, { once: true });
  }

  setShowQualityDropdown(false);
};

  const [comments, setComments] = useState([
    { id: 1, user: "Alice", text: "This movie was epic!", likes: 12 },
    { id: 2, user: "Bob", text: "The CGI is insane 🔥", likes: 7 },
  ]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      { id: Date.now(), user: "You", text: newComment, likes: 0 },
    ]);
    setNewComment("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex items-center space-x-3 text-white">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <span className="text-xl">Loading video...</span>
        </div>
      </div>
    );
  }

  if (!qualities || !currentQuality) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠</div>
          <p className="text-red-400 text-xl">Video not found</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-14  p-4 lg:p-20 bg-gray-900 text-white min-h-screen pt-20"
      onMouseMove={handleMouseMove}
    >
      {/* Left Column: Video + Comments */}
      <div className="lg:col-span-2 space-y-6">
        {/* Video Player */}
        <div
          ref={containerRef}
          className="w-full relative bg-black rounded-xl shadow-2xl overflow-hidden"
        >
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black cursor-pointer"
            onClick={togglePlay}
          />

          {/* Buffering overlay */}
          {(buffering || !isOnline) && (
            <div className="absolute inset-0 flex items-center justify-center ">
              <div className="flex items-center space-x-3 text-white px-6 py-3 rounded-full backdrop-blur-sm">
                
                <span className="text-lg font-medium">
                  {isOnline ? <Loader2 className=" w-8 h-8 lg:w-16 lg:h-16 animate-spin text-red-500" /> : <div><Loader2 className="w-6 h-6 animate-spin text-red-500" />waiting for Network...</div>}
                </span>
              </div>
            </div>
          )}

          {/* Play Button Overlay */}
          {!playing && !buffering && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center cursor-pointer group"
            >
              <div className="bg-black/50 hover:bg-black/70 transition-all duration-300 rounded-full p-6 group-hover:scale-110">
                <Play
                  className="text-white w-8 h-8 lg:w-16 lg:h-16 md:w-16 md:h-16"
                  fill="white"
                />
              </div>
            </div>
          )}

          {/* Quality + Fullscreen */}
          <div className="absolute top-2 right-2 flex items-center space-x-2 z-30 sm:hidden">
            {/* Mobile */}
            <div className="relative">
              <button
                onClick={() => setShowQualityDropdown(!showQualityDropdown)}
                className="text-white p-2 rounded-full hover:bg-white/10"
              >
                <Settings className="w-5 h-5" />
              </button>
              {showQualityDropdown && (
                <div className="absolute top-12 right-0 bg-gray-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl border border-white/10 min-w-[120px] overflow-hidden text-xs sm:text-sm">
                  <div className="px-3 py-2 text-gray-400 font-medium border-b border-white/10">
                    Quality
                  </div>
                  {Object.keys(qualities).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQualityChange(q)}
                      className={`w-full px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                        currentQuality === q
                          ? "text-red-500 font-medium"
                          : "text-white"
                      }`}
                    >
                      {q}{" "}
                      {currentQuality === q && (
                        <span className="float-right text-red-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="text-white p-2 rounded-full hover:bg-white/10"
            >
              {fullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div
            className={`absolute -bottom-3 lg:bottom-0 md:bottom-0 -left-3 right-0 transition-all duration-300 ${
              showControls
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {/* Progress Bar */}
            <div className="px-4 lg:pb-2">
              <div className="relative group cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer group-hover:h-2 transition-all duration-200"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Bottom Controls Panel */}
            <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 pb-4 lg:pt-2">
              <div className="flex items-center justify-between flex-wrap w-full space-x-2 sm:space-x-4">
                {/* Left Controls */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-red-500 transition-colors p-2 hover:bg-white/10 rounded-full flex-shrink-0"
                  >
                    {playing ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-red-500 transition-colors p-2 hover:bg-white/10 rounded-full flex-shrink-0"
                  >
                    {muted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer flex-shrink-0"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                        volume * 100
                      }%, #4b5563 ${volume * 100}%, #4b5563 100%)`,
                    }}
                  />
                  <div className="text-white text-sm lg:text-lg font-medium truncate max-w-[5rem] sm:max-w-none">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  <select
                    value={playbackRate}
                    onChange={handleSpeedChange}
                    className="bg-white/10 text-gray-500 text-sm px-2 py-1 rounded-md border border-white/20 hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}x
                      </option>
                    ))}
                  </select>

                  {/* Desktop / Tablet Quality + Fullscreen */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowQualityDropdown(!showQualityDropdown)
                        }
                        className="text-white p-2 rounded-full hover:bg-white/10"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      {showQualityDropdown && (
                        <div className="absolute  right-10 bottom-0 bg-gray-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl border border-white/10 min-w-[120px] overflow-hidden text-xs sm:text-sm">
                          <div className="px-3 py-2 text-gray-400 font-medium border-b border-white/10">
                            Quality
                          </div>
                          {Object.keys(qualities).map((q) => (
                            <button
                              key={q}
                              onClick={() => handleQualityChange(q)}
                              className={`w-full px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                                currentQuality === q
                                  ? "text-red-500 font-medium"
                                  : "text-white"
                              }`}
                            >
                              {q}{" "}
                              {currentQuality === q && (
                                <span className="float-right text-red-500">
                                  ✓
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={toggleFullscreen}
                      className="text-white p-2 rounded-full hover:bg-white/10"
                    >
                      {fullscreen ? (
                        <Minimize className="w-5 h-5" />
                      ) : (
                        <Maximize className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Video Info Section - YouTube Style */}
        <div className="bg-gray-800 rounded-xl p-4 space-y-3">
          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {video?.title || "Video Title"}
          </h1>

          {/* Views + Date */}
          <div className="flex items-center text-sm text-gray-400 space-x-4">
            <span>
              {video?.createdAt
                ? new Date(video.createdAt).toDateString()
                : "Jan 1, 2025"}
            </span>
          </div>
          <div>
            <p className={`text-gray-300 text-sm whitespace-pre-line`}>
              {video?.description ||
                "This is the description of the video. It will provide details about the content, genre, or storyline."}
            </p>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-3">Comments</h2>
          <div className="flex mb-4">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-2 rounded-l-lg bg-gray-700 text-white"
            />
            <button
              onClick={handleAddComment}
              className="px-4 bg-red-600 hover:bg-red-700 rounded-r-lg"
            >
              Post
            </button>
          </div>
          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-gray-900 p-3 rounded-lg flex justify-between"
              >
                <span>
                  <b>{c.user}:</b> {c.text}
                </span>
                <span className="text-sm text-gray-400">👍 {c.likes}</span>
              </div>
            ))}
          </div>
        </div>
        {episodes.length > 0 && <h1 className=" text-xl lg:text-3xl  font-bold text-white mt-10 ml-2">Episodes</h1>}
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {episodes.map((movie, index) => (
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
      </div>
      <div className="lg:col-span-1 ">
        <h2 className="text-lg font-semibold mb-4">Related Movies</h2>
        <div className="space-y-4">
          {relatedvideos?.map((item) => (
            <div
              key={item._id}
              className="lg:w-90 bg-gray-800 p-3 rounded-lg cursor-pointer"
            >
              {/* Thumbnail Wrapper */}
              <div className="relative w-full h-32 mb-2 rounded overflow-hidden bg-gray-700 group">
                <img
                  src={
                    item.image ||
                    "https://via.placeholder.com/300x180?text=No+Image"
                  }
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <button
                    onClick={() =>
                      navigate(
                        `/getsinglevideo/${encodeURIComponent(btoa(item._id))}`
                      )
                    }
                    className="p-2 rounded-full bg-white/20 hover:bg-white/40"
                  >
                    <Play className="w-8 h-8 text-white" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-medium text-white truncate">
                {item.title}
              </h3>

              {/* Year + Genre */}
              <p className="text-xs text-gray-400">
                {item.year} • {item.genres?.[0]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SingleVideoWatch;
