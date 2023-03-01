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

//Integrating Mongoose with RESTAPI cfDB is the name od Database with movies and users
mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('common', {stream: accessLogStream}));
app.use(express.static('public'));

// GET requests
app.get('/', (req, res) => {
res.send('Welcome to my movie API!');
});

app.post('/users', (req, res) => {
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
app.get('/users', (req, res) => {
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
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


  // Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});  


// DELETE a movie to a user's list of favorites
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


// Delete a user by username
app.delete('/users/:Username', (req, res) => {
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
app.get('/movies', (req, res) => {
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
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a Movie by Genre
app.get('/movies/genre/:genreName', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.genreName })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a Movie by Director
app.get('/movies/directors/:directorName', (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
}); 
  
  
app.get('/documentation', (req, res) => {                  
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

// const express = require("express"),
//    mongoose = require("mongoose"),
//    Models = require("./models.js"),
//    Movies = Models.Movie,
//    Users = Models.User,
//    app = express(),
//    bodyParser = require("body-parser"),
//    uuid = require("uuid"),
//    morgan = require("morgan"),
//    fs = require("fs"),
//    path = require("path");

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// mongoose.connect("mongodb://localhost:27017/cfDB", {
//    useNewUrlParser: true,
//    useUnifiedTopology: true
// });

// //user list
// let users = [
//     {
//         id: 1,
//         name: "Kim",
//         favoriteMovies: ["The Shawshank Redemption"]
//     },
//     {
//         id: 2, 
//         name:"Joe",
//         favoriteMovies: ["Forrest Gump"]
//     },

// ]

// //movie list
// let movies = [
//     {
//         "Title":"The Shawshank Redemption",
//         "Description":"Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
//         "Release":"1994",
//         "Genre":"Drama",
//         "Director":{
//             "Name": "Frank Darabont",
//             "Bio": "Something cool",
//             "Birth year": "1965"
//         },
//         "ImageURL":"https://www.imdb.com/title/tt0111161/mediaviewer/rm10105600/?ref_=tt_ov_i",
//     },
//     {
//         "Title":"The Lord of the Rings: The Return of the King",
//         "Description":"Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
//         "Release":"2003",
//         "Genre":"Action, Adventure, Fantasy, Drama",
//         "Director": {
//             "Name": "Peter Jackson",
//             "Bio": "Something cool",
//             "Birth year": "1965"
//         }, 
//         "ImageURL":"https://www.imdb.com/title/tt0167260/mediaviewer/rm584928512/?ref_=tt_ov_i",
//     },
//     {
//         "Title":"Forrest Gump",
//         "Description":"The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.",
//         "Release":"1994",
//         "Genre":"Romance, Drama",
//         "Director": {
//             "Name": "Robert Zemeckis",
//             "Bio": "Something cool",
//             "Birth year": "1965"
//         }, 
//         "ImageURL":"https://www.imdb.com/title/tt0109830/mediaviewer/rm1954748672/?ref_=tt_ov_i",

//     },
//     {
//         "Title":"Se7en",
//         "Description":"Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.",
//         "Release":"1995",
//         "Genre":"Crime, Mystery, Thriller, Drama",
//         "Director": {
//             "Name": "David Fincher",
//             "Bio": "Something cool",
//             "Birth year": "1965"
//         }, 
//         "ImageURL":"https://www.imdb.com/title/tt0114369/mediaviewer/rm3116368640/?ref_=tt_ov_i",

//     },
//     {
//         "Title":"Gladiator",
//         "Description":"A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
//         "Release":"2000",
//         "Genre":"Action, Adventure, Drama",
//         "Director": {
//             "Name": "Ridley Scott",
//             "Bio": "Something cool",
//             "Birth year": "1965"
//         }, 
//         "ImageURL":"https://www.imdb.com/title/tt0172495/mediaviewer/rm2442542592/?ref_=tt_ov_i",

//     }

// ];

// //Add a user
// app.post('/users', (req, res) => {
//     const newUser = req.body;
//     // We can only use the above code because of bodyParser
//     if (newUser.name) {
//       // newUser is an object so we can assign is a property (code below)
//       newUser.id = uuid.v4();
//       users.push(newUser);
//       res.status(201).json(newUser)
//       // 201 = something (user) was created.
//     } else {
//       res.status(400).send('User needs name')
//       // Bad request error ^
//     }
//   })

// //update user information
// app.put('/users/:id', (req, res) => {
//     const { id } = req.params;
//     const updatedUser = req.body;

//     let user = users.find( user => user.id == id );

//     if (user) {
//         user.name = updatedUser.name;
//         res.status(200).json(user);
//     } else {
//         res.status(400).send('no such user')
//     }  
// })

// // create new movies to user
// app.post('/users/:id/:movieTitle', (req, res) => {
//     const { id, movieTitle } = req.params;

//     let user = users.find( user => user.id == id );

//     if (user) {
//         user.favoriteMovies.push(movieTitle);
//         res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);;
//     } else {
//         res.status(400).send('no such user')
//     }  
// })


// // delete movie from user
// app.delete('/users/:id/:movieTitle', (req, res) => {
//     const { id, movieTitle } = req.params;

//     let user = users.find( user => user.id == id );

//     if (user) {
//         user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle );
//         res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);;
//     } else {
//         res.status(400).send('no such user')
//     }  
// })

// // delete user from registry
// app.delete('/users/:id', (req, res) => {
//     const { id } = req.params;

//     let user = users.find( user => user.id == id );

//     if (user) {
//         users = users.filter( user => user.id != id );
//         res.status(200).send(` user ${id} has been deleted`);
//     } else {
//         res.status(400).send('no such user')
//     }  
// })


// //READ (GET all movies)
// app.get('/movies', (req, res) => {
//     res.status(200).json(movies);
// })

// //READ (GET a movie by title)
// app.get('/movies/:title', (req, res) => {
//     const { title } = req.params;
//     const movie = movies.find(movie => movie.Title === title );

//     if (movie) {
//         res.status(200).json(movie); 
//     } else {
//         res.status(400).send('no such movie')
//     }
// })

// //READ (GET genre by name)
// app.get('/movies/genre/:genreName', (req, res) => {
//     const { genreName } = req.params;
//     const genre = movies.find(movie => movie.Genre === genreName ).Genre;

//     if (genre) {
//         res.status(200).json(genre); 
//     } else {
//         res.status(400).send('no such genre')
//     }
// })

// //READ (GET a movie dy director)
// app.get('/movies/directors/:directorName', (req, res) => {
//     const { directorName } = req.params;
//     const director = movies.find(movie => movie.Director.Name === directorName ).Director;

//     if (director) {
//         res.status(200).json(director); 
//     } else {
//         res.status(400).send('no such director')
//     }
// })

// app.use(express.static('public'));
// //Morgan middleware library to log all requests 
// app.use(morgan('common'));

// //Get Requests'
// app.get('/', (req, res) => { 
//     console.log('Welcome to myFlix');
//     res.send('Welcome to myFlix');
// });

// //get Top ten movies
// app.get('/movies', (req, res) => {                  
//     console.log('Top movies request');
//     res.json(topMovies);
//   });

//   // Morgan middleware error
//   app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Error');
//   });

 
// // listen for requests port 8080
// app.listen(8080, () => {
// console.log('Your app is listening on port 8080.');
// });