const xml2js = require('xml2js'),
	 xmlParser = new xml2js.Parser({
	attrkey: "_key"
});
	 
function TimeContext(tc) {
	var that = this
	if (!tc) {
		return;
	}
	if (typeof tc === "string") {
		xmlParser.parseString(tc, function(err, result) {
			that.origin = result.time._
			that.value = result.time._key.value
		})
	} else {
		for (var n = 0; n < that.time.length; n++) {
			that.time[n] = tc.time[n];
		}
		that.localtime = tc.localtime || null;
		that.origin = tc.origin || null;
		that.value = tc.value || null;
	}
}
TimeContext.prototype = {
	TIME_EQUAL: 0, // 时间a与b相同
	TIME_BEFORE: 1, // 时间a早于b
	TIME_AFTER: 2, // 时间a晚于b
	TIME_UNCOMPARIBLE: 3, // 时间a和b不可比较
	time: [-1, -1, -1, -1, -1, -1],
	// time[0] - year
	// time[1] - month
	// time[2] - day
	// time[3] - hour
	// time[4] - minitue
	// time[5] - second
	localtime: null, //	例如：上午, 下午
	origin: null,
	value: null,
}
Object.defineProperties(TimeContext.prototype, {
	isEqual: {
		value: function(tc) {
			for (var n = 0; n < this.time.length; n++) {
				if (this.time[n] != tc.time[n])
					return false;
			}
			if (this.localtime !== null && tc.localtime !== null) {
				return this.localtime.toUpperCase() == tc.localtime.toUpperCase()
			} else if (this.localtime == null && tc.localtime == null) {
				return true
			} else {
				return false
			}
		}
	},
	compare: {
		value: function(tc) {
			for (var n = 0; n < this.time.length; n++) {
				if (this.time[n] != tc.time[n] && (this.time[n] == -1 || tc.time[n] == -1)) {
					return TIME_UNCOMPARIBLE;
				}
				if (this.time[n] > tc.time[n])
					return TIME_AFTER;
				else if (this.time[n] < tc.time[n])
					return TIME_BEFORE;
			}
			/* 此处增加时间定性描述的比较  */
			if (this.localtime == null && tc.localtime == null)
				return TIME_EQUAL;
			else if (this.localtime == null) {
				/* 临时解决方案, 应根据实际情况补充及修改 */
				/* 前几/*年, 前几/*月, 前几/*周,  前几/*天, 前一段时间 等模式, 枚举，及探测其表达模式*/
				if (this.localtime.indexOf("前") != -1)
					return TIME_BEFORE;
				if (this.localtime.indexOf("后") != -1)
					return TIME_AFTER;
				return TIME_UNCOMPARIBLE;
			} else if (tc.localtime == null) {
				/* 前几/*年, 前几/*月, 前几/*周,  前几/*天, 前一段时间 等模式, 枚举，及探测其表达模式*/
				if (tc.localtime.indexOf("前") != -1)
					return TIME_AFTER;
				if (tc.localtime.indexOf("后") != -1)
					return TIME_BEFORE;
				return TIME_UNCOMPARIBLE;
			} else {
				if (this.localtime.equalsIgnoreCase(tc.localtime))
					return TIME_EQUAL;
				else
					return TIME_UNCOMPARIBLE;
			}
		}
	}
})

module.exports =TimeContext