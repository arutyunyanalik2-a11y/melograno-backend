const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /api/orders — СОХРАНЕНИЕ ЗАКАЗА В БАЗУ
router.post('/', async (req, res) => {
    try {
        console.log("--> Пришел новый заказ от клиента:", req.body);
        
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        
        console.log("--> Заказ успешно записан в MongoDB с ID:", savedOrder._id);
        res.status(201).json(savedOrder);
    } catch (err) {
        console.error("❌ Ошибка сохранения в БД:", err);
        res.status(500).json({ message: "Ошибка сохранения заказа", error: err.message });
    }
});

// GET /api/orders — ПОЛУЧЕНИЕ ВСЕХ ЗАКАЗОВ ДЛЯ АДМИНКИ
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        console.log(`--> Запрошены заказы для админки. Найдено в БД: ${orders.length}`);
        res.json(orders);
    } catch (err) {
        console.error("❌ Ошибка получения из БД:", err);
        res.status(500).json({ message: "Ошибка получения заказов", error: err.message });
    }
});

// DELETE /api/orders/:id — УДАЛЕНИЕ ЗАКАЗА
router.delete('/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Заказ успешно удален" });
    } catch (err) {
        res.status(500).json({ message: "Ошибка удаления", error: err.message });
    }
});

module.exports = router;