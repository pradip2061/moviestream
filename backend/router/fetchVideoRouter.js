const express = require('express');
const { fetchVideo } = require('../controller/fetchVideoController');
const getsinglevideo = require('../controller/getsingleVideoController');

const fetchRouter = express.Router();

// List of videos
fetchRouter.get('/fetchvideo', fetchVideo);

// Single video: GET (stream) & HEAD (check existence)
fetchRouter.route('/getsinglevideo/:id')
  .get(getsinglevideo)
  .head(getsinglevideo);

module.exports = fetchRouter;
