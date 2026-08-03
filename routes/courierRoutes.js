const express = require('express');
const router = express.Router();
const Courier = require('../models/Courier');
const Order = require('../models/Order');

// ==========================================
// 1. РАБОТА С КУРЬЕРАМИ
// ==========================================

// GET /api/couriers — Получить всех курьеров
router.get('/couriers', async (req, res) => {
    try {
        const couriers = await Courier.find();
        res.json(couriers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/couriers/login — Логин курьера
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

// GET /api/couriers/:id/orders — Заказы конкретного курьера
router.get('/couriers/:id/orders', async (req, res) => {
    try {
        const courierId = req.params.id;
        const orders = await Order.find({ assignedCourierId: courierId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 2. РАБОТА С ЗАКАЗАМИ КУРЬЕРОВ (ДЛЯ АДМИНКИ)
// ==========================================

// GET /api/courier-orders — Все заказы курьеров для админки
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

// DELETE /api/courier-orders/:id — Удалить заказ курьера
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