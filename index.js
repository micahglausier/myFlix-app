const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

app.use(bodyParser.json());


//user list
let users = [
    {
        id: 1,
        name: "Kim",
        favoriteMovies: ["The Shawshank Redemption"]
    },
    {
        id: 2, 
        name:"Joe",
        favoriteMovies: ["Forrest Gump"]
    },

]

//movie list
let movies = [
    {
        "Title":"The Shawshank Redemption",
        "Description":"Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
        "Release":"1994",
        "Genre":"Drama",
        "Director":{
            "Name": "Frank Darabont",
            "Bio": "Something cool",
            "Birth year": "1965"
        },
        "ImageURL":"https://www.imdb.com/title/tt0111161/mediaviewer/rm10105600/?ref_=tt_ov_i",
    },
    {
        "Title":"The Lord of the Rings: The Return of the King",
        "Description":"Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
        "Release":"2003",
        "Genre":"Action, Adventure, Fantasy, Drama",
        "Director": {
            "Name": "Peter Jackson",
            "Bio": "Something cool",
            "Birth year": "1965"
        }, 
        "ImageURL":"https://www.imdb.com/title/tt0167260/mediaviewer/rm584928512/?ref_=tt_ov_i",
    },
    {
        "Title":"Forrest Gump",
        "Description":"The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.",
        "Release":"1994",
        "Genre":"Romance, Drama",
        "Director": {
            "Name": "Robert Zemeckis",
            "Bio": "Something cool",
            "Birth year": "1965"
        }, 
        "ImageURL":"https://www.imdb.com/title/tt0109830/mediaviewer/rm1954748672/?ref_=tt_ov_i",

    },
    {
        "Title":"Se7en",
        "Description":"Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.",
        "Release":"1995",
        "Genre":"Crime, Mystery, Thriller, Drama",
        "Director": {
            "Name": "David Fincher",
            "Bio": "Something cool",
            "Birth year": "1965"
        }, 
        "ImageURL":"https://www.imdb.com/title/tt0114369/mediaviewer/rm3116368640/?ref_=tt_ov_i",

    },
    {
        "Title":"Gladiator",
        "Description":"A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
        "Release":"2000",
        "Genre":"Action, Adventure, Drama",
        "Director": {
            "Name": "Ridley Scott",
            "Bio": "Something cool",
            "Birth year": "1965"
        }, 
        "ImageURL":"https://www.imdb.com/title/tt0172495/mediaviewer/rm2442542592/?ref_=tt_ov_i",

    }

];

//create New Users
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('users need name')
    }
})

//update user information
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user')
    }

   
})

// create new movies to user
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);;
    } else {
        res.status(400).send('no such user')
    }  
})


// delete movie from user
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle );
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);;
    } else {
        res.status(400).send('no such user')
    }  
})

// delete user from registry
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id );
        res.status(200).send(` user ${id} has been deleted`);
    } else {
        res.status(400).send('no such user')
    }  
})


//READ (GET all movies)
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
})

//READ (GET a movie by title)
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.Title === title );

    if (movie) {
        res.status(200).json(movie); 
    } else {
        res.status(400).send('no such movie')
    }
})

//READ (GET genre by name)
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.Genre === genreName ).Genre;

    if (genre) {
        res.status(200).json(genre); 
    } else {
        res.status(400).send('no such genre')
    }
})

//READ (GET a movie dy director)
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName ).Director;

    if (director) {
        res.status(200).json(director); 
    } else {
        res.status(400).send('no such director')
    }
})



 
//Listen for requests
app.listen(8080, () => console.log("listening on 8080"))