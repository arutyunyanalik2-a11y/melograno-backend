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
            // Проверка и инициализация курьеров по умолчанию (Пн-Сб)
            const count = await Courier.countDocuments();
            if (count === 0) {
                const initialCouriers = [
                    {
                        name: "Գ. Արթուր",
                        password: "101",
                        routes: [
                            { day: "Понедельник", address: "Տավուշի մարզ ք. Դիլիջան Կալինինի 99/9" },
                            { day: "Вторник", address: "Տավուշ, Դիլիջան, Օրջոնիկիձե 65 15" },
                            { day: "Среда", address: "Տավուշ, Դիլիջան, Օրջոնիկիձե 65 15" },
                            { day: "Четверг", address: "Տավուշի մարզ, ք. Иջևան, Երևանյան 24" },
                            { day: "Пятница", address: "Տավուշի մարզ, ք. Նոյեմբերյան, Երևանյան 12" },
                            { day: "Суббота", address: "Տավուշի մարզ, ք. Բերդ, Մաշտոցի 5" }
                        ]
                    },
                    {
                        name: "Խ. Արթուր",
                        password: "102",
                        routes: [
                            { day: "Понедельник", address: "Երևան, Նոր Նորք, Աճառյան 1 փակ. 4/4 շ 17-18 տար." },
                            { day: "Вторник", address: "Երևան Ալմա-Աթա 94" },
                            { day: "Среда", address: "Երևան, Նորք-Մարաշ, Արմենակյան 120" },
                            { day: "Четверг", address: "Երևան, Ավան, Խուդյակով 55" },
                            { day: "Пятница", address: "Երևան, Քանաքեռ-Զեյթուն, Ռուբինյանց 15" },
                            { day: "Суббота", address: "Երևան, Նոր Նորք 5-րդ զանգված, Միկոյան 10" }
                        ]
                    },
                    {
                        name: "Արշակ",
                        password: "103",
                        routes: [
                            { day: "Понедельник", address: "Երևան Էրեբունի Էրեբունի 3/1" },
                            { day: "Вторник", address: "Երևան Սեբաստիա 12 շ 57 շին." },
                            { day: "Среда", address: "Երևան, Մալաթիա-Սեբաստիա, Րաֆֆու 33" },
                            { day: "Четверг", address: "Երևան, Շենգավիթ, Գարեգին Նժդեհի 18" },
                            { day: "Пятница", address: "Երևան, Էրեբունի, Խորենացի 43" },
                            { day: "Суббота", address: "Երևան, Նուբարաշեն 11 փողոց" }
                        ]
                    },
                    {
                        name: "Արտակ",
                        password: "104",
                        routes: [
                            { day: "Понедельник", address: "Երևան, Ավանեսով 8/3 48" },
                            { day: "Вторник", address: "Երևան, Էրեբունի, Խաղաղ Դոնի փ. 27 խանութ" },
                            { day: "Среда", address: "Երևան, Դավթաշեն 2-րդ թաղ. 15" },
                            { day: "Четверг", address: "Երևան, Աջափնյակ, Մարգարյան 20" },
                            { day: "Пятница", address: "Երևան, Արաբկիր, Կոմիտասի պող. 35" },
                            { day: "Суббота", address: "Երևան, Կենտրոն, Մաշտոցի պող. 12" }
                        ]
                    },
                    {
                        name: "Արսեն",
                        password: "105",
                        routes: [
                            { day: "Понедельник", address: "Արմավիրի մարզ ք.Արմավիր Հանրապետության փ 12/1" },
                            { day: "Вторник", address: "Արմավիրի մարզ ք. Արմավիր Նալբանդյան 29/2 0" },
                            { day: "Среда", address: "Արմավիրի մարզ, ք. Վաղարշապատ, Մաշտոցի 10" },
                            { day: "Четверг", address: "Արմավիրի մարզ, ք. Մեծամոր, 1-ին թաղ. 5" },
                            { day: "Пятница", address: "Արմավիրի մարզ, գ. Փարաքար, Նաիրի 12" },
                            { day: "Суббота", address: "Արմավիրի մարզ, գ. Բաղրամյան, Կենտրոնական" }
                        ]
                    },
                    {
                        name: "Գառնիկ",
                        password: "106",
                        routes: [
                            { day: "Понедельник", address: "Կոտայքի մարզ ք.Աբովյան Սևանի 2" },
                            { day: "Вторник", address: "Կոտայք, Աբովյան, Գառնիի փողոց, 6" },
                            { day: "Среда", address: "Կոտայքի մարզ, ք. Հրազդան, Միկրոշրջան 12" },
                            { day: "Четверг", address: "Կոտայքի մարզ, ք. Ծաղկաձոր, Օրբելի եղբայրների 5" },
                            { day: "Пятница", address: "Կոտայքի մարզ, ք. Չարենցավան, 3-րդ թաղ." },
                            { day: "Суббота", address: "Կոտայքի մարզ, գ. Գառնի, Գեւորգ Մարզպետունի 8" }
                        ]
                    },
                    {
                        name: "Ռոբերտ",
                        password: "107",
                        routes: [
                            { day: "Понедельник", address: "Արարատ, Աղբյուր Սերոբի փ. 6 11" },
                            { day: "Вторник", address: "Արարատի մարզ գ. Վ.Արտաշատ Շահումյան 5" },
                            { day: "Среда", address: "Արարատի մարզ, ք. Արտաշատ, Օգոստոսի 23 փ." },
                            { day: "Четверг", address: "Արարատի մարզ, ք. Վեդի, Արարատյան 15" },
                            { day: "Пятница", address: "Արարատի մարզ, ք. Արարատ, Խանջյան 8" },
                            { day: "Суббота", address: "Արարատի մարզ, գ. Մասիս, Կենտրոնական հրապարակ" }
                        ]
                    },
                    {
                        name: "Մելոյան",
                        password: "108",
                        routes: [
                            { day: "Понедельник", address: "ք. Երևան Ավետ Ավետիսյան 63" },
                            { day: "Вторник", address: "Երևան, Կենտրոն, Տերյան 68ա" },
                            { day: "Среда", address: "Երևան, Կենտրոն, Աբովյան փ. 18" },
                            { day: "Четверг", address: "Երևան, Արաբկիր, Հրաչյա Քոչար 12" },
                            { day: "Пятница", address: "Երևան, Կենտրոն, Սարյան 22" },
                            { day: "Суббота", address: "Երևան, Կենտրոն, Ամիրյան 8" }
                        ]
                    },
                    {
                        name: "Սերգեյ",
                        password: "109",
                        routes: [
                            { day: "Понедельник", address: "Գեղարքունիքի մարզ գ.Ներքին Գետաշեն" },
                            { day: "Вторник", address: "Գեղարքունիքի մարզ գ.Ծովինար" },
                            { day: "Среда", address: "Գեղարքունիքի մարզ, ք. Գավառ, Բոշնաղյան 14" },
                            { day: "Четверг", address: "Գեղարքունիքի մարզ, ք. Սևան, Նաիրյան 38" },
                            { day: "Пятница", address: "Գեղարքունիքի մարզ, ք. Մարտունի, Երևանյան 10" },
                            { day: "Суббота", address: "Գեղարքունիքի մարզ, ք. Վարդենիս, Վիկտոր Համբարձումյան 5" }
                        ]
                    },
                    {
                        name: "Հովիկ",
                        password: "110",
                        routes: [
                            { day: "Понедельник", address: "Շիրակ, Գյումրի, Տրդատ ճարտարապետ 1/3" },
                            { day: "Вторник", address: "Շիրակ, Գյումրի, Գորկու 104/1" },
                            { day: "Среда", address: "Շիրակ, Գյումրի, Ռիժկովի 5" },
                            { day: "Четверг", address: "Շիրակ, Գյումրի, Սայաթ-Նովա 18" },
                            { day: "Пятница", address: "Շիրակ, ք. Արթիկ, Անկախության 10" },
                            { day: "Суббота", address: "Շիրակ, ք. Մարալիկ, Հանրապետության 4" }
                        ]
                    }
                ];

                await Courier.insertMany(initialCouriers);
                console.log('Начальные курьеры с маршрутами Пн-Сб успешно созданы в базе!');
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