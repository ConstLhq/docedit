'use strict';
angular
	.module('myApp', ["ng-dragable-div","angularFileUpload", 'frapontillo.bootstrap-switch', "angularBootstrapNavTree", "pageslide-directive", "ngScrollbars", "ui.bootstrap.contextMenu","toggle-switch"])
	.service("getInfoServe", ["$http", function(http) {
		var groupObj = {}
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


		return {
			"getGroup": getGroup,
			"postGroup": postGroup,
			"getDoc": getDoc,
			"extract": extract
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
	.controller('edit', ["$scope", "FileUploader", "getInfoServe", "$window",function(scope, FileUploader, getInfoServe,$window) {
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

		uploader.onCompleteItem = function(fileItem, response, status, headers) {

			getInfoServe.postGroup("").success(function(data) {
				scope.state.my_treedata = data;
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
			"showTimeLine":false,
			"showGalley":false,
			"ShowAllPoints":false,
			"showTrace":false,
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
					return "解析选中部分";
				},
				function($itemScope, $event) {
					console.log($window.getSelection().toString())

					//post selection part
				},
				function($itemScope, $event, modelValue, text) {
					return $window.getSelection().toString() != "";
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
					return $window.getSelection().toString() != "";
				}
			]]
		}

		scope.extract = function() {
			//根据构造条件生成规则

			var queryString=scope.state.rootKeyWord
			var queryFilters= queryString.replace(/[+-\/]/g,"###$&").split("###")
			var filter = [{
				keyword: queryFilters.shift()
			}]
			for (var i = 0; i < queryFilters.length; i++) {
				var additionalFilter=queryFilters.map(function(item){
					switch(item[0]){
						case "+": 
							return {logic:"and",keyword:item.slice(1,item.length)}
						case "-":
							return {logic:"not",keyword:item.slice(1,item.length)}
						case "/":
							return {logic:"or",keyword:item.slice(1,item.length)}
					}
				})
				var filter=filter.concat(additionalFilter)
			}
			getInfoServe.extract(filter, scope.state.selectedDocId).success(function(list) {
				scope.state.results = list
				console.log(list)
			})
		}

		scope.my_tree_handler = function(branch) {
			if (branch.docid) {
				scope.state.selectedDocId = branch.docid
				getInfoServe.getDoc(branch.docid).success(function(html) {
					angular.element('#docContent div.mCSB_container').html(html.html)
					scope.state.scrollbarconfig = {
						autoHideScrollbar: true,
						theme: 'dark',
						axis: "y",
						advanced: {
							updateOnContentResize: true
						},
						setHeight: angular.element("#doc").height(),
						scrollInertia: 0
					}
				})
			}
		}
		scope.submitAddnewGroup = function() {
			getInfoServe.postGroup(scope.state.newGroupName).success(function(data) {
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
			getInfoServe.getGroup().success(function(data) {
				scope.state.docGroup = data;
			});
		}
		scope.filterToggle = function() {
			scope.state.filterChecked = !scope.state.filterChecked
		}

		scope.closeTimeLine= function(){
			scope.state.showTimeLine=false;
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
	.directive("mapView",function(){
		return	{
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

			}
		}
	})