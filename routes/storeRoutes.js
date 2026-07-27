const express = require('express');
const Store = require('../models/Store');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, address, zone } = req.body;
        const existingStore = await Store.findOne({ email });
        if (existingStore) {
            return res.status(400).json({ error: 'Магазин с таким email уже зарегистрирован' });
        }

        const newStore = new Store({ name, email, password, address, zone });
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
                zone: store.zone
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;