// models/Movie.js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: String,
    year: Number,
    plot: String,
    genres: [String],
    runtime: Number,
    cast: [String],
    lastupdated: String
}, { collection: 'movies' }); // usar la colección existente

module.exports = mongoose.model('Movie', movieSchema);
