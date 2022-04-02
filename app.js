require('./global_function');

const express = require('express');
const app = express();
const passport = require('passport');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const nocache = require('nocache');

const models = require("./models");
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.json')[env];

models.sequelize.authenticate().then(() => {
	console.log('Connected to SQL database:', config.database);
}).catch(err => {
	console.error('Unable to connect to SQL database:', config.database, err);
});

app.use(helmet());
app.use(helmet.frameguard());
app.use(nocache());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

const userRouter = require('./routes/user');

app.use('/', userRouter);

const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

module.exports = app;