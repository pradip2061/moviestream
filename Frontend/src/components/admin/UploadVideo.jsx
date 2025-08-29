import React, { useState } from "react";
import axios from "axios";

const UploadVideo = () => {
  const [formData, setFormData] = useState({
    title: "",
    rating: "",
    year: "",
    duration: "",
    genres: "",
    description: "",
  });
  const [video, setVideo] = useState(null);
  const [image, setImage] = useState(null);

  // Handle text input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file input
  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("rating", formData.rating);
    data.append("year", formData.year);
    data.append("duration", formData.duration);
    data.append("genres", formData.genres); // "Action,Crime" will become ["Action","Crime"]
    data.append("description", formData.description);
    if (video) data.append("videoUrl", video);
    if (image) data.append("image", image);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Uploaded:", res.data);
      alert("Video uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-gray-800 text-white">
      <input type="text" name="title" placeholder="Title" onChange={handleChange} className="p-2 rounded text-black" />
      <input type="number" name="rating" placeholder="Rating (0-10)" onChange={handleChange} className="p-2 rounded text-black" />
      <input type="number" name="year" placeholder="Year" onChange={handleChange} className="p-2 rounded text-black" />
      <input type="text" name="duration" placeholder="Duration (e.g. 2h 56m)" onChange={handleChange} className="p-2 rounded text-black" />
      <input type="text" name="genres" placeholder="Genres (comma separated)" onChange={handleChange} className="p-2 rounded text-black" />
      <textarea name="description" placeholder="Description" onChange={handleChange} className="p-2 rounded text-black"></textarea>

      <label>Upload Poster (Image)</label>
      <input type="file" accept="image/*" onChange={handleImageChange} />

      <label>Upload Video</label>
      <input type="file" accept="video/*" onChange={handleVideoChange} />

      <button type="submit" className="bg-blue-600 p-2 rounded">Upload</button>
    </form>
  );
};

export default UploadVideo;
