const mongoose = require('mongoose');

const AnimalSchema = new mongoose.Schema({
    name: String,
    scientificName: String,
    description: String,
    category: String,
    status: String,
    habitat: String,
    diet: String,
    lifespan: String,
    speed: String,
    size: String,
    funFacts: [String],
    image: String,
    gallery: [String]
});

module.exports = mongoose.model('Animal', AnimalSchema);
