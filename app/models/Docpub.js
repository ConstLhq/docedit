const Sequelize = require('sequelize')
const sequelize = require('./ModelBase')

/*
 id      | integer                     | 非空
 title   | text                        | 非空
 content | bytea                       | 非空
 url     | character(300)              | 
 time    | timestamp without time zone | 
*/
var DocPublic = sequelize.define('docpublic', {
	id: {
		type: Sequelize.INTEGER,
		unique: true,
		primaryKey: true
	},
	title: {
		type: Sequelize.STRING,
		allowNull: false
	},
	content: {
		type: Sequelize.BLOB,
		allowNull: false,
	},
	url: {
		type: Sequelize.STRING,
	},
	time: {
		type: Sequelize.DATE
	},

}, {
	timestamps: false,
	freezeTableName: true,
	tableName: 'geodocpublic',
	classMethods: {},
	instanceMethods: {}
});

module.exports = DocPublic;