const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/upload'); // Импортируем загрузчик
const cloudinary = require('cloudinary').v2;

// ДОБАВИТЬ ТОВАР
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, price, description, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Изображение обязательно' });
        }

        const imagePath = req.file.path;

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