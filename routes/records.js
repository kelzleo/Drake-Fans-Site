const express = require('express');
const Article = require('../models/adb');
const router = express.Router();
const multer = require('multer');
const storage = require('../config/upload');
const upload = multer({ storage });
const { isAdmin } = require('../config/auth');
const mongoose = require('mongoose');

// Routes
router.get('/', async (req, res) => {
  try {
    const posts = await Article.find({ category: 'Records' }).sort({ createdAt: 'desc' });
    res.render('records/index', { posts, user: req.user });
  } catch (error) {
    console.error('Error fetching records posts:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/new', isAdmin, (req, res) => {
  res.render('records/new', { 
    title: 'New Records/News Post', 
    article: new Article(), 
    user: req.user 
  });
});

router.post('/', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const article = new Article({
      title: req.body.title,
      description: req.body.description,
      markdown: req.body.markdown,
      category: 'Records',
      imagePath: req.file ? req.file.filename : null
    });

    await article.save();
    res.redirect(`/records/${article.slug}`);
  } catch (error) {
    console.error('Error creating records post:', error);
    res.render('records/new', { 
      article: req.body, 
      user: req.user,
      error: 'Error creating post'
    });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).send('Post not found');
    res.render('records/show', { article, user: req.user });
  } catch (error) {
    console.error('Error fetching records post:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/edit/:id', isAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    res.render('records/edit', { article, user: req.user });
  } catch (error) {
    console.error('Error fetching records post:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    article.title = req.body.title;
    article.description = req.body.description;
    article.markdown = req.body.markdown;
    
    if (req.file) {
      // Delete old image if exists
      if (article.imagePath) {
        const gfs = req.app.locals.gfs;
        try {
          const files = await gfs.files.deleteOne({ filename: article.imagePath });
          console.log('Old file deleted:', files);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      article.imagePath = req.file.filename;
    }

    await article.save();
    res.redirect(`/records/${article.slug}`);
  } catch (error) {
    console.error('Error updating records post:', error);
    res.render('records/edit', { 
      article: req.body, 
      user: req.user,
      error: 'Error updating post'
    });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (article.imagePath) {
      const gfs = req.app.locals.gfs;
      await gfs.files.deleteOne({ filename: article.imagePath });
    }
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/records');
  } catch (error) {
    console.error('Error deleting records post:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/image/:filename', async (req, res) => {
  try {
    const gfs = req.app.locals.gfs;
    const file = await gfs.files.findOne({ filename: req.params.filename });
    
    if (!file || file.length === 0) {
      return res.status(404).send('File not found');
    }

    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).send('Error retrieving image');
  }
});

module.exports = router;