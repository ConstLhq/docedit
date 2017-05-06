const Sequelize = require('sequelize')
const config = require('../config');
var sequelize = new Sequelize(config.database, config.username, config.password, {
	host: config.host,
	port: config.port,
	dialect: 'postgres',
	pool: {
		max: 10,
		min: 0,
		idle: 30000
	}
});

module.exports = sequelize;