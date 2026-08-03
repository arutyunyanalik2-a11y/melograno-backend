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
const storeRoutes = require('./routes/storeRoutes');
const courierRoutes = require('./routes/courierRoutes');
const Courier = require('./models/Courier');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

app.set('io', io);
app.use(cors());
app.use(express.json());

// Раздача статических файлов (изображений)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: function (res, path, stat) {
        res.set('Access-Control-Allow-Origin', '*');
    }
}));

// Подключение роутов API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api', courierRoutes);

// ИСПРАВЛЕНО: Единое подключение courierRoutes к префиксу /api.
// Это автоматически сделает доступными роуты:
// - GET  /api/couriers
// - GET  /api/courier-orders
// - POST /api/couriers/login
// - GET  /api/couriers/:id/orders
// - DELETE /api/courier-orders/:id
app.use('/api', courierRoutes);

// WebSocket подключение
io.on('connection', (socket) => {
    console.log('Клиент подключился по WebSocket:', socket.id);
    socket.on('disconnect', () => {
        console.log('Клиент отключился:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

// Подключение к MongoDB и запуск сервера
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB успешно подключена!');

        try {
            // Проверка и инициализация курьеров по умолчанию
            const count = await Courier.countDocuments();
            if (count === 0) {
                const initialCouriers = [
                    {
                        name: "Գ. Արթուր",
                        password: "101",
                        routes: [
                            { day: "Понедельник", address: "Տավուշի մարզ ք. Դիլիջան Կալինինի 99/9 (Հարութ 96 ՍՊԸ - 3%)" },
                            { day: "Вторник", address: "Տավուշ, Դիլիջան, Օրջոնիկիձե 65 15 (Պոնդոյան Անահիտ ԱՁ)" }
                        ]
                    },
                    {
                        name: "Խ. Արթուր",
                        password: "102",
                        routes: [
                            { day: "Понедельник", address: "Երևան, Նոր Նորք, Աճառյան 1 փակ. 4/4 շ 17-18 տար. (Շահավետ Աճառյան ՍՊԸ)" },
                            { day: "Вторник", address: "Երևան Ալմա-Աթա 94 (Նելա ՍՊԸ)" }
                        ]
                    },
                    {
                        name: "Արշակ",
                        password: "103",
                        routes: [
                            { day: "Понедельник", address: "Երևան Էրեբունի Էրեբունի 3/1 (Ն և Մ ՍՊԸ)" },
                            { day: "Вторник", address: "Երևան Սեբաստիա 12 շ 57 շին. (Մարկետ թրեյդ ՍՊԸ)" }
                        ]
                    },
                    {
                        name: "Արտակ",
                        password: "104",
                        routes: [
                            { day: "Понедельник", address: "Երևան, Ավանեսով 8/3 48 (Բոխյան Հայկուշ Ա/Ձ)" },
                            { day: "Вторник", address: "Երևան, Էրեբունի, Խաղաղ Դոնի փ. 27 խանութ (Նարե Տ ՍՊԸ)" }
                        ]
                    },
                    {
                        name: "Արսեն",
                        password: "105",
                        routes: [
                            { day: "Понедельник", address: "Արմավիրի մարզ ք.Արմավիր Հանրապետության փ 12/1 (ԱՆԱՀԻՏ-Ռ ՍՊԸ)" },
                            { day: "Вторник", address: "Արմավիրի մարզ ք. Արմավիր Նալբանդյան 29/2 0 (Գրիգորյան Իվոնա Ա/Ձ)" }
                        ]
                    },
                    {
                        name: "Գառնիկ",
                        password: "106",
                        routes: [
                            { day: "Понедельник", address: "Կոտայքի մարզ ք.Աբովյան Սևանի 2 (Կինգ Վերժինե ՍՊԸ - 3%)" },
                            { day: "Вторник", address: "Կոտայք, Աբովյան, Գառնիի փողոց, 6 (Կաթիլց ՍՊԸ - 4%)" }
                        ]
                    },
                    {
                        name: "Ռոբերտ",
                        password: "107",
                        routes: [
                            { day: "Понедельник", address: "Արարատ, Աղբյուր Սերոբի փ. 6 11 (Քարավան 6 ՍՊԸ)" },
                            { day: "Вторник", address: "Արարատի մարզ գ. Վ.Արտաշատ Շահումյան 5 (Լա-Վա-Դա ՍՊԸ)" }
                        ]
                    },
                    {
                        name: "Մելոյան",
                        password: "108",
                        routes: [
                            { day: "Понедельник", address: "ք. Երևան Ավետ Ավետիսյան 63 (ՍԱՍ գրուպ ՍՊԸ - 3%)" },
                            { day: "Вторник", address: "Երևան, Կենտրոն, Տերյան 68ա (Ռաֆֆի Զաքոյան ԱՁ)" }
                        ]
                    },
                    {
                        name: "Սերգեյ",
                        password: "109",
                        routes: [
                            { day: "Понедельник", address: "Գեղարքունիքի մարզ գ.Ներքին Գետաշեն - (Կոթ ՍՊԸ - 2%)" },
                            { day: "Вторник", address: "Գեղարքունիքի մարզ գ.Ծովինար - (Եփրեմյան Գոռ)" }
                        ]
                    },
                    {
                        name: "Հովիկ",
                        password: "110",
                        routes: [
                            { day: "Понедельник", address: "Շիրակ, Գյումրի, Տրդատ ճարտարապետ 1/3 (Բակմազյան Գառնիկ ԱՁ - 3%)" },
                            { day: "Вторник", address: "Շիրակ, Գյումրի, Գորկու 104/1 (Վարդանյան Հովհաննես - 3.5%)" }
                        ]
                    }
                ];

                await Courier.insertMany(initialCouriers);
                console.log('Начальные курьеры успешно созданы в базе!');
            } else {
                console.log('Курьеры уже есть в базе, создание пропущено.');
            }
        } catch (err) {
            console.error('Ошибка при работе с курьерами:', err);
        }

        server.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Ошибка подключения к MongoDB:', err);
    });