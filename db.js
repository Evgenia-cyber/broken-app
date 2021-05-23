const Sequelize = require('sequelize');
require('dotenv').config();
const Op = Sequelize.Op;

//database username   password
const sequelize = new Sequelize(
  process.env.DB,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    operatorsAliases: {
      $and: Op.and,
      $or: Op.or,
      $eq: Op.eq,
      $gt: Op.gt,
      $lt: Op.lt,
      $lte: Op.lte,
      $like: Op.like,
    },
  },
);

sequelize.authenticate().then(
  function success() {
    console.log('Connected to DB');
  },

  function fail(err) {
    console.log(`Error: ${err}`);
  },
);

module.exports = sequelize;
