const express = require('express');
const Order = require('../models/Order');
const Store = require('../models/Store');
const Courier = require('../models/Courier');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { storeId, items, totalPrice, paymentMethod } = req.body;

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ error: 'Магазин не найден' });
        }

        const courier = await Courier.findOne({
            routes: { $in: [store.address, store.zone] }
        });

        const newOrder = new Order({
            storeId: store._id,
            storeName: store.name,
            address: store.address,
            items,
            totalPrice,
            paymentMethod,
            assignedCourier: courier ? courier.name : 'Не назначен',
            assignedCourierId: courier ? courier._id : null,
            status: 'new'
        });

        await newOrder.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('newOrder', newOrder);
        }

        res.status(201).json({ message: 'Заказ успешно оформлен!', order: newOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;