const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/fullStackApp', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the User model
const User = mongoose.model('User', {
    googleId: String,
    displayName: String,
    photos: [{
      data: String,
      contentType: String,
      name: String, 
    }],
});

// Passport setup
passport.use(new GoogleStrategy({
    clientID: '1060550103437-5090vgarge892n1cji57m4v3e916krsb.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if the user already exists
    const user = await User.findOne({ googleId: profile.id }).exec();

    if (!user) {
      // Create a new user if not found
      const newUser = new User({
        googleId: profile.id,
        displayName: profile.displayName,
      });

      await newUser.save();
      done(null, newUser);
    } else {
      // Return the existing user
      done(null, user);
    }
  } catch (err) {
    done(err);
  }
}));

// Passport serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Multer setup for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    // Redirect authenticated users to the home page
    res.redirect('/home');
  } else {
    // Serve the login page for non-authenticated users
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

app.get('/auth/google',
  (req, res, next) => {
    // Log the request for debugging
    console.log(req);
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Check if the user is authenticated
    if (req.isAuthenticated()) {
      // Log user details to the console
      console.log('User logged in:', req.user);
      // Redirect authenticated users to the home page
      res.redirect('/home');
    } else {
      // Redirect non-authenticated users to the login page
      res.redirect('/');
    }
  }
);

app.get('/logout', isAuthenticated, (req, res) => {
    // Logout and redirect to the login page
    req.logout((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.redirect('/');
      }
      res.redirect('/');
    });
  });

app.get('/home', isAuthenticated, (req, res) => {
    const homePath = path.join(__dirname, 'public', 'home.html');
    const displayName = req.user ? req.user.displayName : 'User'; // Default to 'User' if not authenticated

    fs.readFile(homePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        // Replace the placeholder with the user's display name
        const modifiedHTML = data.replace('<%= user.displayName %>', displayName);

        // Send the modified HTML to the client
        res.send(modifiedHTML);
    });
});

app.get('/gallery', isAuthenticated, async (req, res) => {
  try {
    // Fetch all images for the authenticated user
    const user = await User.findById(req.user.id).exec();
    const images = user.photos;

    // Render the gallery page with the images
    res.render('gallery', { images });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/upload', isAuthenticated, (req, res) => {
  // Serve the upload page for authenticated users
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Modify the image upload logic
app.post('/upload', isAuthenticated, upload.single('image'), async (req, res) => {
    const editedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 300, height: 300 })
      .webp()
      .toBuffer();
  
    // Capture the original filename from the uploaded file
    const originalFilename = req.file.originalname;
  
    // Generate a unique image name based on date and time, and the original filename
    const imageName = `${originalFilename.replace(/\.[^/.]+$/, '')}_${Date.now()}.webp`;
  
    // Save the edited image in the user's photos array with the new image name
    const editedImage = {
      data: editedImageBuffer.toString('base64'),
      contentType: 'image/webp',
      name: imageName,
    };
  
    // Add the edited image to the user's photos and save
    req.user.photos.push(editedImage);
    await req.user.save();
  
    // Redirect to the home page after upload
    res.redirect('/home');
  });
  
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
