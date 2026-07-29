const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    productName: String,
    productId: String,
    shopName: String, // Название магазина
    
    // 👇 ДОБАВЛЕНЫ ПОЛЯ ДЛЯ СКИДКИ 👇
    originalPrice: Number, // Старая цена (без скидки)
    discountPercent: { type: Number, default: 0 }, // Процент скидки (например, 10)
    
    price: Number, // Текущая цена за 1 шт. (уже со скидкой, если она есть)
    quantity: Number,
    totalPrice: Number, // Итоговая сумма (цена * количество)
    
    address: String,
    paymentType: String,
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now },
    
    // ПОЛЯ ДЛЯ КУРЬЕРОВ
    assignedCourierId: { type: String, default: null },
    assignedCourier: { type: String, default: null },
    
    // Массив товаров (если используется)
    items: Array 
});

module.exports = mongoose.model('Order', OrderSchema);