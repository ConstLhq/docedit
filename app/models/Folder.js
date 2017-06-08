//文件夹，每个用户可以有多个文件夹
const Sequelize = require('sequelize')
const sequelize = require('./ModelBase')
const Docown = require('./Docown')


var Folder = sequelize.define('folder', {
	id: {
		type: Sequelize.STRING(50),
		unique: true,
		defaultValue: Sequelize.UUIDV4,
		primaryKey: true
	},
	folderName: {
		type: Sequelize.STRING(255),
		allowNull: false
	}
}, {
	timestamps: false,
	freezeTableName: true,
	tableName: 'userfolder',
	classMethods: {},
	instanceMethods: {}
});

Folder.hasMany(Docown,{as:"docs"})

module.exports = Folder;