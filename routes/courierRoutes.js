const express = require('express');
const Courier = require('../models/Courier');
const Order = require('../models/Order');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const couriers = await Courier.find();
        res.json(couriers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

router.get('/:id/orders', async (req, res) => {
    try {
        const courierId = req.params.id;
        const orders = await Order.find({ assignedCourierId: courierId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;