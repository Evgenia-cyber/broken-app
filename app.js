const express = require('express');
const app = express();
const db = require('./db');
const user = require('./controllers/usercontroller');
const game = require('./controllers/gamecontroller');
require('dotenv').config();

db.sync();
// app.use(require('body-parser'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use('/api/auth', user);
app.use(require('./middleware/validate-session'));
app.use('/api/game', game);

const PORT = process.env.PORT;
app.listen(PORT, function () {
  console.log(`App is listening on http://localhost:${PORT}`);
});
