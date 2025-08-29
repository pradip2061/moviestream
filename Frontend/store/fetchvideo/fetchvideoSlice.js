import { createSlice } from "@reduxjs/toolkit";
import { getvideoThunk } from "./fetchvideoThunk";

const getvideo = createSlice({
  name: "getvideo",
  initialState: {
    error: null,
    status: null,
    message: "",
    videos: [],
    trendingvideos: [],
    genres: "All",
    category: "trending",
    hasMore: true,
    limit: 6,
    page: 1,
    totalPages: 1,
    totalMovies: 0,
  },
  reducers: {
    resetVideos: (state) => {
      state.videos = [];
      state.hasMore = true;
      state.page = 1;
      state.totalPages = 1;
      state.totalMovies = 0;
    },
    setCategory: (state, action) => {
      state.category = action.payload.category;
      state.genres = action.payload.genres;
      state.videos = [];
      state.hasMore = true;
      state.page = 1;
      state.totalPages = 1;
      state.totalMovies = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getvideoThunk.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(getvideoThunk.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        console.log(action.payload)
        const {
          videos = [],
          trendingvideos = [],
          currentPage,
          totalPages,
          totalMovies,
        } = action.payload || {};

        state.trendingvideos = trendingvideos;
        state.page = currentPage;
        state.totalPages = totalPages;
        state.totalMovies = totalMovies;

        // 👇 hasMore is based on pages
        state.hasMore = currentPage < totalPages;

        if (state.page === 1) {
          // ✅ First page → replace
          state.videos = videos;
        } else {
          // ✅ Append only new videos (avoid duplicates)
          const existingIds = new Set(state.videos.map((v) => v._id));
          const newVideos = videos.filter((v) => !existingIds.has(v._id));
          state.videos.push(...newVideos);
        }
      })
      .addCase(getvideoThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch videos";
      });
  },
});

export const { resetVideos, setCategory } = getvideo.actions;
export default getvideo.reducer;
