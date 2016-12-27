'use strict';
angular
	.module('myApp', ["ng-dragable-div", "angularFileUpload", 'frapontillo.bootstrap-switch', "angularBootstrapNavTree", "pageslide-directive", "ngScrollbars", "ui.bootstrap.contextMenu", "toggle-switch", "treeControl"])
	.service("httpService", ["$http", function(http) {
		var groupObj = {};
		var watchedgeoinfo = {};
		var getGroup = function() {
			return http.get('/user/mygroup')
				.success(function(data) {
					return data
				})
				.error(function(data) {
					return {
						"err": "err"
					}
				})
		}
		var postGroup = function(groupname) {
			return http.post('/user/newgroup', {
					"name": groupname
				})
				.success(function(data) {
					return data
				})
				.error(function(data) {
					return data
				})
		}
		var getDoc = function(docid) {
			return http.post('/user/doc', {
					"docid": docid
				})
				.success(function(html) {
					return html
				})
				.error(function(data) {
					return data
				})
		}


		var extract = function(filter, docid) {
			return http.post('/edit/extract', {
					"filter": filter,
					"docid": docid
				})
				.success(function(sentence) {
					return sentence
				})
				.error(function(data) {
					return data
				})
		}

		var geoinfo = function(docid) {
			return http.post('/edit/extract', {
					"filter": [{}],
					"docid": docid
				})
				.success(function(events) {
					watchedgeoinfo = events
				})
				.error(function(data) {
					console.log(data)
				})

			// watchedgeoinfo=[{"lat": 24.886083, "image_url": "http://127.0.0.1:3000/img/kunming.jpg", "lon": 102.839608, "location": "昆明", "thumb": "http://127.0.0.1:3000/thumb/kunming.jpg"}, {"lat": 22.015601, "image_url": "http://127.0.0.1:3000/img/banna.jpg", "lon": 100.803477, "location": "版纳", "thumb": "http://127.0.0.1:3000/thumb/banna.jpg"}, {"lat": 22.175626, "image_url": "http://127.0.0.1:3000/img/yexianggu.jpg", "lon": 100.865759, "location": "野象谷", "thumb": "http://127.0.0.1:3000/thumb/yexianggu.jpg"}, {"lat": 21.857003, "image_url": "http://127.0.0.1:3000/img/daizucunzhai.jpg", "lon": 100.956585, "location": "傣族村寨", "thumb": "http://127.0.0.1:3000/thumb/daizucunzhai.jpg"}, {"lat": 22.033046, "image_url": "http://127.0.0.1:3000/img/yuanshisenlingongyuan.jpg", "lon": 100.881258, "location": "原始森林公园", "thumb": "http://127.0.0.1:3000/thumb/yuanshisenlingongyuan.jpg"}, {"lat": 26.882759, "image_url": "http://127.0.0.1:3000/img/lijiang.jpg", "lon": 100.234432, "location": "丽江", "thumb": "http://127.0.0.1:3000/thumb/lijiang.jpg"}, {"lat": 27.034013, "image_url": "http://127.0.0.1:3000/img/yulongxueshan.jpg", "lon": 100.270093, "location": "玉龙雪山", "thumb": "http://127.0.0.1:3000/thumb/yulongxueshan.jpg"}, {"lat": 26.98274, "image_url": "http://127.0.0.1:3000/img/bingchuandasuodao.jpg", "lon": 100.205666, "location": "冰川大索道", "thumb": "http://127.0.0.1:3000/thumb/bingchuandasuodao.jpg"}, {"lat": 27.131623, "image_url": "http://127.0.0.1:3000/img/lanyuegu.jpg", "lon": 100.251243, "location": "蓝月谷", "thumb": "http://127.0.0.1:3000/thumb/lanyuegu.jpg"}, {"lat": 27.012612, "image_url": "http://127.0.0.1:3000/img/dongbagu.jpg", "lon": 100.267728, "location": "东巴谷", "thumb": "http://127.0.0.1:3000/thumb/dongbagu.jpg"}, {"lat": 25.916365, "image_url": "http://127.0.0.1:3000/img/shuanglang.jpg", "lon": 100.200271, "location": "双廊", "thumb": "http://127.0.0.1:3000/thumb/shuanglang.jpg"}, {"lat": 25.69349, "image_url": "http://127.0.0.1:3000/img/daligucheng.jpg", "lon": 100.170377, "location": "大理古城", "thumb": "http://127.0.0.1:3000/thumb/daligucheng.jpg"}, {"lat": 25.612056, "image_url": "http://127.0.0.1:3000/img/dali.jpg", "lon": 100.27451, "location": "大理", "thumb": "http://127.0.0.1:3000/thumb/dali.jpg"}, {"lat": 25.697499, "image_url": "http://127.0.0.1:3000/img/baizuminju.jpg", "lon": 100.266166, "location": "白族民居", "thumb": "http://127.0.0.1:3000/thumb/baizuminju.jpg"}, {"lat": 25.711798, "image_url": "http://127.0.0.1:3000/img/chongshengsisanta.jpg", "lon": 100.155887, "location": "崇圣寺三塔", "thumb": "http://127.0.0.1:3000/thumb/chongshengsisanta.jpg"}, {"lat": 24.92558, "image_url": "http://127.0.0.1:3000/img/anning.jpg", "lon": 102.484553, "location": "安宁", "thumb": "http://127.0.0.1:3000/thumb/anning.jpg"}, {"lat": 24.823049, "image_url": "http://127.0.0.1:3000/img/shilin.jpg", "lon": 103.332585, "location": "石林", "thumb": "http://127.0.0.1:3000/thumb/shilin.jpg"}]

		}
		var getPath = function() {
			return http.get('/edit/path')
				.success(function(path) {
					return path
				})
				.error(function(data) {
					console.log(data)
				})

			// watchedgeoinfo=[{"lat": 24.886083, "image_url": "http://127.0.0.1:3000/img/kunming.jpg", "lon": 102.839608, "location": "昆明", "thumb": "http://127.0.0.1:3000/thumb/kunming.jpg"}, {"lat": 22.015601, "image_url": "http://127.0.0.1:3000/img/banna.jpg", "lon": 100.803477, "location": "版纳", "thumb": "http://127.0.0.1:3000/thumb/banna.jpg"}, {"lat": 22.175626, "image_url": "http://127.0.0.1:3000/img/yexianggu.jpg", "lon": 100.865759, "location": "野象谷", "thumb": "http://127.0.0.1:3000/thumb/yexianggu.jpg"}, {"lat": 21.857003, "image_url": "http://127.0.0.1:3000/img/daizucunzhai.jpg", "lon": 100.956585, "location": "傣族村寨", "thumb": "http://127.0.0.1:3000/thumb/daizucunzhai.jpg"}, {"lat": 22.033046, "image_url": "http://127.0.0.1:3000/img/yuanshisenlingongyuan.jpg", "lon": 100.881258, "location": "原始森林公园", "thumb": "http://127.0.0.1:3000/thumb/yuanshisenlingongyuan.jpg"}, {"lat": 26.882759, "image_url": "http://127.0.0.1:3000/img/lijiang.jpg", "lon": 100.234432, "location": "丽江", "thumb": "http://127.0.0.1:3000/thumb/lijiang.jpg"}, {"lat": 27.034013, "image_url": "http://127.0.0.1:3000/img/yulongxueshan.jpg", "lon": 100.270093, "location": "玉龙雪山", "thumb": "http://127.0.0.1:3000/thumb/yulongxueshan.jpg"}, {"lat": 26.98274, "image_url": "http://127.0.0.1:3000/img/bingchuandasuodao.jpg", "lon": 100.205666, "location": "冰川大索道", "thumb": "http://127.0.0.1:3000/thumb/bingchuandasuodao.jpg"}, {"lat": 27.131623, "image_url": "http://127.0.0.1:3000/img/lanyuegu.jpg", "lon": 100.251243, "location": "蓝月谷", "thumb": "http://127.0.0.1:3000/thumb/lanyuegu.jpg"}, {"lat": 27.012612, "image_url": "http://127.0.0.1:3000/img/dongbagu.jpg", "lon": 100.267728, "location": "东巴谷", "thumb": "http://127.0.0.1:3000/thumb/dongbagu.jpg"}, {"lat": 25.916365, "image_url": "http://127.0.0.1:3000/img/shuanglang.jpg", "lon": 100.200271, "location": "双廊", "thumb": "http://127.0.0.1:3000/thumb/shuanglang.jpg"}, {"lat": 25.69349, "image_url": "http://127.0.0.1:3000/img/daligucheng.jpg", "lon": 100.170377, "location": "大理古城", "thumb": "http://127.0.0.1:3000/thumb/daligucheng.jpg"}, {"lat": 25.612056, "image_url": "http://127.0.0.1:3000/img/dali.jpg", "lon": 100.27451, "location": "大理", "thumb": "http://127.0.0.1:3000/thumb/dali.jpg"}, {"lat": 25.697499, "image_url": "http://127.0.0.1:3000/img/baizuminju.jpg", "lon": 100.266166, "location": "白族民居", "thumb": "http://127.0.0.1:3000/thumb/baizuminju.jpg"}, {"lat": 25.711798, "image_url": "http://127.0.0.1:3000/img/chongshengsisanta.jpg", "lon": 100.155887, "location": "崇圣寺三塔", "thumb": "http://127.0.0.1:3000/thumb/chongshengsisanta.jpg"}, {"lat": 24.92558, "image_url": "http://127.0.0.1:3000/img/anning.jpg", "lon": 102.484553, "location": "安宁", "thumb": "http://127.0.0.1:3000/thumb/anning.jpg"}, {"lat": 24.823049, "image_url": "http://127.0.0.1:3000/img/shilin.jpg", "lon": 103.332585, "location": "石林", "thumb": "http://127.0.0.1:3000/thumb/shilin.jpg"}]

		}

		var devidePara = function(docid, str) {
			return http.post('/edit/devide', {
					"str": str,
					"docid": docid
				})
				.success(function(newhtml) {
					return newhtml
				})
				.error(function(data) {
					console.log(data)
				})

		}

		var reparse = function(docid) {
			return http.post('/edit/reparse', {
					"docid": docid
				})
				.success(function(events) {
					return events
				})
				.error(function(data) {
					console.log(data)
				})

		}

		return {
			"getGroup": getGroup,
			"postGroup": postGroup,
			"getDoc": getDoc,
			"extract": extract,
			"geoinfo": geoinfo,
			"getGeoInfo": function() {
				return watchedgeoinfo
			},
			"getPath": getPath,
			"devidePara": devidePara,
			"reparse": reparse,
		}
	}])
	.controller('index', ['$scope', function(scope) {}])
	.directive('indexNav', function() {
		return {
			restrict: "EA",
			templateUrl: "indexnav.html",
			replace: false,
		}
	})
	.directive('editNav', function() {
		return {
			restrict: "EA",
			templateUrl: "editnav.html",
			replace: false,
		}
	})
	.controller('edit', ["$scope", "FileUploader", "httpService", "$window", function(scope, FileUploader, httpService, $window) {
		var uploader = scope.uploader = new FileUploader({
			url: '/fileUpload'
		});
		// FILTERS
		uploader.filters.push({
			name: 'filetypeFilter',
			fn: function(item, option) {
				console.log(item)
				var fileType = undefined
				if (item.name.split('.')[1].indexOf("doc") >= 0) {
					fileType = "doc"
				} else if (item.name.split('.')[1].indexOf("txt") >= 0) {
					fileType = "txt"
				} else if (item.name.split('.')[1].indexOf("pdf") >= 0) {
					fileType = "pdf"
				}
				return fileType && item.size < 10 * 1024 * 1024;
			}
		});
		uploader.filters.push({
			name: 'customFilter',
			fn: function(item, options) {
				return this.queue.length < 2;
			}
		});

		scope.my_tree = {}

		uploader.onCompleteItem = function(fileItem, response, status, headers) {

			httpService.postGroup("").success(function(data) {
				scope.state.my_treedata = data;
				console.log(scope.my_treedata)
				//自动展开
				scope.state.expanded_nodes=(function(arr){var temp=[];for(var i =0;i<arr.length;i++){
					temp.push(arr[i])
				}return temp})(data)
	
				//自动打开刚刚上传的文档
				// response中包含文档信息
				scope.state.selectedNode=scope.state.my_treedata[response[0]]["children"][response[1]]
				scope.my_tree_handler(scope.state.selectedNode)
				scope.uploadToggle()
				
			})

		};

		scope.state = {
			"currentview": "文档视图",
			"showdocview": true,
			"nextview": "地图视图",
			"isContentCollapsed": false,
			"uploadChecked": false,
			"filterChecked": false,
			"isEditCollapsed": false,
			"showAddGroupInput": false,
			"my_treedata": [],
			"showTimeLine": false,
			"showGalley": false,
			"ShowAllPoints": true,
			"showTrace": false,
			"results": [],
			"rootKeyWord": "",
			"selectedDocId": "",
			"selectedNode": "",
			"tree_options": {
				nodeChildren: "children",
				dirSelectable: false,
				injectClasses: {
					ul: "a1",
					li: "a2",
					liSelected: "a7",
					iExpanded: "a3",
					iCollapsed: "a4",
					iLeaf: "a5",
					label: "a6",
					labelSelected: "a8"
				}
			},
			"expanded_nodes":[],
			"scrollbarconfig": {
				autoHideScrollbar: false,
				theme: 'light',
				axis: "y",
				advanced: {
					updateOnContentResize: true
				},
				setHeight: 600,
				scrollInertia: 0
			},
			"dictionary": {
				LAT: "经度",
				LNG: "纬度",
				TIME: "时间",
				CONTENT: "事件"
			},

			"leftmenuOptions": [
				['查看', function($itemScope, $event, modelValue, text, $li) {
					$scope.selected = $itemScope.item.name;
				}],
				['下载原文件', function($itemScope, $event, modelValue, text, $li) {
					$scope.selected = $itemScope.item.name;
				}],
				['导出解析json', function($itemScope, $event, modelValue, text, $li) {
					$scope.selected = $itemScope.item.name;
				}],
				['清空解析记录', function($itemScope, $event, modelValue, text, $li) {
					$scope.selected = $itemScope.item.name;
				}],
				['重新解析', function($itemScope, $event, modelValue, text, $li) {
					$scope.selected = $itemScope.item.name;

				}],
				['删除文件', function($itemScope, $event, modelValue, text, $li) {
					$scope.items.splice($itemScope.$index, 1);
				}]
			],
			"middlemenuOptions": [
				[
					function($itemScope, $event, modelValue, text) {
						return "选中部分分段";
					},
					function($itemScope, $event) {
						console.log($window.getSelection().toString())
						httpService.devidePara(scope.state.selectedDocId, $window.getSelection().toString()).success(
							function(newhtml) {
								angular.element('#docContent').html(newhtml)
							})



						//post selection part
					},
					function($itemScope, $event, modelValue, text) {
						return $window.getSelection().toString() != "";
					}
				],
				[
					function($itemScope, $event, modelValue, text) {
						return "重新解析";
					},
					function($itemScope, $event) {
						// console.log($window.getSelection().toString())

						httpService.reparse(scope.state.selectedDocId).success(
							function(newevents) {
								scope.state.results = newevents;
								scope.$apply();
							})

						//post selection part
					},
					function($itemScope, $event, modelValue, text) {
						return true //$window.getSelection().toString() != "";
					}
				],
				[
					function($itemScope, $event, modelValue, text, $li) {
						return "清空解析记录";
					},
					function($itemScope, $event) {

						// post delete the 
					},
					function($itemScope, $event, modelValue, text, $li) {
						return false //$window.getSelection().toString() != "";
					}
				]
			]
		}

		scope.my_treedata = [{
				"label": "默认分组",
				"children": [{
					"label": "首例寨卡.txt",
					"docid": "586200e2e2c43c2c430a5b38"
				}, {
					"label": "首例寨卡.txt",
					"docid": "586200fce2c43c2c430a5b39"
				}, {
					"label": "首例寨卡.txt",
					"docid": "586201a6e2c43c2c430a5b3a"
				}, {
					"label": "首例寨卡.txt",
					"docid": "586201dae2c43c2c430a5b3b"
				}, {
					"label": "首例寨卡.txt",
					"docid": "58620251e2c43c2c430a5b3c"
				}]
			}] //[      {        label: 'North America',        children: [          {            label: 'Canada',            children: ['Toronto', 'Vancouver']          }, {            label: 'USA',            children: ['New York', 'Los Angeles']          }, {            label: 'Mexico',            children: ['Mexico City', 'Guadalajara']          }        ]      }, {        label: 'South America',        children: [          {            label: 'Venezuela',            children: ['Caracas', 'Maracaibo']          }, {            label: 'Brazil',            children: ['Sao Paulo', 'Rio de Janeiro']          }, {            label: 'Argentina',            children: ['Buenos Aires', 'Cordoba']          }        ]      }    ],
		scope.my_tree_handler = function(branch) {
				if (branch.docid) {
					scope.state.selectedDocId = branch.docid
					httpService.getDoc(branch.docid).success(function(html) {
						// angular.element('#docContent div.mCSB_container').html(html.html)
						angular.element('#docContent').html(html.html)
							// scope.state.scrollbarconfig = {
							// 	autoHideScrollbar: true,
							// 	theme: 'dark',
							// 	axis: "y",
							// 	advanced: {
							// 		updateOnContentResize: true
							// 	},
							// 	setHeight: angular.element("#doc").height(),
							// 	scrollInertia: 0
							// }
						httpService.geoinfo(branch.docid)

					})
				}
			}
			//点击地图视图文件列表事件触发函数
			// scope.my_tree_handler_map = function(branch) {
			// 	if (branch.docid) {
			// 		scope.state.selectedDocId = branch.docid
			// 		httpService.geoinfo(branch.docid)

		// 	}
		// }


		scope.submitAddnewGroup = function() {
			httpService.postGroup(scope.state.newGroupName).success(function(data) {
				scope.state.my_treedata = data;
				scope.state.newGroupName = "";
			})
			scope.state.showAddGroupInput = false

		}
		scope.showAddGroupInput = function() {
			scope.state.showAddGroupInput = true
		}
		scope.hideAddGroupInput = function() {
			scope.state.showAddGroupInput = false
		}
		scope.changeView = function() {
			var temp = scope.state.currentview;
			scope.state.currentview = scope.state.nextview;
			scope.state.nextview = temp;
			scope.state.showdocview = !scope.state.showdocview
		}
		scope.collapseContent = function() {
			scope.$broadcast("collapseContent")
		}
		scope.collapseEdit = function() {
			scope.$broadcast("collapseEdit")
		}
		scope.uploadToggle = function() {
			scope.state.uploadChecked = !scope.state.uploadChecked
			httpService.getGroup().success(function(data) {
				scope.state.docGroup = data;
			});
		}
		scope.filterToggle = function() {
			scope.state.filterChecked = !scope.state.filterChecked
		}

		scope.closeTimeLine = function() {
			scope.state.showTimeLine = false;
		}

		scope.$watch(httpService.getGeoInfo, function(points) {
			scope.state.results = points
		})

		scope.extract = function(event) {
			var queryString = scope.state.rootKeyWord

			if (queryString == "") {
				return true
			}
			// else{
			// 	return JSON.stringify(event).indexOf("湖南")!=-1
			// }
			else {
				var queryFilters = queryString.replace(/[+-\/]/g, "###$&").split("###")
				var filter = [{
					keyword: queryFilters.shift()
				}]
				var additionalFilter;
				for (var i = 0; i < queryFilters.length; i++) {
					additionalFilter = queryFilters.map(function(item) {
						switch (item[0]) {
							case "+":
								return {
									logic: "+",
									keyword: item.slice(1, item.length)
								}
							case "-":
								return {
									logic: "-",
									keyword: item.slice(1, item.length)
								}
							case "/":
								return {
									logic: "/",
									keyword: item.slice(1, item.length)
								}
						}
					})

				}
				var _filterResult = JSON.stringify(event).indexOf(filter[0].keyword) != -1
				if (!additionalFilter) {
					console.log(filter.keyword)
					return _filterResult
				} else {
					for (var i = 0; i < additionalFilter.length; i++) {
						switch (additionalFilter[i].logic) {
							case "+":
								_filterResult = _filterResult && JSON.stringify(event).indexOf(additionalFilter[i].keyword) != -1
								break;

							case "-":
								_filterResult = _filterResult && JSON.stringify(event).indexOf(additionalFilter[i].keyword) == -1
								break;

							case "/":
								_filterResult = _filterResult || JSON.stringify(event).indexOf(additionalFilter[i].keyword) != -1
								break;
						}

					}

				}
				return _filterResult;
			}
		}


		// scope.$watch(function(){return scope.state.showTrace},function(){
		// 	httpService.getPath().success(function(path))
		// })

	}])
	.directive("docPanels", function() {
		return {
			restrict: "EA",
			templateUrl: "docview.html",
			replace: false,
			link: function(scope, element, attrs) {
				var instance = Split(['#content', "#doc", "#result"], {
					minSize: [200, 500, 500],
					gutterSize: 6
				})
				instance.setSizes([16, 42, 42])
				scope.$on("collapseContent", function() {
					if (scope.state.isEditCollapsed) {
						if (scope.state.isContentCollapsed) {
							instance.setSizes([16, 84, 0])
						} else {
							instance.collapse(0)
						}
					} else {
						if (scope.state.isContentCollapsed) {
							instance.setSizes([16, 42, 42])
						} else {
							instance.collapse(0)
						}
					}
					scope.state.isContentCollapsed = !scope.state.isContentCollapsed
				})
				scope.$on("collapseEdit", function() {
					if (scope.state.isContentCollapsed) {
						if (scope.state.isEditCollapsed) {
							instance.setSizes([16, 42, 42])
							instance.collapse(0)
						} else {
							instance.collapse(2)
						}
					} else {
						if (scope.state.isEditCollapsed) {
							instance.setSizes([16, 42, 42])
						} else {
							instance.collapse(2)
						}
					}
					scope.state.isEditCollapsed = !scope.state.isEditCollapsed
				})
			}
		}
	})
	.directive("mapPanels", function() {
		return {
			restrict: "EA",
			templateUrl: "mapview.html",
			replace: false,
		}
	})
	.directive("filterForm", function() {
		return {
			restrict: "EA",
			templateUrl: "filter.html",
		}
	})
	.directive("filterResult", function() {
		return {
			restrict: "EA",
			templateUrl: "filter-result.html",
		}
	})
	.directive("mapView", ["httpService", function(httpService) {
		return {
			restrict: "EA",
			templateUrl: "mapview.html",
			link: function(scope, element, attrs) {
				var resize = function() {
					var $map = $('#map');
					$map.height($(window).height() - $('nav').height());
					if (map) {
						map.invalidateSize();
					}
				};
				$(window).on('resize', function() {
					resize();
				});
				resize();

				var normal_layer = L.tileLayer.chinaProvider('GaoDe.Normal.Map', {
						maxZoom: 18,
						minZoom: 5
					}),
					sate_layer = L.tileLayer.chinaProvider('GaoDe.Satellite.Map', {
						maxZoom: 18,
						minZoom: 5
					}),
					imga = L.tileLayer.chinaProvider('GaoDe.Satellite.Annotion', {
						maxZoom: 18,
						minZoom: 5
					});
				var map = L.map('map', {
					maxZoom: 18,
					minZoom: 5
				}).setView([30.8282, 112.5795], 5);
				normal_layer.addTo(map)

				var layerControl = new L.Control.Layers({
					'标准底图': normal_layer
				});
				layerControl.addTo(map);
				layerControl.addOverlay(sate_layer, '卫星图');
				layerControl.addOverlay(imga, "注记");
				var sidebar = L.control.sidebar('sidebar', {
					position: 'left'
				}).addTo(map);

				//显示文档中的点
				/*
				 @param ：points:[{content:"string",latlng:"39.222,115.484",time:"1991-12-06"},...]
				*/

				var pointLayer = new L.MarkerDataLayer([], {
					recordsField: null,
					locationMode: L.LocationModes.LATLNG,
					latitudeField: 'LAT',
					longitudeField: 'LNG',
					layerOptions: {
						fill: false,
						stroke: false,
						weight: 0,
						color: 'rgb(255,85,34)'
					},
					filter: function(record) {
						return true;
					},
					setIcon: function(record, options) {
						var html = '<div><i class="fa fa-map-marker"></i><span class="code"></span></div>';
						var $html = $(html);
						var $i = $html.find('i');

						L.StyleConverter.applySVGStyle($i.get(0), options);

						var size = 36

						$i.width(size);
						$i.height(size);
						$i.css('font-size', size + 'px');
						$i.css('line-height', size + 'px');

						var $code = $html.find('.code');

						$code.width(size);
						$code.height(size);
						$code.css('line-height', size + 'px');
						$code.css('font-size', size / 3 + 'px');
						$code.css('margin-top', -size / 2 + 'px');

						var icon = new L.DivIcon({
							iconSize: new L.Point(size, size),
							iconAnchor: new L.Point(size / 2, size / 2),
							className: 'airport-icon',
							html: $html.wrap('<div/>').parent().html()
						});

						return icon;
					},

					onEachRecord: function(layer, record) {

						layer.on('click', function() {
							console.log("you clicked the icon")
							$("#popupinfo").empty();
							$("#popupinfo").append($(L.HTMLUtils.buildLocaneTable(record, scope.state.dictionary, '', ["content", "start", "id"])).wrap('<div/>').parent().html());
							scope.state.showGalley = true
							scope.$apply()
						});
					}
				});

				map.addLayer(pointLayer);
				// layerControl.addOverlay(pointLayer, '全部位置');
				/////////////////////////////////
				///////////////////////////////
				////////////////////////////
				//////////////////////////
				// var getLocation = function(context, locationField, fieldValues, callback) {
				// 	var location;
				// 	var latlng = new L.latLng(fieldValues[0][0], fieldValues[0][1])
				// 	location = {
				// 		location: latlng,
				// 		text: "name",
				// 		center: latlng
				// 	};
				// 	return location;
				// };
				// var sizeFunction = new L.LinearFunction([1, 16], [253, 48]);
				// var goptions = {
				// 	recordsField: null,
				// 	locationMode: L.LocationModes.CUSTOM,
				// 	fromField: 'from',
				// 	toField: 'to',
				// 	codeField: null,
				// 	getLocation: getLocation,
				// 	getEdge: L.Graph.EDGESTYLE.ARC,
				// 	includeLayer: function(record) {
				// 		return true;
				// 	},
				// 	layerOptions: {
				// 		fill: false,
				// 		opacity: 1,
				// 		weight: 4,
				// 		fillOpacity: 1.0,
				// 		distanceToHeight: new L.LinearFunction([0, 0], [100, 50]),
				// 		markers: {
				// 			end: true
				// 		},
				// 		mode: 'Q'
				// 	},
				// 	tooltipOptions: {
				// 		iconSize: new L.Point(200, 100),
				// 		iconAnchor: new L.Point(-5, 64),
				// 		className: 'leaflet-div-icon line-legend'
				// 	},
				// 	displayOptions: {
				// 		cnt: {
				// 			weight: new L.LinearFunction([0, 3], [10, 20]),
				// 			color: new L.HSLHueFunction([0, 200], [125, 330], {
				// 				outputLuminosity: '60%'
				// 			}),
				// 			 displayName: '轨迹',
				// 		},
				// 		info: {
				// 			displayName: "说明",
				// 			displayText: function(x) {
				// 				return x
				// 			}
				// 		}

				// 	}
				// };

				// scope.$watch(function() {
				// 	return scope.state.showTrace
				// }, function(b) {
				// 	if (b) {
				// 		httpService.getPath().success(function(path) {
				// 			var arclayer = new L.Graph(path, goptions)
				// 			arclayer.addTo(map)
				// 		})
				// 	} else {
				// 		try {
				// 			arclayer.clearLayers()
				// 		} catch (err) {
				// 			console.log(err);
				// 		}

				// 	}
				// })


				////////////////////////////////////
				///////////////////////////////////
				/////////////////////////////////////
				/////////////////////////////////////

				scope.$watch(httpService.getGeoInfo, function(points) {

					scope.state.allPoints = points

					if (scope.state.ShowAllPoints) {
						pointLayer.clearLayers();
						pointLayer.addData(points);
					}
				});

				scope.$watch(function() {
					return scope.state.ShowAllPoints
				}, function(showallpts) {


					if (scope.state.ShowAllPoints) {

						pointLayer.clearLayers();
						pointLayer.addData(scope.state.allPoints);

					} else {

						pointLayer.clearLayers()
					}

				});
				scope.$on("e_tl_selected", function(e, d) {
					scope.state.ShowAllPoints = false;
					scope.state.showGalley = true
					scope.$apply()
					pointLayer.clearLayers();
					pointLayer.addData(d);
					$("#popupinfo").empty();
					$("#popupinfo").append($(L.HTMLUtils.buildLocaneTable(d[0], scope.state.dictionary, '', ["content", "start", "id"])).wrap('<div/>').parent().html());
					map.setView([d[0].LAT, d[0].LNG], 6);

				})

			}
		}
	}])
	.directive('timeLine', ['httpService', function(httpService) {
		return {
			restrict: 'EA',
			replace: true,
			template: '<div></div>',
			link: function(scope, element, attrs) {
				var container = document.getElementById('timeline');
				var items = new vis.DataSet();
				var options = {
					// Set global item type. Type can also be specified for items individually
					// Available types: 'box' (default), 'point', 'range', 'rangeoverflow'
					type: 'point',
					showMajorLabels: false,
					height: 256,
				};

				var timeline = new vis.Timeline(container, items, options)
				var onSelect = function(properties) {
					var selected = timeline.getSelection();
					if (selected.length > 0) {
						var item = selected[0]
						scope.$emit("e_tl_selected", [items.get(item)])
					}
				};

				// Add a listener to the select event
				timeline.on('select', onSelect);

				var drawTimeLine = function(data) {
					items.clear();
					items.add(data)
					timeline.fit();
				}

				scope.$watch(httpService.getGeoInfo, function(points) {

					if (points instanceof Array) {

						moment.locale("zh-cn")

						var validTime = points.filter(function(p) {
							return moment(p.TIME).isValid()
						})


						var standard = validTime.map(function(p) {
							return {
								start: moment(p.TIME).format(),
								content: p.TIME,
								LNG: p.LNG,
								LAT: p.LAT,
								CONTENT: p.CONTENT,
								TIME: p.TIME,
							}
						})
						drawTimeLine(standard);

					}
				})

			}

		}
	}])