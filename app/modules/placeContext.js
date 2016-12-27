const request = require("request"),
	fs = require("fs"),
	entities = require("entities"),
	xml2js = require('xml2js'),
	sync_request = require('sync-request')

var xmlParser = new xml2js.Parser({
	attrkey: "_key"
})

function PlaceContext(npc) {
	//根据input 类型执行不同构造函数
	var that = this
	if (typeof npc === "string") {
		xmlParser.parseString(npc, function(err, result) {
			that.origin = result.Location._
			Object.keys(result.Location._key).forEach(function(key) {
					that[key] = result.Location._key[key] || null
				})
		})
	} else {
		if (npc == null) return;
		else {
			var keys = Object.keys(npc.prototype)
			keys.forEach(function(key) {
				that[key] = npc[key] || null
			})
		}
	}
};
PlaceContext.prototype = {
	province: null,
	city: null,
	county: null,
	town: null,
	lng: NaN,
	lat: NaN,
	uuid: null,
	grade: null,
	origin: null,
};
Object.defineProperties(PlaceContext.prototype, {
	isEqual: {
		value: function(pc) {
			return pc.lat === this.lat && pc.lng === this.lng
		}
	},
	spatialRelation: {
		value: function(pc) {
			var url = "http://geocontext.svail.com:8080/txt"
			var options = {
				qs: {
					req: "gir",
					api: "slr",
					a: pc.uuid.replace("：", ":"),
					b: this.uuid.replace("：", ":"),
				}
			};
			var res = sync_request('GET', url, options)
			return JSON.parse(res.getBody("utf8")).status
		}
	}
})
module.exports=PlaceContext