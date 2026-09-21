const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    zone: { type: String, required: true },
    discountPercent: { type: Number, default: 0 }, // Скидка магазина в %
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'both'],
        default: 'cash'
    } // 👈 ДОБАВЛЕНО: способ оплаты магазина
});

module.exports = mongoose.model('Store', storeSchema);