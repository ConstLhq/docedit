const TimeContext= require("./timeContext"),
	  PlaceContext=require("./placeContext");

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

function Event(contextarry) {
	this.bg_tc= contextarry[0]? new TimeContext(contextarry[0]):null
	this.bg_pc= contextarry[1]? new PlaceContext(contextarry[1]):null
}

Event.prototype = {
	_cutScene: function(data) {

		/*
		算法思路：
		按照时间和句子标点切割句子切割成[[s1,s2,s3,s4...],[    ],[    ],[   ],[  ]]
		双重循环遍历每个句子，没有空间位置变化则合并为一句，作为一个 时空场景

		//- todo 分段支持
		*/


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
			str = str.replace(/，/g, ',').replace(/,/g, "，<break>");
			//逗号切割
			var toks = str.split("<break>")
			//该自然句不包含时间
			if (s == -1) {
				// 该句使用背景时间
				if (splits.length == 0) {
					var vs = [];
					splits.push(vs);
					times.push(this.bg_tc);
				}
				toks.forEach(function(t) {
					//splits=[[],[],[]...]
					splits[splits.length - 1].push(t)
				})
			} else { //包含时间
				var vs = []
				splits.push(vs);
				var addNew = false; 
				toks.forEach(function(t,index,array) {
					s = t.indexOf(TAG_TIME_BEGIN)
					if (s != -1) { //有时间
						e=t.indexOf(TAG_TIME_END,s + TAG_TIME_BEGIN.length)
						//时间后面一个逗号
						if (e != -1 && e + TAG_TIME_END.length == t.length - 1 && t[t.length-1]=="，")
						{
							// splits.get(splits.size() - 1).add(t);
							// 不是最后一句，此句应与后续句子合为一句
							if (index + 1 < array.length)
							{
								toks[index + 1] = toks[index] + toks[index + 1];
							}
						}else{ //正常情况下，为每个时间开辟新的空间 splits=[[t1,tok1,tok2,...],[t2],[t3]]

						tc = new TimeContext(t.substring(s));
						times.push(tc);
						if (addNew == false) {
							splits[splits.length - 1].push(t);
							addNew = true;
						} else {
							//添加新的 [[]]
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
				//不包含地址的句子合并
				if (s == -1) { 
					local += splits[n][m];
				}
				//包含地点的句子判断包含关系
				else {
					//初试循环时，pc==null
					if (pc != null) { 

						var npc = new PlaceContext(splits[n][m].substr(s));
						// console.log(npc)
						// 检查是否语义变化
						// 暂时比较PlaceContext的值
						if (!npc.isEqual(pc)) {

							var sr = npc.spatialRelation(pc)
							// console.log(sr.toUpperCase())
							if (sr.toUpperCase() != "SR_CONTAIN"){
								
								if (m > 0) {
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
						
						//为pc赋初值
						pc = new PlaceContext(splits[n][m].substr(s));
						local += splits[n][m];
					}
				}
			}
			if (local) {
				var eo = new EventObj();
				eo.content = local;
				//此时 如果仍然 pc==null，说明句子中没有地址则使用 bg_pc
				eo.pc = pc?pc:this.bg_pc;
				if (n < times.length)
					eo.tc = times[n];
				else
					eo.tc = times[times.length - 1];
				nobjs.push(eo);
			}
		}

		this.last_tc=times[times.length - 1]
		this.last_pc=pc
		
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
	},

	getBgContext:function(){
		return [this.last_tc,this.last_pc]
	}
}

module.exports = Event
