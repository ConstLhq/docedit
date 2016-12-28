const request = require("request"),
	fs = require("fs"),
	entities = require("entities"),
	xml2js = require('xml2js'),
	sync_request = require('sync-request'),
	TimeContext= require("./timeContext"),
	PlaceContext=require("./placeContext")

var xmlParser = new xml2js.Parser({
	attrkey: "_key"
})

function EventObj(eo) {
	if (eo) {
		if (eo.pc != null)
			this.pc = new PlaceContext(eo.pc);
		if (eo.tc != null)
			this.tc = new TimeContext(eo.tc);
		if (eo.content != null)
			this.content = eo.content;
	} else {
		this.pc = null;
		this.tc = null;
		this.content = null;
	}
}

function Event() {}

Event.prototype = {
	_cutScene: function(data) {
		var str = data.replace(/(。|\?|？|\.{6}|\.{3}])/g, "$&<break>")
		var rs = data.replace(/(。|\?|？|\.{6}|\.{3}])/g, "$&<break>").split("<break>")
		var pc = null,
			tc = null,
			TAG_LOC_BEGIN = "<Location",
			TAG_TIME_BEGIN = "<time",
			TAG_TIME_END = "</time>",
			s,
			e,
			objs,
			splits = [],
			times = [],
			str
			//对应原来java代码替换uuid中的冒号为中文冒号的代码
		rs = rs.map(function(_str) {
			//统一中文冒号换成英文冒号
			_str = _str.replace(/：/g, ":")
				//uuid 中的英文冒号换成中文冒号
			_str = _str.replace(/:(?=\d*?@LOC)/g, "：")
				//剩下的英文冒号后添加分隔符|||
			_str = _str.replace(/:/g, "$&|||")
				//还原uuid的冒号
			_str = _str.replace(/：(?=\d*?@LOC)/g, ":")
			return _str
		})
		for (var i = 0; i < rs.length; i++) {
			var str = rs[i]
			var subs = str.split("|||");
			if (subs.length == 2) {

				rs = rs.slice(0, i - 1).concat(subs).concat(rs.slice(i + 1, rs.length))
				str = subs[0];
			}
			s = str.indexOf(TAG_TIME_BEGIN); //<time
			str = str.replace(/，/g, ',').replace(/,/g, ",<break>");
			var toks = str.split("<break>")
			if (s == -1) {
				// 该句继承上句的时间
				if (splits.length == 0) {
					var vs = [];
					splits.push(vs);
					times.push(null);
				}
				toks.forEach(function(t) {
					splits[splits.length - 1].push(t)
				})
			} else {
				var vs = []
				splits.push(vs);
				var addNew = false;
				toks.forEach(function(t,index,array) {
					if ((s = t.indexOf(TAG_TIME_BEGIN)) != -1) {
						
						e=t.indexOf(TAG_TIME_END,s + TAG_TIME_BEGIN.length)
						if (e != -1 && e + TAG_TIME_END.length == t.length - 1 && t[t.length-1]==",")
						{
							// splits.get(splits.size() - 1).add(t);
							// 此句应与后续句子合为一句
							if (index + 1 < array.length)
							{
								toks[index + 1] = toks[index] + toks[index + 1];
							}
						}else{

						tc = new TimeContext(t.substring(s));
						times.push(tc);
						if (addNew == false) {
							splits[splits.length - 1].push(t);
							addNew = true;
						} else {
							var vs = [];
							splits.push(vs);
							splits[splits.length - 1].push(t);
						}
					}
					} else
						splits[splits.length - 1].push(t);
				})
			}
		}
		var nobjs = [];
		var local = "";
		// console.log(splits)

		for (var n = 0; n < splits.length; n++) {
			local = "";
			for (var m = 0; m < splits[n].length; m++) {
				s = splits[n][m].indexOf(TAG_LOC_BEGIN);
				if (s == -1) {
					local += splits[n][m];
				} else {
					if (pc != null) {
						// console.log(pc)
						// console.log("pc!=null")
						var npc = new PlaceContext(splits[n][m].substr(s));
						// console.log(npc)
						// 检查是否语义变化
						// 暂时比较PlaceContext的值
						if (!npc.isEqual(pc)) {

							var sr = npc.spatialRelation(pc)
							// console.log(sr.toUpperCase())
							if (sr.toUpperCase() != "SR_CONTAIN"){
								if (m > 0) {
									// console.log("add")
									// 位置发生变化， 进行切割
									var eo = new EventObj();
									eo.content = local;
									eo.pc = pc;
									if (n < times.length)
										eo.tc = times[n];
									else
										eo.tc = times[times.length - 1];
									nobjs.push(eo);
								}
								local = splits[n][m];
								pc = npc;
							} else
								local += splits[n][m];
						} else
							local += splits[n][m];
					} else {
						// console.log("pc=null")
						// console.log(pc)
						pc = new PlaceContext(splits[n][m].substr(s));
						local += splits[n][m];
					}
				}
			}
			if (local) {

				var eo = new EventObj();
				eo.content = local;
				eo.pc = pc;
				if (n < times.length)
					eo.tc = times[n];
				else
					eo.tc = times[times.length - 1];
				nobjs.push(eo);
			}
		}
		
		var out = "";
		for (var n = 0; n < nobjs.length; n++) {
			
			var eo = nobjs[n];
			if (eo.tc != null) {
				if (eo.pc != null)
					out += '<EVENT timevalue="' + eo.tc.value +  '" lng="' + eo.pc.lng + '" lat="' + eo.pc.lat +  '" locname="'+ eo.pc.origin+'" >' + eo.content.replace(/<\/?.+?>/g,'') + '</EVENT>';
				else
					out += '<EVENT timevalue="' + eo.tc.value + '" >' + eo.content.replace(/<\/?.+?>/g,'') + '</EVENT>';
			} else if (eo.pc != null)
				out += '<EVENT lng="' + eo.pc.lng + '" lat="' + eo.pc.lat +  '" locname="'+ eo.pc.origin+'" >' + eo.content.replace(/<\/?.+?>/g,'') + '</EVENT>';
			else
				out += '<EVENT  >' + eo.content.replace(/<\/?.+?>/g,'') + '</EVENT>';			
		}
		
		return out
	}
}


module.exports = Event

// var eV = new Event()
// var options = {
// 	method: "POST",
// 	url: 'http://geocontext.svail.com:8080/txt',
// 	encoding: "utf-8",
// 	headers: {
// 		'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
// 	},
// 	form: {
// 		req: "parse",
// 		txt: "2015年1月20日，二中院作出执行裁定，按照生效判决，对张曙光的个人财产予以没收包括银行存款和房产。《法制晚报》记者看到，裁定书分八项两部分，一部分是银行存款，其中包括冻结的张曙光的全部银行存款；张曙光妻子名下的存款和张曙光情妇罗菲名下的银行存款。第二部分就是房产，包扣张曙光名下的位于海淀区上河村的一套房产和地下车库，一套位于上海市虹许路的楼房一套，第三套房屋就是位于海淀区蓝靛厂南路的一套房产。第三套房屋在案发前由罗菲居住，二中院作出执行裁定后，罗菲不服，称执行标的物其其名下合法财产，向二中院提出执行异议，请求停止执行涉案房屋。罗菲称，购买涉案房屋的款项大部分是个人还有父母给的，不应归为张曙光的个人财产并予以没收。一审法院判决涉案房屋属于赃物诉二中院审理查明，2014年10月17日，二中院对张曙光作出一审判决，以受贿罪，判处张曙光死刑缓期二年执行，剥夺政治权利终身，并处没收个人全部财产，在案扣押款物予以没收，上缴国库，超出犯罪所得部分作为张曙光的个人财产，并入没收个人全部财产项执行，并附上了清单。在该判决中写明，证人罗某的证言证明：2007年，张曙光给了其280万元，用于购买蓝靛厂南路房产，在判决书后的清单中列明的予以变价所得款予以没收的第26项物品为该套房产。2014年12月16日，市高院对张曙光作出终审裁定，维持二中院一审判决。2015年1月14日，该案被移至二中院执行。2015年12月11日，二中院发出公告，依据生效刑事判决将对查封的涉案房屋进行评估、拍卖，责令房屋所有权人及占有人于2016年1月11日前迁出涉案房屋，到期不履行，将依法强制执行，随后罗菲向二中院提出执行异议。二中院认为，发生法律效力的刑事判决已判明对在案扣押款物予以没收，上缴国库，超出犯罪所得的部分作为张曙光的个人财产，并入没收个人全部财产项执行，且判决书所附的清单中列明有该套涉案房屋，因此该院依生效判决对涉案房屋采取执行措施符合法律规定，罗菲称购买涉案房屋的款项大部分属于其个人及其父母，但是其提交的证据均不足以证明该项主张。且罗菲在张曙光受贿一案中作为证人，明确表示张曙光给其280万元用于购买涉案房屋，故对罗菲的该项主张不予支持。此外，二中院生效刑事判决已认定涉案房屋系涉案赃物，并判决对涉案房屋予以变价，所得款予以没收，罗菲要求停止对涉案房屋的执行，实质上是对执行依据本身存在异议，应当通过申请再审等其他途径解决。综上，罗菲要求对涉案房屋停止执行的异议请求，缺乏事实及法律依据，法院不予支持。二中院裁定驳回案外人罗菲的异议请求。罗菲不服，向市高院提起复议。市高院维持一审裁定驳回复议申请罗菲表示，二中院裁定认定涉案房屋是张曙光案中被执行的财产是错误的。在张曙光案中，罗菲所称张曙光给其钱款数额的供述，不能相互印证，且现金非特定物，无证据证明罗菲用于买房的现金，就是张曙光给其的那笔特定的现金。债权与物权有别，即便要执行，也应当是追回钱款而非没收的该套房屋。此外，在罗菲受贿一案中，市高院终审裁定认定赃款、赃物已全部追缴到案，说明罗菲的其他财产应受到保护，法院也无任何理由执行罗菲的其他财产。二分检对罗菲的相关起诉书中，并没有指控罗菲名下的该套房产。罗菲还提出，作为独生子女，罗菲的父母不吝倾其所有积蓄、出资110余万元帮助女儿购买该套房屋，且一直居住在该房中，如果法院强制执行，则其父母在北京将没有地方居。综上，罗菲请求依法撤销二中院作出的执行裁定书，停止对涉案房产的执行。市高院认为，根据刑法第六十条规定，“犯罪分子违法所得的一切财物，应当予以追缴或者责令退赔，对被害人的合法财产，应当及时返还，违禁品和供犯罪所用的本人财物，应当予以没收，没收的财物和罚金，一律上缴国库，不得挪用和自行处理。”本案涉案房产系已经发生法律效力的二中院（2013）二中刑初字第1530号刑事判决特定物，列为“予以变价所得款予以没收”的扣押款物处理清单，明确作为在案扣押款物予以没收、上缴国库，超出犯罪所得部分作为张曙光的个人财产，并入没收个人全部财产项执行。案外人罗菲于执行程序中认为刑事裁判对涉案财物是否属于赃款赃物认定错误提出异议，实际上是对执行依据本身的异议，应当通过审判监督等程序解决。二中院认为罗某异议请求缺乏事实及法律依据，依法驳回其异议，并无不当，应予维持。2016年11月17日，市高院作出裁定，驳回罗菲的复议申请，维持二中院的执行裁定。",
// 	}
// };
// request(options, function(error, response, body) {
// 	if (!error && response.statusCode == 200) {
// 		var parsedXML = entities.decodeXML(body)

// 		var i = parsedXML.indexOf("<content>");
//         var e = parsedXML.indexOf("</content>");
	            		   				
// 		parsedXML= parsedXML.substring(i+9, e)
// 		eV._cutScene(parsedXML)
// 	}
// })
