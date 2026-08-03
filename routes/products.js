const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/upload'); // Импортируем загрузчик
const cloudinary = require('cloudinary').v2;

// ДОБАВИТЬ ТОВАР
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, price, description, category, days, months } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Изображение обязательно' });
        }

        const imagePath = req.file.path;

        const product = new Product({
            title,
            price,
            description,
            category,
            days,
            months,
            image: imagePath
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Ошибка при добавлении товара:', error);
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

// ОБНОВИТЬ ТОВАР (ДОБАВЛЕННЫЙ РОУТ)
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, price, description, category, days, months } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        // Если загружено новое изображение — удаляем старое из Cloudinary и ставим новое
        if (req.file) {
            if (product.image && product.image.includes('cloudinary')) {
                try {
                    const urlParts = product.image.split('/');
                    const filenameWithExt = urlParts.pop();
                    const folderName = urlParts.pop();
                    const filename = filenameWithExt.split('.')[0];
                    const publicId = `${folderName}/${filename}`;

                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudErr) {
                    console.error('Не удалось удалить старую картинку из облака:', cloudErr);
                }
            }
            product.image = req.file.path;
        }

        // Обновляем текстовые поля
        if (title !== undefined) product.title = title;
        if (price !== undefined) product.price = price;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (days !== undefined) product.days = days;
        if (months !== undefined) product.months = months;

        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Ошибка при обновлении товара:', error);
        res.status(500).json({ message: 'Ошибка при обновлении', error: error.message });
    }
});

// УДАЛИТЬ ТОВАР
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        if (product.image && product.image.includes('cloudinary')) {
            try {
                const urlParts = product.image.split('/');
                const filenameWithExt = urlParts.pop();
                const folderName = urlParts.pop();
                const filename = filenameWithExt.split('.')[0];
                const publicId = `${folderName}/${filename}`;

                await cloudinary.uploader.destroy(publicId);
            } catch (cloudErr) {
                console.error('Не удалось удалить картинку из облака:', cloudErr);
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Товар и его изображение успешно удалены' });
    } catch (error) {
        console.error('Ошибка при удалении товара:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});

module.exports = router;