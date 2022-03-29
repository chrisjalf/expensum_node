const express = require('express');
const app = express();

const models = require("./models");
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.json')[env];

models.sequelize.authenticate().then(() => {
	console.log('Connected to SQL database:', config.database);
}).catch(err => {
	console.error('Unable to connect to SQL database:', config.database, err);
});

const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

module.exports = app;