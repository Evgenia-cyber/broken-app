const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Sequelize = require('sequelize');
const sequelize = require('../db');
const UserModel = require('../models/user');
const User = UserModel(sequelize, Sequelize);

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

const { Op } = require('sequelize');
router.post('/signup', (req, res) => {
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
        res.status(400).send({
          message: 'Username or/and email already exists',
        });
      } else {
        User.create({
          full_name: req.body.user.full_name,
          username: req.body.user.username,
          passwordHash: bcrypt.hashSync(req.body.user.password, 10),
          email: req.body.user.email,
        }).then(
          function signupSuccess(user) {
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

router.post('/signin', (req, res) => {
  User.findOne({ where: { username: req.body.user.username } }).then((user) => {
    if (user) {
      const matches = bcrypt.compareSync(
        req.body.user.password,
        user.passwordHash,
      );
      if (matches) {
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

module.exports = router;
