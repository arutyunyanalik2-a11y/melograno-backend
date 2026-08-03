const express = require('express');
const Courier = require('../models/Courier');
const Order = require('../models/Order');

const router = express.Router();

// 1. GET /api/couriers — Получение всех курьеров
router.get('/', async (req, res) => {
    try {
        const couriers = await Courier.find();
        res.json(couriers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET /api/courier-orders (или /api/couriers/all-orders) — Все курьерские заказы для админки
// Это исправит ошибку 404, когда фронтенд запрашивает все заказы курьеров!
router.get('/orders/all', async (req, res) => {
    try {
        // Ищем заказы, у которых привязан курьер (по ID или по имени)
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
router.post('/login', async (req, res) => {
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
router.get('/:id/orders', async (req, res) => {
    try {
        const courierId = req.params.id;
        const orders = await Order.find({ assignedCourierId: courierId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. DELETE /api/couriers/orders/:id — Удаление заказа курьера из админки
router.delete('/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Заказ успешно удален' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;