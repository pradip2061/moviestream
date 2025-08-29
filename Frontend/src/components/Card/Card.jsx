import React from "react";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Card = ({ id,image, title, year, duration, genre, rating }) => {
  const navigate = useNavigate()
    const encodedId = encodeURIComponent(btoa(id));
  return (
    <div className="bg-gray-800 group rounded-2xl overflow-hidden relative  w-42 lg:w-64 shadow-lg" onClick={()=>{navigate(`/getsinglevideo/${encodedId}`)
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    }>
      {/* Movie Image */}
      <img src={image} alt={title} className="w-full h-40 object-cover" />

      {/* Play Button */}
      <div className="absolute hidden group-hover:flex inset-0  bg-black/60 items-center justify-center">
        <div className="bg-white/80 p-3 mb-10 rounded-full hover:scale-110 transition-transform">
          <Play className="text-darkgray" size={24} />
        </div>
      </div>

      {/* Rating Badge */}
      {rating && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
          {rating}
        </div>
      )}

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <div className="flex justify-between text-gray-400 text-sm mt-1">
          <span>{year}</span>
          <span>{duration}</span>
        </div>
        <div className="text-red-400 text-md mt-1">{genre[0]} • {genre[1]}</div>
      </div>
    </div>
  );
};

export default Card;
