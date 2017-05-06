'use strict';
angular
	.module('underscore', [])
	.factory('_', ['$window', function($window) {
		return $window._; // assumes underscore has already been loaded on the page
	}]);
angular
	.module('myApp', ["ng-dragable-div", "angularFileUpload", 'frapontillo.bootstrap-switch', "angularBootstrapNavTree", "pageslide-directive", "ngScrollbars", "toggle-switch", "treeControl", 'ngSanitize', 'ngCsv', 'ui-notification', 'ngMaterial', 'ngMessages', 'underscore'])
	.config(function(NotificationProvider) {
		NotificationProvider.setOptions({
			delay: 3000,
			startTop: 20,
			startRight: 10,
			verticalSpacing: 20,
			horizontalSpacing: 20,
			positionX: 'center',
			positionY: 'top'
		});
	})

.service("httpService", ["$http", function(http) {
		var groupObj = {};
		var watchedgeoinfo = [];
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
				.success(function(paras) {
					return paras
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

		var extractPub = function(filter, docid) {
			return http.post('/edit/public/extract', {
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

		var getDocPub = function(docid) {
			return http.post('/public/doc', {
					"docid": docid
				})
				.success(function(paras) {
					return paras
				})
				.error(function(data) {
					return data
				})
		}

		var getEventPub = function(docid) {
			return http.post('/edit/public/extract', {
					"docid": docid,
					"filter": [{}],
				})
				.success(function(events) {
					return events
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
		}

		var getPath = function() {
			return http.get('/edit/path')
				.success(function(path) {
					return path
				})
				.error(function(data) {
					console.log(data)
				})
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

		var downloadFile = function(docid) {
			return http.get('/edit/downloadfile/' + docid)
				.success(function(file) {
					return file
				})
				.error(function(data) {
					console.log(data)
				})

		}
		var mapnikTile = function(url, options) {
			return http.post(url, options)
				.success(function(data) {
					return data
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
			"downloadFile": downloadFile,
			"mapnikTile": mapnikTile,
			"getDocPub": getDocPub,
			"extractPub": extractPub
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

.controller('edit', ["$scope", "FileUploader", "httpService", "$window", "$filter", "Notification", "$mdDialog","_" ,function(scope, FileUploader, httpService, $window, $filter, Notification, $mdDialog,_) {
		var uploader = scope.uploader = new FileUploader({
			url: '/fileUpload'
		});
		// FILTERS
		uploader.filters.push({
			name: 'filetypeFilter',
			fn: function(item, option) {
				var fileType = undefined
				if (item.name.split('.')[1].indexOf("docx") >= 0) {
					fileType = "docx"
				} else if (item.name.split('.')[1].indexOf("txt") >= 0) {
					fileType = "txt"
				} else if (item.name.split('.')[1].indexOf("pdf") >= 0) {
					fileType = "pdf"
				}
				var accept = fileType && item.size < 10 * 1024 * 1024;
				if (!accept) {
					//notify
					Notification.primary({
						message: '<h4>支持文件类型：<ul><li><h4>*.txt</h4></li><li><h4>*.docx</h4></li></h4>',
						title: '<h4>请重新选择文件</h4>'
					})
				}
				return accept
			}
		});
		uploader.filters.push({
			name: 'customFilter',
			fn: function(item, options) {
				return this.queue.length < 5;
			}
		});

		uploader.onCompleteItem = function(fileItem, response, status, headers) {

			httpService.postGroup("").success(function(data) {
				scope.state.my_treedata = data;
				console.log(scope.my_treedata)
					//自动展开
				scope.state.expanded_nodes = data
					//  (function(arr) {
					// 	var temp = [];
					// 	for (var i = 0; i < arr.length; i++) {
					// 		temp.push(arr[i])
					// 	}
					// 	return temp
					// })(data)

				//自动打开刚刚上传的文档
				// response中包含文档信息
				scope.state.selectedNode = scope.state.my_treedata[response[0]]["children"][response[1]]
				scope.my_tree_handler(scope.state.selectedNode)
				angular.element('#uploadModal').modal('hide')

			})

		};
		uploader.onAfterAddingFile = function(fileItem) {
			console.log("sdfa")
			console.log(scope.uploader.queue[0])
			scope.uploader.queue[0].formData.push({
				docGroup: scope.state.groupOptions[scope.state.groupOptions.length - 1]
			})
		}

		scope.params = {
			type: 'sci',
			group: "默认分组"

		}

		scope.state = {
			"showMapView": false,
			"isContentCollapsed": false,
			"uploadChecked": false,
			"filterChecked": false,
			"isEditCollapsed": false,
			"showAddGroupInput": false,
			"my_treedata": [],
			"showTimeLine": false,
			"showGalley": false,
			"MultiDocument": false,
			"usePubDB": false,
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
				},
				isLeaf: function(node) {
					return !node.hasOwnProperty("children")
				}
			},
			"expanded_nodes": [],
			"dictionary": {
				lat: "经度",
				lng: "纬度",
				time: "时间",
				loc: "地点",
				content: "事件",
				$$hashKey: "编号"

			},


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
			],

		}

		scope.my_treedata = []
		scope.my_tree_handler = function(branch) {

			//记录
			if (branch.docid) {
				scope.state.selectedDocId = branch.docid
				httpService.getDoc(branch.docid).success(function(paras) {

					// angular.element('#docContent').html(html.html)
					scope.state.paragraphs = paras.paragraph.map(function(pas) {
						return {
							data: pas,
							selected: false,
						}
					})
					httpService.geoinfo(branch.docid)

				})
			}
		}

		scope.cancel = function() {
			$mdDialog.hide();
		}

		scope.showUpload = function(ev) {
			$mdDialog.show({
				contentElement: '#uploaderDialog',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: true,
				fullscreen: false
			})
		};

		scope.leftmenuOptions = function(nod) {
				if (nod.hasOwnProperty("children")) {
					return [
						['删除文件夹', function($itemScope, $event, modelValue, text, $li) {
							scope.state.selectedNode = nod;
						}]
					];
				} //folder
				else {

					return [

						['查看', function($itemScope, $event, modelValue, text, $li) {
							scope.state.selectedNode = nod;
						}],
						['下载原文件', function($itemScope, $event, modelValue, text, $li) {
							// httpService.downloadFile(nod.docid).success(function(file){return file})
							$window.open('/edit/downloadfile/' + nod.docid)
						}],
						['导出解析csv', function($itemScope, $event, modelValue, text, $li) {
							$scope.selected = $itemScope.item.name;
						}],
						['修改属性', function($itemScope, $event, modelValue, text, $li) {

							//弹出修改属性的窗口
							scope.state.selectedNode = nod;
							scope.params.type = scope.state.selectedNode.type;
							scope.params.group = "默认分组";
							scope.params.time = new Date(scope.state.selectedNode.time);
							(function(ev) {
								$mdDialog.show({
									contentElement: '#modifyDialog',
									parent: angular.element(document.body),
									targetEvent: ev,
									clickOutsideToClose: true,
									fullscreen: false
								})
							})($event)

						}],
						['删除文件', function($itemScope, $event, modelValue, text, $li) {
							$scope.items.splice($itemScope.$index, 1);
						}]
					]

				}


			},

			scope.submitAddnewGroup = function() {
				httpService.postGroup(scope.state.newGroupName).success(function(data) {
					scope.state.my_treedata = data;
					scope.state.groupOptions = data.map(function(folder){
						return folder.label
					})
					scope.state.newGroupName = "";
				})
				scope.state.showAddGroupInput = false

			}
		scope.exportEmptyWarning = function() {
			return !scope.state.results.some(function(item) {
				return item.selected == true
			})
		}
		scope.showAddGroupInput = function() {
			scope.state.showAddGroupInput = true
		}
		scope.hideAddGroupInput = function() {
			scope.state.showAddGroupInput = false
		}
		scope.collapseContent = function() {
			scope.$broadcast("collapseContent")
		}
		scope.collapseEdit = function() {
			scope.$broadcast("collapseEdit")
		}
		scope.initGroup = function() {

			httpService.getGroup().success(function(data) {
				scope.state.groupOptions = data;
			});

		}
		scope.initModifyDialog = function() {
			scope.params.type = scope.state.selectedNode.type
			scope.params.referenceTime = new Date(scope.state.selectedNode.referenceTime)
				// scope.params.group=scope.state.selectedNode.group
		}
		scope.initDate = function(form) {
			form.docDate = new Date()
		}
		scope.filterToggle = function() {
			scope.state.filterChecked = !scope.state.filterChecked
		}
		scope.selectAll = function() {
				scope.state.selectAll = !scope.state.selectAll
				var filteredResult = $filter('filter')(scope.state.results, scope.extract, true)
					// console.log(filteredResult)
				filteredResult.map(function(item) {
					item.selected = scope.state.selectAll

				})
			}
			//搜文档 功能匹配
		scope.getMatchesDoc = function(searchtext) {
				console.log(scope.state.my_treedata)

				var candidate = new Array()
				scope.state.my_treedata.forEach(function(grp, g) {
					if (grp.hasOwnProperty("children")) {
						candidate = candidate.concat(grp.children.map(function(doc, t) {
							return doc
						}))
					}
				})
				console.log(candidate)

				return $filter('filter')(candidate, function(doc) {
					return doc.label.indexOf(searchtext) != -1
				}, true)
			}
			// 搜文档 选择回调
		scope.selectDocChange = function() {
			//展开文档所在分组
			if (!scope.state.my_treedata[scope.state.selectedNode.grtu[0]] in scope.state.expanded_nodes) {

				scope.state.expanded_nodes.push(scope.state.my_treedata[scope.state.selectedNode.grtu[0]])
			}
			scope.state.selectedNode = scope.state.my_treedata[scope.state.selectedNode.grtu[0]]["children"][scope.state.selectedNode.grtu[1]]
			scope.my_tree_handler(scope.state.selectedNode)

		}


		scope.paraSelChange = function(index) {
			if (scope.state.paragraphs[index].selected) {
				// 将其它段落设置为非选中状态
				scope.state.paragraphs.forEach(function(pas, index_) {
						if (index != index_) {
							pas.selected = false
						}
					})
					//段落包含事件选中
				scope.state.results.forEach(function(re) {
					re.selected = re.fromparagraph == index
				})

			} else {
				scope.state.results.forEach(function(re) {
					if (re.fromparagraph == index) {
						re.selected = false
					}
				})
			}
		}
		scope.closeTimeLine = function() {
			scope.state.showTimeLine = false;
		}
		scope.test = function() {
			console.log(scope.node)
		}

		scope.$watch(httpService.getGeoInfo, function(points) {
			scope.state.results = points
		})

		scope.extract = function(event) {
			// 条件 筛选函数 
			var queryString = scope.state.rootKeyWord
			if (queryString == "") {
				return true
			} else {
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

					// 场景：全选状态下，条件改变时，将不再符合的结果取消选中
					if (!_filterResult) {
						event.selected = false;
					}
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
				if (!_filterResult) {
					event.selected = false;
				}
				return _filterResult;
			}
		}

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
	.directive("mapView", ["httpService", "Notification", "_", function(httpService, Notification, _) {
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
					minZoom: 0
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

				var templateMapConfig = function() {
					this.mapConfig = {
						version: "1.2.0",
						layers: [{
							type: "mapnik",
							options: {
								// sql: "select * from geoevent",
								geom_column: "geoloc",
								cartocss: "#ne_10m_populated_p_2{ marker-fill: #F11810; marker-opacity: 0.9; marker-allow-overlap: true; marker-placement: point; marker-type: ellipse; marker-width: 7.5; marker-line-width: 2; marker-line-color: #000; marker-line-opacity: 0.2; }",
								cartocss_version: "2.3.0",
								srid: 4326,
								// "interactivity": ["id", "content"]
							}
						}]
					}
				}
				templateMapConfig.prototype.customConfig = function(sql, geom_column, interactivity = ["id"]) {
					var that = this
					this.mapConfig = _.extend(that.mapConfig, {
						layers: [_.extend(that.mapConfig.layers[0], {
							options: _.extend(that.mapConfig.layers[0].options, {
								sql: sql,
								geom_column: geom_column,
								interactivity: interactivity
							})
						})]
					})
					return this
				};

				var TileFactory = function() {
					this.MultiAndPubDocumentTile = function() {
						//多文档，公共库
						var baseUrl = "http://localhost:4000/database/geodata/layergroup",
							sql = "select * from village",
							geom_column = "geom",
							interactivity = ["gid"],
							mapConfig = new templateMapConfig().customConfig(sql, geom_column, interactivity);
						httpService.mapnikTile(baseUrl, mapConfig.mapConfig).success(function(data) {
							console.info("Success: " + JSON.stringify(data));
							setMap(baseUrl + "/" + data.layergroupid, data.metadata);
						});
					}
					this.SingleAndPubDocumentTile = function() {
						//单文档，公共库
						var baseUrl = "http://localhost:4000/database/geodata/layergroup",
							interactivity = ["gid"],
							geom_column = "geom",
							sql = "select * from village",
							mapConfig = new templateMapConfig().customConfig(sql, geom_column, interactivity);
						httpService.mapnikTile(baseUrl, mapConfig.mapConfig).success(function(data) {
							console.info("Success: " + JSON.stringify(data));
							setMap(baseUrl + "/" + data.layergroupid, data.metadata);
						});
					}
					this.MultiAndPrivateDocumentTile = function() {
						//多文档，私有库
						var baseUrl = "http://localhost:4000/database/testdb/layergroup",
							interactivity = ["id"],
							geom_column = "geoloc",
							sql = "select * from geoevent",
							mapConfig = new templateMapConfig().customConfig(sql, geom_column, interactivity);
						httpService.mapnikTile(baseUrl, mapConfig.mapConfig).success(function(data) {
							console.info("Success: " + JSON.stringify(data));
							setMap(baseUrl + "/" + data.layergroupid, data.metadata);
						});

					}
					this.SingleAndPrivateDocumentTile = function() {
						//单文档，私有库
						var baseUrl = "http://localhost:4000/database/testdb/layergroup",
							interactivity = ["id"],
							geom_column = "geoloc",
							sql = "select * from geoevent where \"docownId\" =" + "\'" + scope.state.selectedDocId + "\'",
							mapConfig = new templateMapConfig().customConfig(sql, geom_column, interactivity);
						httpService.mapnikTile(baseUrl, mapConfig.mapConfig).success(function(data) {
							console.info("Success: " + JSON.stringify(data));
							setMap(baseUrl + "/" + data.layergroupid, data.metadata);
						});
					}
				}
				var TileFactoryObj = new TileFactory();
				var layers = [];
				var setMap = function(Urltoken, metadata) {
					metadata = metadata || {};
					var metadataLayers = metadata.layers || [];
					layers.forEach(function(layer) {
						map.removeLayer(layer)
						layerControl.removeLayer(layer)
					});
					layers = [];
					var tileLayer = new L.tileLayer(Urltoken + '/{z}/{x}/{y}.png');
					metadataLayers.forEach(function(layer, layerIndex) {
						var utfGridLayer = new L.UtfGrid(Urltoken + '/' + layerIndex + '/{z}/{x}/{y}.grid.json?callback={cb}');
						utfGridLayer.on('click', function(e) {
							if (e.data) {
								console.log('click', e.data);
							} else {
								console.log('click nothing');
							}
						});
						var EventLayer = L.layerGroup([tileLayer, utfGridLayer])
						EventLayer.addTo(map)
						layerControl.addOverlay(EventLayer, '事件');
						layers.push(EventLayer);
					});
				}

				scope.$watch(function() {
					return +scope.state.MultiDocument + 2 * scope.state.usePubDB
				}, function(statu) {
					switch (statu) {
						case 0: //S&Prv
							if (scope.state.selectedDocId)
								TileFactoryObj.SingleAndPrivateDocumentTile();
							break;
						case 1: //M&Prv
							TileFactoryObj.MultiAndPrivateDocumentTile();
							break;
						case 2: //S&Pub
							TileFactoryObj.SingleAndPubDocumentTile();
							break;
						case 3: //M*Pub
							TileFactoryObj.MultiAndPubDocumentTile();
							break;

							scope.$on("e_tl_selected", function(e, d) {
								scope.state.ShowAllPoints = false; //关闭显示所有点，仅显示点击的点
								scope.state.showGalley = true //显示信息窗
									// scope.$apply()
									// pointLayer.clearLayers();
									// pointLayer.addData(d);
									// $("#popupinfo").empty();
									// $("#popupinfo").append($(L.HTMLUtils.buildLocaneTable(d[0], scope.state.dictionary, '', ["content", "start", "id"])).wrap('<div/>').parent().html());
									// map.setView([d[0].LAT, d[0].LNG], 6);

							})
					}
				})

					scope.$watch(function() {
					return scope.state.selectedDocId
				}, function(docid) {
					if (scope.state.usePubDB) {
						//切换到公共库的这篇文档
						httpService.getDocPub(docid).success(function(data) {

							scope.state.paragraphs = paras.paragraph.map(function(pas) {
								return {
									data: pas,
									selected: false,
								}
							})

							httpService.getEventPub(docid).success(function(events) {
								scope.state.results = events;
								scope.$apply()
							})
						})

					} else {
						//切换到私有库的这篇文档
						httpService.getDoc(docid).success(function(paras) {
							scope.state.paragraphs = paras.paragraph.map(function(pas) {
								return {
									data: pas,
									selected: false,
								}
							})
							httpService.geoinfo(docid)
						})

					}
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

.directive('grpnamevalid', function() {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$validators.grpnamevalid = function(modelValue, viewValue) {
				if (ctrl.$isEmpty(modelValue)) {

					return true;
				}
				var validflag = true
				for (var i = scope.state.my_treedata.length - 1; i >= 0; i--) {

					validflag = scope.state.my_treedata[i].label != modelValue
					if (!validflag) {
						break;
					}
				}
				if (validflag) {

					return true;
				} else {

					return false;
				}
			};
		}
	};
});