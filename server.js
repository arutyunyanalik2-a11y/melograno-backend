const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const storeRoutes = require('./routes/storeRoutes');       // Роуты магазинов
const courierRoutes = require('./routes/courierRoutes');   // Роуты курьеров
const Courier = require('./models/Courier');               // Модель курьера для авто-создания

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Разрешаем запросы со всех устройств (ПК, телефон в локальной сети)
        methods: ["GET", "POST"]
    }
});

// Делаем `io` доступным внутри роутов через `req.app.get('io')`
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Делаем папку /uploads публичной (для доступа к картинкам)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: function (res, path, stat) {
        res.set('Access-Control-Allow-Origin', '*');
    }
}));
// Подключение маршрутов (Роутов)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);       
app.use('/api/couriers', courierRoutes);   

// Обработка WebSocket соединений в реальном времени
io.on('connection', (socket) => {
    console.log('Клиент подключился по WebSocket:', socket.id);

    socket.on('disconnect', () => {
        console.log('Клиент отключился:', socket.id);
    });
});

// Подключение к MongoDB и запуск сервера
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB успешно подключена!');

        try {
            // Принудительно очищаем коллекцию курьеров (удаляем Александра)
            await Courier.deleteMany({}); 
            
            // Записываем новый список
            const initialCouriers = [
                { name: "Ավագյան Դավիթ", password: "101", routes: ["ул. Абовяна, 5"] },
                { name: "Արթուր Գյուլնազարյան", password: "102", routes: ["ул. Абовяна, 7"] },
                { name: "Արթուր Խաչատրյան", password: "103", routes: [] },
                { name: "Արշակ Փոթոյան", password: "104", routes: [] },
                { name: "Արսեն Ղասարյան", password: "105", routes: [] },
                { name: "Արտակ Ղեւոնդյան", password: "106", routes: [] },
                { name: "Բաղրամյան Ռոման", password: "107", routes: [] },
                { name: "Գառնիկ Գասպարյան", password: "108", routes: [] },
                { name: "Հայրապետ Բաղդասարյան", password: "109", routes: [] },
                { name: "Մելոյան Սերյոժա", password: "110", routes: [] },
                { name: "Մինասյան Գոռ", password: "111", routes: [] },
                { name: "Մովսիսյան Սերգեյ", password: "112", routes: [] },
                { name: "Ռոբերտ Բաղրամյան", password: "113", routes: [] },
                { name: "Վարդանյան Հովհաննես", password: "114", routes: [] }
            ];
            
            await Courier.insertMany(initialCouriers);
            console.log('База обновлена: старые курьеры удалены, новые добавлены!');
            
        } catch (err) {
            console.error('Ошибка при обновлении курьеров:', err);
        }

        server.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Ошибка подключения к MongoDB:', err);
    });