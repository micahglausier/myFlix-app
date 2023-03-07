const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const uuid = require("uuid");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//Routing of static files
app.use(express.static('public'));

// Logging requests to console
app.use(morgan('common'));
// Additionally, creating log stream in log.txt file (flags: 'a' instructs to append logs to file)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});
app.use(morgan('common', {stream: accessLogStream}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Suppresses deprecation warning
mongoose.set('strictQuery', true);
//Integrating Mongoose with RESTAPI cfDB is the name of Database with movies and users
mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });


//importing auth.js
let auth = require('./auth')(app);

//require and import passport.js
const passport = require('passport');
require('./passport');


// GET requests
app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
res.send('Welcome to my myFlix!');
});

//Create a user
app.post('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//update user information by username
app.put('/users/:username', passport.authenticate('jwt', { session: false }), function (req, res) {
    const currentUsername = req.params.username;
    function updateUser() {
      Users.findOneAndUpdate(
        { Username: currentUsername },
        {
          $set: {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          },
        },
        // This line is to specify that the following callback function will take the updated object as parameter
        { new: true }
      )
        .then(function (updatedUser) {
          res.status(200).json(updatedUser);
        })
        .catch(function (error) {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
    }
  
    if (currentUsername !== req.body.Username) {
      Users.findOne({ Username: req.body.Username }).then(function (user) {
        if (user) {
          return res.status(409).send(req.body.Username + ' already exists.');
        } else {
          updateUser();
        }
      });
    } else {
      updateUser();
    }
  });


  // Add a movie to a user's list of favorites
  app.post('/users/:username/favoriteMovies/:movieid', passport.authenticate('jwt', { session: false }), function (req, res) {
    const username = req.params.username;
    const movieId = req.params.movieid;
    Users.findOne({ Username: username, FavoriteMovies: movieId })
      .then(function (movieIsPresent) {
        if (movieIsPresent) {
          return res.status(409).send('Movie is already on your list.');
        } else {
          Users.findOneAndUpdate(
            { Username: username },
            {
              // Only adds if not already present (but wouldn't throw error)
              $addToSet: { FavoriteMovies: movieId },
            },
            { new: true }
          )
            .then(function (updatedUser) {
              res.status(200).json(updatedUser);
            })
            .catch(function (error) {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch(function (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });


// DELETE a movie to a user's list of favorites
app.delete('/users/:username/favoriteMovies/:movieid', passport.authenticate('jwt', { session: false }), function (req, res) {
    const username = req.params.username;
    const movieId = req.params.movieid;
    Users.findOneAndUpdate(
      { Username: username },
      {
        $pull: { FavoriteMovies: movieId },
      },
      { new: true }
    )
      .then(function (updatedUser) {
        res.status(200).json(updatedUser);
      })
      .catch(function (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });


// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});  


// Get a movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a description of Genre
app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.genreName })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Gets all movies that have a certain genre
app.get('/movies/genres/:genreName/movies', passport.authenticate('jwt', { session: false }), function (req, res) {
    const genreName = req.params.genreName;
    Movies.find({ 'Genre.Name': genreName })
      .select('Title')
      .then(function (movieTitles) {
        if (movieTitles.length === 0) {
          return res.status(404).send('Genre ' + genreName + ' was not found.');
        } else {
          res.status(200).json(movieTitles);
        }
      })
      .catch(function (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// Get data about Director
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
}); 

// Gets all movies by a certain director
app.get('/movies/directors/:directorName/movies', passport.authenticate('jwt', { session: false }), function (req, res) {
    const directorName = req.params.directorName;
    Movies.find({ 'Director.Name': directorName })
      .select('Title')
      .then(function (movieTitles) {
        if (movieTitles.length === 0) {
          return res
            .status(404)
            .send(
              'Director with the name of ' + directorName + ' was not found.'
            );
        } else {
          res.status(200).json(movieTitles);
        }
      })
      .catch(function (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });
  
  
  
app.get('/documentation', passport.authenticate('jwt', { session: false }), (req, res) => {                  
res.sendFile('public/documentation.html', { root: __dirname });
});
  
// Error 
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('There was an error. Please try again later.');
});

// listen for requests
app.listen(8080, () => {
console.log('Your app is listening on port 8080.');
});

