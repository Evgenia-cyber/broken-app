const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Создаем модель User, используя Sequelize
const Sequelize = require('sequelize');
const sequelize = require('../db');
const UserModel = require('../models/user');
const User = UserModel(sequelize, Sequelize);

// РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ
// router.post('/signup', (req, res) => {
//   User.create({
//     full_name: req.body.user.full_name,
//     username: req.body.user.username,
//     passwordHash: bcrypt.hashSync(req.body.user.password, 10),
//     email: req.body.user.email,
//   }).then(
//     function signupSuccess(user) {
//       let token = jwt.sign({ id: user.id }, 'lets_play_sum_games_man', {
//         expiresIn: 60 * 60 * 24,
//       });
//       res.status(200).json({
//         user: user,
//         token: token,
//       });
//     },
//     function signupFail(err) {
//       res.status(500).send(err.message);
//     },
//   );
// });

// РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ с проверкой на уникальность username или email
const { Op } = require('sequelize');
// url:   http://localhost:4000/api/auth/signup
router.post('/signup', (req, res) => {
  // Cоздаем запрос в базу данных,используя метод findOne() из sequelize и ИЛИ: ищем в бд, есть ли уже пользователь с таким username или email
  User.findOne({
    where: {
      [Op.or]: [
        { username: req.body.user.username },
        { email: req.body.user.email },
      ],
    },
  })
    .then((user) => {
      if (user) {
        // если такой пользователь есть, то показываем пользователю сообщение
        res.status(400).send({
          message: 'Username or/and email already exists',
        });
      } else {
        // если такого пользователя нет, то создаем его и добавляем в бд, используя метод create() из sequelize
        User.create({
          // берем из тела запроса нужные данные:
          full_name: req.body.user.full_name,
          username: req.body.user.username,
          passwordHash: bcrypt.hashSync(req.body.user.password, 10), // шифруем пароль
          email: req.body.user.email,
        }).then(
          function signupSuccess(user) {
            // создаем токен на 24 часа на основе user.id и строки-ключа: 'lets_play_sum_games_man' (этот ключ будем использовать в middleware/validate-session.js для расшифровки)
            let token = jwt.sign({ id: user.id }, 'lets_play_sum_games_man', {
              expiresIn: 60 * 60 * 24,
            });
            res.status(200).json({
              user: user,
              token: token,
            });
          },

          function signupFail(err) {
            res.status(500).send(err.message);
          },
        );
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message,
      });
    });
});
// пример тела запроса:
// {
//   "user": {
//   "full_name" : "Jen",
//   "username" : "jen",
//   "password" : "1234567",
//   "email": "777@mail.ru"
//   }
// }
// ОТВЕТ
// {
//     "user": {
//         "id": 7,
//         "full_name": "Jen",
//         "username": "jen",
//         "passwordHash": "$2a$10$NYvc6QXnS0qUOPA/SWrKI.kkGDRononARpW9LOO7T5TtmVZUzD/si",
//         "email": "777@mail.ru",
//         "updatedAt": "2021-05-22T18:11:14.959Z",
//         "createdAt": "2021-05-22T18:11:14.959Z"
//     },
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpZCI6NywiaWF0IjoxNjIxNzA3MDc1LCJleHAiOjE2MjE3OTM0NzV9.kcZOxueUVFdsX3-SMo47POx7HmMN74uL3H_FLU1CUdc"
// }
/////////////////////////////////////////////////////////////////////////

// АВТОРИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ
// url:   http://localhost:4000/api/auth/signin
router.post('/signin', (req, res) => {
  // ищем username в бд, используя метод findOne() из sequelize
  User.findOne({ where: { username: req.body.user.username } }).then((user) => {
    if (user) {
      // если находим такой username в бд, то сравниваем полученный из тела запроса и записанный в бд пароли
      const matches = bcrypt.compareSync(
        req.body.user.password,
        user.passwordHash,
      );
      if (matches) {
        // если пароли совпадают, создаем токен на 24 часа на основе user.id и строки-ключа: 'lets_play_sum_games_man'(этот ключ будем использовать в middleware/validate-session.js для расшифровки)
        var token = jwt.sign({ id: user.id }, 'lets_play_sum_games_man', {
          expiresIn: 60 * 60 * 24,
        });
        res.json({
          user: user,
          message: 'Successfully authenticated.',
          sessionToken: token,
        });
      } else {
        res.status(502).send({ error: 'Passwords do not match.' });
      }
    } else {
      res.status(403).send({ error: 'User not found.' });
    }
  });
});
// пример тела запроса:
// {
//   "user": {
//   "username" : "jen",
//   "password" : "1234567"
//   }
// }
// ОТВЕТ
// {
//   "user": {
//       "id": 7,
//       "full_name": "Jen",
//       "username": "jen",
//       "passwordHash": "$2a$10$NYvc6QXnS0qUOPA/SWrKI.kkGDRononARpW9LOO7T5TtmVZUzD/si",
//       "email": "777@mail.ru",
//       "createdAt": "2021-05-22T18:11:14.959Z",
//       "updatedAt": "2021-05-22T18:11:14.959Z"
//   },
//   "message": "Successfully authenticated.",
//   "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpZCI6NywiaWF0IjoxNjIxNzA3MDc1LCJleHAiOjE2MjE3OTM0NzV9.kcZOxueUVFdsX3-SMo47POx7HmMN74uL3H_FLU1CUdc"
// }

module.exports = router;
