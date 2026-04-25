const express = require('express');
const router = express.Router();
const axios = require('axios');
const Animal = require('../models/Animal');

// Helper to fetch single image from Pexels and save to DB
async function getAndSaveAnimalImage(animal) {
    if (animal.image) return animal.image;
    
    try {
        const query = encodeURIComponent(`${animal.name} animal wildlife`);
        const response = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });
        if (response.data.photos && response.data.photos.length > 0) {
            const url = response.data.photos[0].src.medium;
            animal.image = url;
            await animal.save();
            return url;
        }
    } catch (err) {
        console.error(`Pexels API error for image ${animal.name}:`, err.message);
    }
    return null; // fallback handled by frontend
}

// Helper to fetch 3 images for gallery and save to DB
async function getAndSaveAnimalGallery(animal) {
    if (animal.gallery && animal.gallery.length > 0) return animal.gallery;
    
    try {
        const query = encodeURIComponent(`${animal.name} animal wildlife`);
        const response = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=3`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });
        if (response.data.photos && response.data.photos.length > 0) {
            const urls = response.data.photos.map(p => p.src.large);
            animal.gallery = urls;
            await animal.save();
            return urls;
        }
    } catch (err) {
        console.error(`Pexels API gallery error for ${animal.name}:`, err.message);
    }
    return []; // fallback handled by frontend
}

// @route   GET /api/animals
router.get('/', async (req, res) => {
    try {
        const animals = await Animal.find();
        
        // Fetch images if missing
        const animalsWithImages = await Promise.all(animals.map(async (animal) => {
            const image = await getAndSaveAnimalImage(animal);
            return {
                ...animal.toObject(),
                image
            };
        }));

        res.json(animalsWithImages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/animals/:name
router.get('/:name', async (req, res) => {
    try {
        const animal = await Animal.findOne({ name: new RegExp('^' + req.params.name + '$', 'i') });
        if (!animal) {
            return res.status(404).json({ message: 'Animal not found' });
        }

        const gallery = await getAndSaveAnimalGallery(animal);
        const image = await getAndSaveAnimalImage(animal); // ensure main image is also there

        res.json({
            ...animal.toObject(),
            image,
            gallery
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
