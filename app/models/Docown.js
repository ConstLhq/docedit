const Sequelize = require('sequelize')
const sequelize = require('./ModelBase')
const Event = require('./Event')

var Docown = sequelize.define('docown', {
	id:{
		type:Sequelize.STRING(50),
		defaultValue: Sequelize.UUIDV4,
		primaryKey: true
	},
	filePath: {
		type: Sequelize.STRING(255)
	},
	originalName: {
		type: Sequelize.STRING(255)
	},
	referenceTime: {
		type: Sequelize.STRING(100)
	},
	sequence: {
		type: Sequelize.BOOLEAN
	},
	type: {
		type: Sequelize.STRING(100)
	},
	rawContent: {
		type: Sequelize.TEXT
	},
	paragraph: {
		type: Sequelize.ARRAY(Sequelize.TEXT)
	},
	matchedSentences: {
		type: Sequelize.ARRAY(Sequelize.TEXT)
	},
	folderName: {
		type: Sequelize.STRING(255)
	}
}, {
	timestamps: false,
	freezeTableName: true,
	tableName: 'geodocown',
});

Docown.hasMany(Event,{as:"events"})

module.exports = Docown;