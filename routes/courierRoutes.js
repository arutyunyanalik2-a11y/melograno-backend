const express = require('express');
const Courier = require('../models/Courier');
const Order = require('../models/Order');

const router = express.Router();

// 1. GET /api/couriers — Получение всех курьеров
router.get('/couriers', async (req, res) => {
    try {
        const couriers = await Courier.find();
        res.json(couriers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET /api/courier-orders — Все курьерские заказы для админки (исправляет ошибку 404)
router.get('/courier-orders', async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [
                { assignedCourierId: { $exists: true, $ne: null } },
                { courierName: { $exists: true, $ne: "" } }
            ]
        }).sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. POST /api/couriers/login — Авторизация курьера
router.post('/couriers/login', async (req, res) => {
    try {
        const { courierId, password } = req.body;
        const courier = await Courier.findById(courierId);
        if (!courier || courier.password !== password) {
            return res.status(400).json({ error: 'Неверный пароль или курьер не найден' });
        }

        res.json({
            token: 'courier_token_' + courier._id,
            courier: {
                _id: courier._id,
                name: courier.name,
                routes: courier.routes
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. GET /api/couriers/:id/orders — Заказы конкретного курьера
router.get('/couriers/:id/orders', async (req, res) => {
    try {
        const courierId = req.params.id;
        const orders = await Order.find({ assignedCourierId: courierId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. DELETE /api/courier-orders/:id — Удаление заказа курьера из админки
router.delete('/courier-orders/:id', async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        res.json({ message: 'Заказ успешно удален' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;