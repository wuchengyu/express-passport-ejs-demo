const express = require('express');

const expressSession = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(expressSession);
const { ensureLoggedIn } = require('connect-ensure-login');

const passport = require('./util/passport');

const port = process.env.PORT || 8080;
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/';
const dbName = process.env.DB_NAME || 'demo';
const sessionSecret = process.env.SESSION_SECRET || 'mySecret';

mongoose.connect(`${dbURL}${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(console.log('Mongo DB is connected.'))
  .catch(console.log);


const app = express();

/* Set view-engine and template folder */
app.set('view engine', 'ejs');
app.set('views', 'template');

/* Simple logger */
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
})

/* Parse request */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(expressSession({
  secret: sessionSecret,
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));


app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => {
  res.render('home', { user: req.user });
});

app.get('/login', (_req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', { failureRedirect: 'login', successRedirect: '/' }));


app.get('/profile', ensureLoggedIn(), (req, res) => {
  res.render('profile', { user: req.user });
});


app.get('/logout',(req, res) => {
  req.logout();
  res.redirect('/');
});


/* Not found */
app.use((_, res) => res.status(404).send());


/* Start server */
app.listen(port, () => console.log(`Start server \n> http://localhost:${port}`));
