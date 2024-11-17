const express = require('express');
const Article = require('../models/adb');
const router = express.Router();
const multer = require('multer');

// Set up multer for file upload
const upload = multer({ dest: 'public/uploads/' });

// Route to create a new updates post
router.get('/new', (req, res) => {
    res.render('discography/new', { title: 'New Discography/News Post', article: new Article() });
});

// Route to edit an updates post
router.get('/edit/:id', async (req, res) => {
    const article = await Article.findById(req.params.id);
    res.render('discography/edit', { title: 'Edit Discography Post', article: article });
});

// Route to display a specific updates post
router.get('/:slug', async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug, category: 'Discography' });
    if (!article) return res.status(404).send('Post not found');
    res.render('discography/show', { title: 'Show Discography Post', article: article });
});

// Route to handle creating a new updates post
router.post('/', upload.single('image'), async (req, res, next) => {
    req.article = new Article();
    req.article.category = 'Discography';  // Automatically assign category as 'Discography'
    if (req.file) req.article.imagePath = `/uploads/${req.file.filename}`;
    next();
}, saveArticleAndRedirect('new'));

// Route to update an existing updates post
router.put('/:id', async (req, res, next) => {
    req.article = await Article.findById(req.params.id);
    next();
}, saveArticleAndRedirect('edit'));

// Route to delete an updates post
router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/discography');
});

// Helper function to save article and redirect
function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article;
        article.title = req.body.title;
        article.description = req.body.description;
        article.markdown = req.body.markdown;
        article.category = req.body.category || 'Discography'; // Ensure category is set to 'DIscography'

        try {
            article = await article.save();
            res.redirect(`/discography/${article.slug}`);
        } catch (e) {
            res.render(`discography/${path}`, { article: article });
        }
    };
}

// Route to display all updates posts (ensure only updates posts are retrieved)
router.get('/', async (req, res) => {
    const posts = await Article.find({ category: 'Discography' });  // Fetch all updates posts
    res.render('discography/index', { title: 'Updates Posts', posts: posts });
});

module.exports = router;
