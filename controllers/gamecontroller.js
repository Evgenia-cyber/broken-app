// owner_id (id пользователя) нельзя передавать в боди запроса, ибо тогда любой его легко подделает и начнет "править" (добавлять/удалять) игры других пользователей. Этот айдишник достается из токена сессии, который подает "клиент" при любом чихе с играми (ибо да, чтобы что-то делать с играми - нужно сначала залогиниться).
const router = require('express').Router();

// Создаем модель Game, используя Sequelize
const Sequelize = require('sequelize');
const sequelize = require('../db');
const GameModel = require('../models/game');
const Game = GameModel(sequelize, Sequelize);

// ПОЛУЧЕНИЕ ВСЕХ ИГР ПОЛЬЗОВАТЕЛЯ
// url:   http://localhost:4000/api/game/all
router.get('/all', (req, res) => {
  // Cоздаем запрос в базу данных,используя метод findAll() из sequelize. Ид пользователя получаем из req.user.id (записали его туда - cм. /middleware/validate-session.js)
  Game.findAll({ where: { owner_id: req.user.id } }).then(
    function findSuccess(games) {
      res.status(200).json({
        games: games,
        message: 'Data fetched.',
      });
    },

    function findFail() {
      res.status(500).json({
        message: 'Data not found',
      });
    },
  );
});
/////////////////////////////////////////////////////////////////////////

// ПОЛУЧЕНИЕ ИГРЫ ПО ИД ИГРЫ
// url:   http://localhost:4000/api/game/6
router.get('/:id', (req, res) => {
  console.log('get', req.params.id, req.user.id); // req.params.id = 6
  Game.findOne({ where: { id: req.params.id, owner_id: req.user.id } }).then(
    function findSuccess(game) {
      res.status(200).json({
        game: game,
      });
    },

    function findFail(err) {
      res.status(500).json({
        message: 'Data not found.',
      });
    },
  );
});
// ОТВЕТ
// {
//     "game": {
//         "id": 6,
//         "title": "my updated game",
//         "owner_id": 7,
//         "studio": "123",
//         "esrb_rating": "1    ",
//         "user_rating": 1,
//         "have_played": false,
//         "createdAt": "2021-05-22T18:37:48.654Z",
//         "updatedAt": "2021-05-22T18:55:28.511Z"
//     }
// }
/////////////////////////////////////////////////////////////////////////

// СОЗДАНИЕ ИГРЫ
// url:       http://localhost:4000/api/game/create
router.post('/create', (req, res) => {
  console.log('create', req.user.id);
  // Cоздаем запрос в базу данных,используя метод create() из sequelize. Ид пользователя получаем из req.user.id (записали его туда - cм. /middleware/validate-session.js), остальные данные берем из тела запроса
  Game.create({
    title: req.body.game.title,
    owner_id: req.user.id,
    studio: req.body.game.studio,
    esrb_rating: req.body.game.esrb_rating,
    user_rating: req.body.game.user_rating,
    have_played: req.body.game.have_played,
  }).then(
    function createSuccess(game) {
      res.status(200).json({
        game: game,
        message: 'Game created.',
      });
    },

    function createFail(err) {
      res.status(500).send(err.message);
    },
  );
});
// Пример тела запроса:
// {
//   "game":{
//       "title": "my game",
//       "studio": "123",
//       "esrb_rating": "5",
//       "user_rating": "5",
//       "have_played": false
//   }
//   }
// ОТВЕТ
// {
//     "game": {
//         "id": 6,
//         "title": "my game",
//         "owner_id": 7,
//         "studio": "123",
//         "esrb_rating": "5    ",
//         "user_rating": 5,
//         "have_played": false,
//         "updatedAt": "2021-05-22T18:37:48.654Z",
//         "createdAt": "2021-05-22T18:37:48.654Z"
//     },
//     "message": "Game created."
// }
/////////////////////////////////////////////////////////////////////////

// ОБНОВЛЕНИЕ ИГРЫ
// url:     http://localhost:4000/api/game/update/6
// обновление игры с ид = 6
router.put('/update/:id', (req, res) => {
  console.log('update', req.user.id);
  Game.update(
    {
      title: req.body.game.title,
      studio: req.body.game.studio,
      esrb_rating: req.body.game.esrb_rating,
      user_rating: req.body.game.user_rating,
      have_played: req.body.game.have_played,
    },
    {
      where: {
        id: req.params.id, // 6
        owner_id: req.user.id,
      },
    },
  ).then(
    function updateSuccess(game) {
      res.status(200).json({
        game: game,
        message: 'Successfully updated.',
      });
    },

    function updateFail(err) {
      res.status(500).json({
        message: err.message,
      });
    },
  );
});
// Пример тела запроса:
// {
//   "game":{
//       "title": "my updated game",
//       "studio": "123",
//       "esrb_rating": "1",
//       "user_rating": "1",
//       "have_played": false
//   }
//   }
//   ОТВЕТ
//   {
//       "game": [
//           0
//       ],
//       "message": "Successfully updated."
//   }
/////////////////////////////////////////////////////////////////////////

// УДАЛЕНИЕ ИГРЫ
// url:   http://localhost:4000/api/game/remove/6
// удаление игры с ид = 6
router.delete('/remove/:id', (req, res) => {
  Game.destroy({
    where: {
      id: req.params.id, //6
      owner_id: req.user.id,
    },
  }).then(
    function deleteSuccess(game) {
      res.status(200).json({
        game: game,
        message: 'Successfully deleted',
      });
    },

    function deleteFail(err) {
      res.status(500).json({
        error: err.message,
      });
    },
  );
});
// ОТВЕТ
// {
//     "game": 1,
//     "message": "Successfully deleted"
// }

module.exports = router;
