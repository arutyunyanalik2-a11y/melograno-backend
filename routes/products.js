const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// ДОБАВИТЬ ТОВАР
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, price, description, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Изображение обязательно' });
        }

        const imagePath = `/uploads/${req.file.filename}`;

        const product = new Product({
            title,
            price,
            description,
            category,
            image: imagePath
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при добавлении', error: error.message });
    }
});

// ПОЛУЧИТЬ ВСЕ ТОВАРЫ
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});

// УДАЛИТЬ ТОВАР
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        // Удаляем картинку из папки uploads
        const imagePath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Товар успешно удален' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});

// ОБЯЗАТЕЛЬНАЯ СТРОКА ДЛЯ РАБОТЫ РОУТИНГА
module.exports = router;