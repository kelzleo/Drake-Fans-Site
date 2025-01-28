const express = require('express');
require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Article = require('./models/adb');
const discographyRoutes = require('./routes/discography');
const methodOverride = require('method-override');
const updatesRoutes = require('./routes/updates');
const authRoutes = require('./routes/auth');
const passport = require('./config/passport-setup');
const indexRoutes = require('./routes/index')
const recordRoutes = require('./routes/records')

const session = require('express-session');
const User = require('./models/users')
const flash = require('connect-flash');

const app = express();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Main route for discography page
app.get('/discography', async (req, res) => {
    try {
      const discographyPosts = await Article.find({ category: 'Discography' }).sort({ createdAt: 'desc' });
      res.render('discography/discography', { title: 'Discography', posts: discographyPosts, user: req.user });
    } catch (error) {
      console.error('Error fetching discography posts:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/updates', async (req, res) => {
    try {
        // Fetch posts with category "Updates"
        const updatesPosts = await Article.find({ category: 'Updates' }).sort({ createdAt: 'desc' });
        res.render('updates/updates', { title: 'Updates', posts: updatesPosts, user: req.user });
    } catch (error) {
        console.error('Error fetching updates posts:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/records', async (req, res) => {
    try {
        // Fetch posts with category "Records"
        const recordsPosts = await Article.find({ category: 'Records' }).sort({ createdAt: 'desc' });
        res.render('records/records', { title: 'Records', posts: recordsPosts, user: req.user });
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
app.use('/',  indexRoutes)
app.use('/records', recordRoutes)
app.use(authRoutes)

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});