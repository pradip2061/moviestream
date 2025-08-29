import { Search, User, Settings, Bookmark, Clock, CreditCard, LogOut } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const NavBar = () => {
  const [searchToggle, setSearchToggle] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const dropdownRef = useRef(null);
  const overlayContentRef = useRef(null); // ✅ for overlay content
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close overlay when clicking outside
  useEffect(() => {
    const handleClickOutsideOverlay = (event) => {
      if (
        overlayContentRef.current &&
        !overlayContentRef.current.contains(event.target)
      ) {
        setShowOverlay(false);
        setSearchToggle(false);
      }
    };

    if (showOverlay) {
      document.addEventListener("mousedown", handleClickOutsideOverlay);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideOverlay);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideOverlay);
    };
  }, [showOverlay]);

  // Search fetching
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/search?query=${query}`);
        const data = await res.json();
        setResults(data.videos || []);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchData, 500); // debounce
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="fixed px-6 lg:gap-x-0 w-full h-16 border-b border-gray-600 bg-gray-900 flex justify-between lg:px-20 items-center z-50">
      {/* Logo */}
      <div className="font-cursive text-2xl lg:text-3xl text-white">
        Vid<span className="text-red-500">Stream</span>
      </div>

      {/* Links */}
      {/* <div className="hidden text-gray-300 lg:flex gap-x-8 text-lg">
        {["/", "/movies", "/TvShows", "/genere"].map((path, i) => {
          const names = ["Home", "Movies", "Webseries"];
          return (
            <NavLink
              key={i}
              to={path}
              className={({ isActive }) =>
                `${isActive ? "text-red-500 font-semibold" : "text-gray-300 hover:text-gray-500"} text-lg`
              }
            >
              {names[i]}
            </NavLink>
          );
        })}
      </div> */}

      {/* Actions */}
      <div className="flex gap-x-4 items-center">
        {/* Desktop Search */}
        <div className="hidden lg:flex relative">
          <input
            type="text"
            name="search"
            value={query}
            onFocus={() => setShowOverlay(true)}
            onChange={(e) => setQuery(e.target.value)}
            className="w-[16rem] h-[2rem] bg-gray-700 border-2 border-transparent focus:border-blue-400 outline-none rounded pl-2 text-gray-300"
            placeholder="Search movies, shows.."
          />
          <Search className="absolute right-2 top-1.5 h-5 w-5 text-gray-300" />
        </div>

        {/* Mobile Search Toggle */}
        <Search
          className="flex lg:hidden h-5 w-5 text-white cursor-pointer"
          onClick={() => {
            setSearchToggle(true);
            setShowOverlay(true);
          }}
        />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white focus:outline-none"
          >
            <User className="w-5 h-5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-900 text-gray-200 rounded-xl shadow-lg border border-gray-700 overflow-hidden z-50 transition-all duration-200">
              {/* User Info */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">John Doe</h4>
                  <p className="text-xs text-gray-400">john.doe@email.com</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex flex-col py-2">
                <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 text-sm">
                  <Settings className="w-4 h-4" /> Profile Settings
                </button>
                <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 text-sm">
                  <Bookmark className="w-4 h-4" /> My Watchlist
                </button>
                <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 text-sm">
                  <Clock className="w-4 h-4" /> Viewing History
                </button>
                <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 text-sm">
                  <CreditCard className="w-4 h-4" /> Subscription
                </button>
                <hr className="border-gray-700 my-1" />
                <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 text-sm text-red-400">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🔥 Unified Search Overlay (Mobile + Desktop) */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-start ">
          <div
            ref={overlayContentRef} // ✅ ref added
            className="mt-16 w-full max-w-xl bg-gray-900 rounded-lg shadow-lg max-h-[70vh] overflow-y-auto p-4 lg:ml-[60rem]"
          >
            {/* Input inside overlay for mobile */}
            {searchToggle && (
              <div className="relative mb-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="w-full h-[2.5rem] bg-gray-700 border-2 border-transparent focus:border-blue-400 outline-none rounded pl-2 text-gray-300"
                  placeholder="Search movies, shows.."
                />
                <Search className="absolute right-2 top-2 h-5 w-5 text-gray-300" />
              </div>
            )}

           {loading ? (
        <p className="p-4 text-gray-400">Loading...</p>
      ) : results.length === 0 ? (
        <p className="p-4 text-gray-400">No videos found</p>
      ) : (
        results.map((video) => (
          <div
            key={video._id}
            onClick={() => {
              setShowOverlay(false);
              setSearchToggle(false);
              setQuery("");
              navigate(
                `/getsinglevideo/${encodeURIComponent(btoa(video._id))}`
              );
            }}
            className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer"
          >
            <img
              src={video.image || "https://via.placeholder.com/80x50"}
              alt={video.title}
              className="w-16 h-10 object-cover rounded"
            />
            <span className="text-sm font-medium text-white">{video.title}</span>
          </div>
        ))
      )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
