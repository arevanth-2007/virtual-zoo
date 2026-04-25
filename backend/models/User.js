const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    favorites: [{
        type: String // store animal names
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
