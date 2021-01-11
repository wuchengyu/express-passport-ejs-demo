const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

const User = require('../db/user');

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function (err, user) {
    cb(err, user);
  });
});

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async function(email, password, cb) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        /* register */
        const newUser = new User({ email, password });
        await newUser
          .save()
          .then((user) => {
            return cb(null, user);
          })
          .catch((err) => {
            return cb(null, false, { message: err });
          })
      } else {
        if (user.password === password) {
          return cb(null, user);
        } else {
          return cb(null, false, { message: 'Wrong password!' });
        }
      }
    } catch (error) {
      return cb(null, false, { message: error });
    }
  }
));

module.exports = passport;
