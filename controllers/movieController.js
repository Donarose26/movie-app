const Movie = require("../models/Movie");
const { errorHandler } = require('../auth');

module.exports.addMovie = (req, res) => {
    const newMovie = new Movie({
        title: req.body.title,
        director: req.body.director,
        year: req.body.year,
        description: req.body.description,
        genre: req.body.genre,
        image: req.file ? `/uploads/${req.file.filename}` : req.body.image // handle file or URL
    });

    Movie.findOne({ title: req.body.title })
        .then(existingMovie => {
            if (existingMovie) return res.status(409).send({ message: 'Movie already exists' });
            return newMovie.save().then(result => res.status(201).send({
                message: 'Movie added successfully',
                movie: result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};
//Get All Movies
module.exports.getAllMovies = (req, res) => {
    return Movie.find({})
    .then(result => {
    
        if(result.length > 0){
            return res.status(200).send({movies: result});
        }
        else{
            return res.status(404).send({ message: 'No movies found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};

//Get specific movies
module.exports.getMovie = (req, res) => {
    Movie.findById(req.params.id)
    .then(movie => {
        if(movie) {
            return res.status(200).send(movie);
        } else {
            return res.status(404).send({ message: 'Movie not found'});
        }
    })
    .catch(error => errorHandler(error, req, res)); 
};

// Update movie
module.exports.updateMovie = (req, res) => {
    const updatedMovie = {
        title: req.body.title,
        director: req.body.director,
        year: req.body.year,
        description: req.body.description,
        genre: req.body.genre,
        image: req.file ? `/uploads/${req.file.filename}` : req.body.image // update image if new file uploaded
    };

    Movie.findByIdAndUpdate(req.params.id, updatedMovie, { new: true })
        .then(movie => {
            if (!movie) return res.status(404).send({ message: 'Movie not found' });
            res.status(200).send({
                message: 'Movie updated successfully',
                updatedMovie: movie
            });
        })
        .catch(err => errorHandler(err, req, res));
};


// Delete movie 
module.exports.deleteMovie = (req, res) => {
    return Movie.deleteOne({ _id: req.params.id })
    .then(deletedResult => {
        if (deletedResult < 1) {
            return res.status(404).send({ error: 'No Movie deleted' });
        }
        return res.status(200).send({ 
            message: 'Movie deleted successfully'
        });
    })
    .catch(error => errorHandler(error, req, res));   
};

module.exports.addComment = (req, res) => {
    Movie.findById(req.params.id)
    .then(movie => {
        if (movie) {
            const newComment = {
                userId: req.user.id,
                comment: req.body.comment || ""
            };

            movie.comments.push(newComment);

            return movie.save()
            .then(updatedMovie => {
                return res.status(200).json({
                    message: 'Comment added successfully',
                    updatedMovie: updatedMovie
                });
            });
        } else {
            return res.status(404).json({ message: 'Movie not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};


module.exports.getComments = (req, res) => {
    Movie.findById(req.params.id)
    .then(movie => {
        if (movie) {
            return res.status(200).json({comments: movie.comments || []});
        } else {
            return res.status(404).json({ message: 'Movie not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};
