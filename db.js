const Sequelize = require('sequelize');
require('dotenv').config(); // пакет для работы с .env файлом
const Op = Sequelize.Op;

// Mожно установить Postgres (содержит pgAdmin4 ):
// 1. Установите Postgres (содержит pgAdmin4 )
// 2. Postgres должен работать на localhost , на порту 5433
// 3. Создать пользователя
// 4. Запустите pgAdmin4
// 5. Создать базу данных с именем gamedb
// 6. В файле db.js изменяем username и login строки на ваш ( используем для этого .env, который добавляем в .gitignore, чтобы пароли не записались на гитхабе ):
// const sequelize = new Sequelize(
//   "gamedb", // database
//   'postgres', // username
//   '123456789', // password
//   {
//     host: 'localhost',
//     dialect: 'postgres',
//   },
// );

// sequelize.authenticate().then(
//   function success() {
//     console.log('Connected to DB');
//   },

//   function fail(err) {
//     console.log(`Error: ${err}`);
//   },
// );
// 7. Установить зависимости через npm i
// 8. Запустить приложение через npm run start
//*************************************************************************//
// ИЛИ альтернативный способ использования Postgrеs - ЕlephantSQL API
// 1. Зайдите на сайт ElephantSQL и зарегистрируйтесь: Используйте любое название команды, согласитесь с условиями обслуживания, проверьте, что вам не нужно соблюдать GDPR. 
// 2. Нажмите кнопку «Создать новый экземпляр».
// 3. Дайте имя экземпляру и выберите бесплатный план («Маленькая черепашка»). Выберите регион AWS eu-west-1 (или eu-central-1)
// 4. Подтвердите создание экземпляра
// 5. Нажмите на экземпляр, чтобы увидеть подробности: необходимые данные - сервер (хост), база данных пользователей по умолчанию и пароль
// !!! Обязательно игнорируйте .env в .gitignore, прежде чем вносить какие-либо изменения.
// 6.  Node.js не знает, как читать и анализировать файл .env -для этого установите donenv пакет. В .env файле (должен быть в корне) установите следующие переменные:
// DB_HOST = tai.db.elephantsql.com
// DB = yourdatabasename
// DB_USER = yourusername
// DB_PASSWORD = ваш пароль

// определяем объект Sequelize
const sequelize = new Sequelize(
  process.env.DB, // database
  process.env.DB_USER, // username
  process.env.DB_PASSWORD, // password
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // чтобы не выводились логи базы данных
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
