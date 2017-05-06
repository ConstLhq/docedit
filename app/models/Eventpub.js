const Sequelize = require('sequelize')
const sequelize = require('./ModelBase')



/*
 id         | integer                     | 非空
 content    | text                        | 非空
 lochint    | character varying(600)      | 
 start_time | timestamp without time zone | 
 end_time   | timestamp without time zone | 
 timehint   | character varying(600)      | 
 topic      | character varying(2048)     | 
 tag        | character varying(500)      | 
 docid      | integer                     | 非空
 geoloc     | geometry(MultiPoint,4326)   | 

*/
var Eventpub = sequelize.define('eventpub', {
	id: {
		type:Sequelize.UUID,
		defaultValue: Sequelize.UUIDV4,
		primaryKey: true
	},
	content: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	lochint: {
		type: Sequelize.STRING(600),
	},
	start_time: {
		type: Sequelize.DATE
		// defaultValue: Sequelize.NOW
	},
	end_time: {
		type: Sequelize.DATE
		// type: Sequelize.DATE
		// defaultValue: Sequelize.NOW
	},
	timehint: {
		type: Sequelize.STRING(600)

	},
	topic: {
		type: Sequelize.STRING(2048)
	},
	tag: {
		type: Sequelize.STRING(500)
	},
	geoloc: {
		type: Sequelize.GEOMETRY("MultiPoint",4326)
	},

}, {
	timestamps: false,
	freezeTableName: true,
	tableName: 'geoeventpub',
	classMethods: {},
	instanceMethods: {}
});

module.exports = Eventpub;