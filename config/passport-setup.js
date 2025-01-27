const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/users');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'usernameOrEmail',
      passwordField: 'password',
    },
    async (usernameOrEmail, password, done) => {
      try {
        const user = await User.findOne({
          $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
        });

        if (!user) {
          return done(null, false, { message: 'Incorrect username or email.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;