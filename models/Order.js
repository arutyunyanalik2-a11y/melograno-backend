const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    productName: String,
    productId: String,
    shopName: String, // Название магазина
    
    // ПОЛЯ ДЛЯ СКИДКИ
    originalPrice: Number, // Старая цена (без скидки)
    discountPercent: { type: Number, default: 0 }, // Процент скидки
    
    price: Number, // Текущая цена за 1 шт. (уже со скидкой)
    quantity: Number,
    totalPrice: Number, // Итоговая сумма (цена * количество)
    
    address: String,
    paymentType: String,
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now },
    
    // ПОЛЯ ДЛЯ КУРЬЕРОВ
    assignedCourierId: { type: String, default: null },
    assignedCourier: { type: String, default: null },
    courierName: { type: String, default: null },
    
    // Массив товаров (если используется)
    items: Array 
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);