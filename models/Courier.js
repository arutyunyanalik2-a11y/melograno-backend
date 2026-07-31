const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    routes: [{ type: String }]
});

module.exports = mongoose.model('Courier', courierSchema);