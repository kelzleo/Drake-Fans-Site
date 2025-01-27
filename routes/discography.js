const express = require('express');
const Article = require('../models/adb');
const router = express.Router();
const multer = require('multer');
const User = require('../models/users')
const { isAdmin, isAuthenticated } = require('../config/auth');

// Set up multer for file upload
const upload = multer({ dest: 'public/uploads/' });

// Public routes
router.get('/', async (req, res) => {
  try {
    const posts = await Article.find({ category: 'Discography' });
    res.render('discography/index', { posts, user: req.user });
  } catch (error) {
    console.error('Error fetching discography posts:', error);
    res.status(500).send('Internal Server Error');
  }
});



// Admin routes
router.get('/new', isAdmin, (req, res) => {
  res.render('discography/new', { title: 'New Discography/News Post', article: new Article(), user: req.user });
});

router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, category: 'Discography' });
    if (!article) return res.status(404).send('Post not found');
    res.render('discography/show', { title: 'Show Discography Post', article, user: req.user });
  } catch (error) {
    console.error('Error fetching discography post:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/', isAdmin, upload.single('image'), async (req, res, next) => {
  req.article = new Article();
  req.article.category = 'Discography';
  if (req.file) req.article.imagePath = `/uploads/${req.file.filename}`;
  next();
}, saveArticleAndRedirect('new'));

router.get('/edit/:id', isAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    res.render('discography/edit', { title: 'Edit Discography Post', article, user: req.user });
  } catch (error) {
    console.error('Error fetching discography post:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/:id', isAdmin, upload.single('image'), async (req, res, next) => {
  req.article = await Article.findById(req.params.id);
  if (req.file) req.article.imagePath = `/uploads/${req.file.filename}`;
  next();
}, saveArticleAndRedirect('edit'));

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/discography');
  } catch (error) {
    console.error('Error deleting discography post:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Helper function for saving articles
function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article;
    article.title = req.body.title;
    article.description = req.body.description;
    article.markdown = req.body.markdown;
    try {
      await article.save();
      res.redirect(`/discography/${article.slug}`);
    } catch (e) {
      res.render(`discography/${path}`, { article, user: req.user });
    }
  };
}

module.exports = router;