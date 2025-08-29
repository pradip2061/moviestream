// routes/videoRoutes.js
const express = require("express");
const search = require("../controller/searchController");

const searchRouter = express.Router();

// Search videos
searchRouter.get("/search",search );

module.exports = searchRouter;
