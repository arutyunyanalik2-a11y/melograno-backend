const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    zone: { type: String, required: true },
    discountPercent: { type: Number, default: 0 } // 👈 Добавлено поле для автоматической скидки
});

module.exports = mongoose.model('Store', storeSchema);