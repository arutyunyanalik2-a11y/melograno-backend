const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders'); // 👈 1. Подключаем файл роутов заказов

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Делаем папку /uploads публичной (для доступа к картинкам)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Подключение маршрутов (Роутов)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // 👈 2. Регистрируем эндпоинт /api/orders

// Подключение к MongoDB и запуск сервера
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB успешно подключена!');
        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Ошибка подключения к MongoDB:', err);
    });