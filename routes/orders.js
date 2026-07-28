const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Courier = require('../models/Courier');

// POST /api/orders — СОХРАНЕНИЕ ЗАКАЗА В БАЗУ И АВТО-НАЗНАЧЕНИЕ КУРЬЕРА
router.post('/', async (req, res) => {
    try {
        console.log("--> Пришел новый заказ от клиента:", req.body);
        
        const orderData = { ...req.body };
        const deliveryAddress = orderData.address ? String(orderData.address) : "";

        let assignedCourier = null;

        // Ищем курьера по району только если адрес реально передан
        if (deliveryAddress.trim() !== "") {
            assignedCourier = await Courier.findOne({
                routes: { $elemMatch: { $regex: deliveryAddress, $options: "i" } }
            });
        }

        // Если по району не нашли или адрес пуст — берем первого свободного курьера
        if (!assignedCourier) {
            assignedCourier = await Courier.findOne();
        }

        if (assignedCourier) {
            orderData.assignedCourierId = assignedCourier._id;
            orderData.assignedCourier = assignedCourier.name;
            console.log("--> Заказ назначен курьеру:", assignedCourier.name, "(ID:", assignedCourier._id, ")");
        } else {
            console.log("⚠️ В базе нет зарегистрированных курьеров для назначения.");
        }

        const newOrder = new Order(orderData);
        const savedOrder = await newOrder.save();
        
        console.log("--> Заказ успешно записан в MongoDB с ID:", savedOrder._id);

        const io = req.app.get('io');
        if (io) {
            io.emit("newOrder", savedOrder);
            console.log("--> WebSocket событие 'newOrder' отправлено клиентам!");
        }

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
        console.log("--> Запрошены заказы для админки. Найдено в БД:", orders.length);
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
        console.error("❌ Ошибка удаления заказа:", err);
        res.status(500).json({ message: "Ошибка удаления", error: err.message });
    }
});

// PUT /api/orders/:id — ОБНОВЛЕНИЕ СТАТУСА ЗАКАЗА
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            id, 
            { status: status }, 
            { new: true } 
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Заказ не найден" });
        }

        console.log("--> Заказ успешно обновлен. ID:", id, "Статус:", status);
        res.json(updatedOrder);
    } catch (err) {
        console.error("❌ Ошибка при обновлении заказа:", err);
        res.status(500).json({ message: "Ошибка при обновлении заказа", error: err.message });
    }
});

module.exports = router;