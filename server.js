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
const Courier = require('./models/Courier');               // Модель курьера

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Разрешаем запросы со всех устройств
        methods: ["GET", "POST"]
    }
});

// Делаем `io` доступным внутри роутов
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

// Обработка WebSocket соединений
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
            // Проверяем, есть ли уже курьеры в базе
            const couriersCount = await Courier.countDocuments();

            if (couriersCount === 0) {
                const initialCouriers = [
                    {
                        name: "Գ. Արթուր",
                        password: "101",
                        routes: [
                            "Տավուշի մարզ ք. Դիլիջան Կալինինի 99/9 (Հարութ 96 ՍՊԸ - 3%)",
                            "Տավուշ, Դիլիջան, Օրջոնիկիձե 65 15 (Պոնդոյան Անահիտ ԱՁ)"
                        ]
                    },
                    {
                        name: "Խ. Արթուր",
                        password: "102",
                        routes: [
                            "Երևան, Նոր Նորք, Աճառյան 1 փակ. 4/4 շ 17-18 տար. (Շահավետ Աճառյան ՍՊԸ)",
                            "Երևան Ալմա-Աթա 94 (Նելա ՍՊԸ)"
                        ]
                    },
                    {
                        name: "Արշակ",
                        password: "103",
                        routes: [
                            "Երևան Էրեբունի Էրեբունի 3/1 (Ն և Մ ՍՊԸ)",
                            "Երևան Սեբաստիա 12 շ 57 շին. (Մարկետ թրեյդ ՍՊԸ)"
                        ]
                    },
                    {
                        name: "Արտակ",
                        password: "104",
                        routes: [
                            "Երևան, Ավանեսով 8/3 48 (Բոխյան Հայկուշ Ա/Ձ)",
                            "Երևան, Էրեբունի, Խաղաղ Դոնի փ. 27 խանութ (Նարե Տ ՍՊԸ)"
                        ]
                    },
                    {
                        name: "Արսեն",
                        password: "105",
                        routes: [
                            "Արմավիրի մարզ ք.Արմավիր Հանրապետության փ 12/1 (ԱՆԱՀԻՏ-Ռ ՍՊԸ)",
                            "Արմավիրի մարզ ք. Արմավիր Նալբանդյան 29/2 0 (Գրիգորյան Իվոնա Ա/Ձ)"
                        ]
                    },
                    {
                        name: "Գառնիկ",
                        password: "106",
                        routes: [
                            "Կոտայքի մարզ ք.Աբովյան Սևանի 2 (Կինգ Վերժինե ՍՊԸ - 3%)",
                            "Կոտայք, Աբովյան, Գառնիի փողոց, 6 (Կաթիլց ՍՊԸ - 4%)"
                        ]
                    },
                    {
                        name: "Ռոբերտ",
                        password: "107",
                        routes: [
                            "Արարատ, Աղբյուր Սերոբի փ. 6 11 (Քարավան 6 ՍՊԸ)",
                            "Արարատի մարզ գ. Վ.Արտաշատ Շահումյան 5 (Լա-Վա-Դա ՍՊԸ)"
                        ]
                    },
                    {
                        name: "Մելոյան ",
                        password: "108",
                        routes: [
                            "ք. Երևան Ավետ Ավետիսյան 63 (ՍԱՍ գրուպ ՍՊԸ - 3%)",
                            "Երևան, Կենտրոն, Տերյան 68ա (Ռաֆֆի Զաքոյան ԱՁ)"
                        ]
                    },
                    {
                        name: "Սերգեյ",
                        password: "109",
                        routes: [
                            "Գեղարքունիքի մարզ գ.Ներքին Գետաշեն - (Կոթ ՍՊԸ - 2%)",
                            "Գեղարքունիքի մարզ գ.Ծովինար - (Եփրեմյան Գոռ)"
                        ]
                    },
                    {
                        name: "Հովիկ",
                        password: "110",
                        routes: [
                            "Շիրակ, Գյումրի, Տրդատ ճարտարապետ 1/3 (Բակմազյան Գառնիկ ԱՁ - 3%)",
                            "Շիրակ, Գյումրի, Գորկու 104/1 (Վարդանյան Հովհաննես - 3.5%)"
                        ]
                    }
                ];

                await Courier.insertMany(initialCouriers);
                console.log('База обновлена: полная таблица агентов и маршрутов добавлена!');
            } else {
                console.log(`Курьеры уже есть в базе (${couriersCount} чел.), создание пропущено для защиты _id.`);
            }

        } catch (err) {
            console.error('Ошибка при проверке/обновлении курьеров:', err);
        }

        server.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Ошибка подключения к MongoDB:', err);
    });