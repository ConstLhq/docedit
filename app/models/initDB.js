const User = require('./User'),
	  Folder = require('./Folder'),
	  Docown = require('./Docown'),
	  Event = require('./Event'),
	  Docpub = require('./Docpub');

module.exports =(async()=>{
	await User.sync({force: true});
	await Folder.sync({force: true});
	await Docown.sync({force: true});
	await Event.sync({force: true});
	await Docpub.sync({force: true});
	console.log("初始化数据表完成！")
})()
 
 