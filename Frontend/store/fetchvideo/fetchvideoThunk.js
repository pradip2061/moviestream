// src/store/getvideo/getvideoThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getvideoThunk = createAsyncThunk(
  "getvideo/getvideoThunk",
  async ({ page, limit }, { getState, rejectWithValue }) => {
    try {
      // ✅ Get category and genres from redux
      const state = getState();
      const category = state.getvideo?.category;
      const genres = state.getvideo?.genres;

      // ✅ Call backend with pagination
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/fetchvideo`,
        {
          params: { 
            category, 
            genres, 
            page, 
            limit 
          },
        }
      );

      if (response.status === 200) {
        return {
          category: response.data.category,
          genres: response.data.genres,
          videos: response.data.movies, // paginated movies
          trendingvideos: response.data.trendingmovies,
          totalPages: response.data.totalPages, // backend should return total pages
          currentPage: response.data.currentPage,
          totalMovies:response.data.totalMovies
        };
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch videos"
      );
    }
  }
);
