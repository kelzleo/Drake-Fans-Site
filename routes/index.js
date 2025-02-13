// routes/index.js
const express = require('express');
const router = express.Router();
const Article = require('../models/adb');

router.get('/', async (req, res) => {
  try {
    // Retrieve the latest posts for each category (limit to 3, for example)
    const discographyPosts = await Article.find({ category: 'Discography' })
      .sort({ createdAt: -1 })
      .limit(4);
    const updatesPosts = await Article.find({ category: 'Updates' })
      .sort({ createdAt: -1 })
      .limit(4);
    const recordsPosts = await Article.find({ category: 'Records' })
      .sort({ createdAt: -1 })
      .limit(4);

    res.render('index', { 
      title: 'Home Page', 
      discographyPosts,
      updatesPosts,
      recordsPosts,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.render('index', { 
      title: 'Home Page', 
      discographyPosts: [],
      updatesPosts: [],
      recordsPosts: [],
      user: req.user 
    });
  }
});

module.exports = router;
