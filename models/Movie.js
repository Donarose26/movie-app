const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is Required']
    },
    director: {
        type: String,
        required: [true, 'Movie Director is Required']
    },
    year: {
        type: Number,
        required: [true, 'Movie Year is Required']
    },
    description: {
        type: String,
        required: [true, 'Movie Description is Required']
    },
    genre: {
        type: String,
        required: [true, 'Movie Genre is Required']
    },
    images: {
        type: [String],
    },
    comments: [
        {
            userId: { 
                type: mongoose.Schema.Types.ObjectId, 
                required: true
            },
            comment: { 
                type: String
            }
        }
    ]
});

module.exports = mongoose.model('Movie', movieSchema);
