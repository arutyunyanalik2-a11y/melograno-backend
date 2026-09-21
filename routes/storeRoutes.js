const express = require('express');
const Store = require('../models/Store');

const router = express.Router();

// 👇 ДОБАВЛЕНО: список всех магазинов (нужен для админки — разделы "Скидки" и "Форма оплаты")
router.get('/', async (req, res) => {
    try {
        const stores = await Store.find().select('-password');
        res.json(stores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👇 ДОБАВЛЕНО: данные одного магазина (пригодится в "меню" и "продуктдетайл",
// чтобы узнать его discountPercent и paymentMethod)
router.get('/:id', async (req, res) => {
    try {
        const store = await Store.findById(req.params.id).select('-password');
        if (!store) {
            return res.status(404).json({ error: 'Магазин не найден' });
        }
        res.json(store);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, address, zone, discountPercent, paymentMethod } = req.body;

        const existingStore = await Store.findOne({ email });
        if (existingStore) {
            return res.status(400).json({ error: 'Магазин с таким email уже зарегистрирован' });
        }

        const newStore = new Store({
            name,
            email,
            password,
            address,
            zone,
            discountPercent: discountPercent || 0,
            paymentMethod: paymentMethod || 'cash' // 👈 ДОБАВЛЕНО
        });

        await newStore.save();
        res.status(201).json({ message: 'Регистрация успешна', store: newStore });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const store = await Store.findOne({ email, password });
        if (!store) {
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }

        res.json({
            token: 'store_token_' + store._id,
            store: {
                _id: store._id,
                name: store.name,
                email: store.email,
                address: store.address,
                zone: store.zone,
                discountPercent: store.discountPercent,
                paymentMethod: store.paymentMethod // 👈 ДОБАВЛЕНО: отдаем способ оплаты при входе
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👇 ДОБАВЛЕНО: обновление скидки и/или способа оплаты магазина (используется в админке)
router.put('/:id', async (req, res) => {
    try {
        const { discountPercent, paymentMethod } = req.body;
        const updateFields = {};

        if (discountPercent !== undefined) {
            const numericValue = Number(discountPercent);
            if (Number.isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
                return res.status(400).json({ error: 'discountPercent должен быть числом от 0 до 100' });
            }
            updateFields.discountPercent = numericValue;
        }

        if (paymentMethod !== undefined) {
            if (!['cash', 'card', 'both'].includes(paymentMethod)) {
                return res.status(400).json({ error: 'paymentMethod должен быть cash, card или both' });
            }
            updateFields.paymentMethod = paymentMethod;
        }

        const updatedStore = await Store.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        ).select('-password');

        if (!updatedStore) {
            return res.status(404).json({ error: 'Магазин не найден' });
        }

        res.json({ message: 'Магазин обновлен', store: updatedStore });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;