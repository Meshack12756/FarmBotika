// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, unique: true },
    nationalId: { type: String, required: true },
    county: { type: String, required: true },
    pin: { type: String, required: true }, // Plain text (not recommended for production)
    registered: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
