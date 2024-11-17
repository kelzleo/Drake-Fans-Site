const express = require('express');
const mongoose = require('mongoose');
const Article = require('./models/adb');
const discographyRoutes = require('./routes/discography');
const methodOverride = require('method-override');
const updatesRoutes = require('./routes/updates');

const app = express();

mongoose.connect('mongodb://localhost/new-Blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

app.listen(3000, () => {
    console.log('Listening on port 3000');
});

// Main route for discography page
app.get('/discography', async (req, res) => {
    try {
        const discographyPosts = await Article.find({ category: 'Discography' }).sort({ createdAt: 'desc' });
        res.render('discography/discography', { title: 'Discography', posts: discographyPosts });
    } catch (error) {
        console.error('Error fetching discography posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/updates', async (req, res) => {
    try {
        // Fetch posts with category "Updates"
        const updatesPosts = await Article.find({ category: 'Updates' }).sort({ createdAt: 'desc' });
        res.render('updates/updates', { title: 'Updates', posts: updatesPosts });
    } catch (error) {
        console.error('Error fetching updates posts:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/category/:category', async (req, res) => {
    try {
        const posts = await Article.find({ category: req.params.category }).sort({ createdAt: 'desc' });
        res.render('category', { title: req.params.category, posts: posts });
    } catch (error) {
        console.error('Error fetching category posts:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Use the discography routes
app.use('/discography', discographyRoutes);
app.use('/updates', updatesRoutes)
