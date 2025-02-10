const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/adb');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('./config/passport-setup');
const flash = require('connect-flash');
const Grid = require('gridfs-stream');

const app = express();

// Express Middleware
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

// Initialize gfs globally
let gfs;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => {
  console.log('MongoDB connected');
  
  // Init stream
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection('uploads');
  app.locals.gfs = gfs;

  // Mount routes and start server
  mountRoutesAndStartServer();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

function mountRoutesAndStartServer() {
  // Category routes
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
      const updatesPosts = await Article.find({ category: 'Updates' }).sort({ createdAt: 'desc' });
      res.render('updates/updates', { title: 'Updates', posts: updatesPosts, user: req.user });
    } catch (error) {
      console.error('Error fetching updates posts:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/records', async (req, res) => {
    try {
      const recordsPosts = await Article.find({ category: 'Records' }).sort({ createdAt: 'desc' });
      res.render('records/records', { title: 'Records', posts: recordsPosts, user: req.user });
    } catch (error) {
      console.error('Error fetching records posts:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/category/:category', async (req, res) => {
    try {
      const posts = await Article.find({ category: req.params.category }).sort({ createdAt: 'desc' });
      res.render('category', { title: req.params.category, posts: posts, user: req.user });
    } catch (error) {
      console.error('Error fetching category posts:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // Mount route files
  const discographyRoutes = require('./routes/discography');
  const updatesRoutes = require('./routes/updates');
  const authRoutes = require('./routes/auth');
  const indexRoutes = require('./routes/index');
  const recordRoutes = require('./routes/records');
  const streamingRoutes = require('./routes/streaming')

  app.use('/discography', discographyRoutes);
  app.use('/updates', updatesRoutes);
  app.use('/', indexRoutes);
  app.use('/records', recordRoutes);
  app.use('/streaming', streamingRoutes)
  app.use(authRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}