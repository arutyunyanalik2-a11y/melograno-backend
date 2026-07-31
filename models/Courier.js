const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    routes: [
        {
            code: String,             // Код магазина
            shopName: String,         // Название магазина
            address: String,          // Адрес
            comment: String,          // Номер телефона / комментарий
            discountPercent: {        // Процент скидки (3 или 0)
                type: Number,
                default: 0
            }
        }
    ]
});

module.exports = mongoose.model('Courier', courierSchema);