const Sequelize = require('sequelize')
const sequelize = require('./ModelBase')
const Docown = require('./Docown')
const Folder = require('./Folder')
const Event = require('./Event')
crypto = require('crypto');
var User = sequelize.define('user', {
	id:{
		type:Sequelize.UUID,
		unique:true,
		defaultValue: Sequelize.UUIDV4,
		primaryKey: true
	},
	name: {
		type: Sequelize.STRING(255),
		allowNull: false,
		unique: true,
	},
	password: {
		type: Sequelize.STRING(255),
		allowNull: false,
		//密码加密
		set: function(pwd) {
			var cipher = crypto.createCipher('aes192', 'itIsa_54673SaLty');
			var encrypted = cipher.update(pwd, 'utf8', 'hex');
			encrypted += cipher.final('hex')
			this.setDataValue('password', encrypted);
		}
	},
	role: {
		type: Sequelize.INTEGER,
		defaultValue: 0
	},
}, {
	timestamps: false,
	freezeTableName: true,
	tableName: 'geouser',
	instanceMethods: {
		comparePassword: function(_password) {
			var cipher = crypto.createCipher('aes192', 'itIsa_54673SaLty');
			var encrypted = cipher.update(_password, 'utf8', 'hex');
			encrypted += cipher.final('hex')
			if (encrypted === this.getDataValue('password')) {
				return true
			} else
				return false
		}
	}
});
User.hasMany(Folder, {as: "folders"})
User.hasMany(Docown, {as: "docs"})
User.hasMany(Event, {as: "events"})
module.exports = User;