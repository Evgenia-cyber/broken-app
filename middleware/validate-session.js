const jwt = require('jsonwebtoken');

// Создаем модель User, используя Sequelize
const Sequelize = require('sequelize');
const sequelize = require('../db');
const UserModel = require('../models/user');
const User = UserModel(sequelize, Sequelize);

// id юзера нельзя передавать в боди запроса, ибо тогда любой его легко подделает и начнет "править" (добавлять/удалять) игры других пользователей. Этот айдишник достается из токена сессии. Токен создается при регистрации/авторизации пользователя. Далее "клиент" подает токен в headers при любом чихе с играми (ибо да, чтобы что-то делать с играми - нужно сначала залогиниться).
// Ниже реализуем это "доставание"

module.exports = function (req, res, next) {
  if (req.method === 'OPTIONS') {
    next(); // allowing options as a method for request
  } else {
    // Токен coздается при регистрации/авторизации пользователя - см. controllers/usercontroller
    // Eсли запрос не 'OPTIONS', то берем переданный в headers токен, который находится в authorization (Т.к. используем для тестирования запросов приложения postman, то надо добавлять в postman в Headers: Autorization ...значение токена... для всех запросов для игр(т.е. для всех запросов приложения кроме регистрации/авторизации пользователя). На фронте бы делали добавление заголовков при помощи axios)
    const sessionToken = req.headers.authorization;
    console.log(sessionToken);
    if (!sessionToken)
      return res
        .status(403)
        .send({ auth: false, message: 'No token provided.' });
    else {
      jwt.verify(
        sessionToken, // токен
        'lets_play_sum_games_man', // секретный или публичный ключ, который использовался при создании токена ( см. controllers/usercontroller )
        // т.к. токен генерировали на основе { id: user.id }, то можем получить ид юзера.
        (err, decoded) => {
          if (decoded) {
            // ищем соответствующего юзера, используя метод findOne() из sequelize
            User.findOne({ where: { id: decoded.id } }).then(
              (user) => {
                req.user = user; // записываем user'а в req. Теперь ид юзера можно получить через req.user.id (см. в controllers/gamecontroller.js)
                console.log(`user: ${user}`);
                next();
              },
              function () {
                res.status(401).send({ error: 'not authorized' });
              },
            );
          } else {
            res.status(400).send({ error: 'not authorized' });
          }
        },
      );
    }
  }
};
