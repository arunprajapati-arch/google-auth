const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

app.set('view engine', 'ejs');

// Set up session management
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


// Set up Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: '',
  clientSecret: '',
  callbackURL: 'http://localhost:3000/auth/google/callback'
}, (accessToken, refreshToken, profile, cb) => {
  // Store user data in session
  const user = {
    username: profile.name.givenName,
    email: profile.emails[0].value
  };
  cb(null, user);
}));

// Authenticate with Google
app.get('/auth/google', passport.authenticate('google', {
  scope: ['email', 'profile']
}));

// Google OAuth callback
app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/protected');
});

// Login page
app.get('/login', (req, res) => {
  res.render('login',{ req: req });
});

// Protected route
app.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Welcome, ${req.user.name}!`);
});

// Logout

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login'); // Redirect to login page after logout
  });
});



passport.serializeUser((user, done) => {
  done(null, { username: user.name, email: user.email });
});

passport.deserializeUser((email, done) => {
  done(null, email); // Return the email as the user object
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


app.listen(3000, () => {
  console.log('Server listening on port 3000');
});