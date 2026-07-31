const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    routes: [
        {
            day: { type: String },     // День недели
            address: { type: String }  // Название магазина / адрес
        }
    ]
});

module.exports = mongoose.model('Courier', courierSchema);