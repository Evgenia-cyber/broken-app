// Это веб-приложение на JavaScript. Стек: Express, Sequilize и PostgreSQL.
// Express - быстрый, гибкий, минималистичный веб-фреймворк для приложений Node.js
// PostgreSQL — свободная объектно-реляционная система управления базами данных (СУБД).
// Sequelize - это ORM-библиотека для приложений на Node. js, которая осуществляет сопоставление таблиц в бд и отношений между ними с классами. При использовании Sequelize мы можем не писать SQL-запросы, а работать с данными как с обычными объектами.
// Пакет nodemon позволяет автоматически перезапускать код после изменений
// Postman - приложение Chrome, которое мы будем использовать для практического тестирования нашего API.

const express = require('express');
const app = express();
const db = require('./db');
const user = require('./controllers/usercontroller');
const game = require('./controllers/gamecontroller');
require('dotenv').config(); // пакет для работы с .env файлом

db.sync(); // синхронизация с бд

// app.use(require('body-parser')); // парсит данные входящих запросов - устарело - вместо него используем express.json() и express.urlencoded():
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use('/api/auth', user); // регистрация/авторизация пользователя
// При успешной регистрации или авторизации пользователя создается токен, который надо передавать в заголовки для всех запросов, касающихся игр - это реализовано в /middleware/validate-session.js:
app.use(require('./middleware/validate-session'));
// Далее можем получать ид пользователя для манипуляций с играми через req.user.id(см. в controllers/gamecontroller.js):
app.use('/api/game', game); // создание/обновление/получение игры/получение всех игр

// запускаем сервер
const PORT = process.env.PORT;
app.listen(PORT, function () {
  console.log(`App is listening on http://localhost:${PORT}`);
});
