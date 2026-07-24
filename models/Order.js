const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    address: { type: String, required: true },
    date: { type: Date, default: Date.now },
    paymentType: { type: String, required: true },
    price: { type: Number, required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    shopName: { type: String, default: "Наш Магазин" },
    status: { type: String, default: 'pending' },
    totalPrice: { type: Number, required: true }
});

module.exports = mongoose.model('Order', orderSchema);