const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    productName: String,
    productId: String,
    price: Number,
    quantity: Number,
    totalPrice: Number,
    shopName: String, // или storeName, в зависимости от твоей схемы
    address: String,
    paymentType: String,
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now },
    
    // 👇 ДОБАВЬ ЭТИ ДВА ПОЛЯ 👇
    assignedCourierId: { type: String, default: null },
    assignedCourier: { type: String, default: null },
    
    // Если у тебя массив товаров, не забудь оставить:
    items: Array 
});

module.exports = mongoose.model('Order', OrderSchema);