angular.module('ng-dragable-div', [])
	.directive("dragAble", function() {
		return {
			restrict: 'EA',
			transclude: false,
			scope: {
				ddShow: '=?',
				ddClass: '@',
				ddHeight: '@',
				ddWidth: '@',
				ddZindex: '@',
				ddBackground: '@',
				ddTop: '@',
				ddLeft: '@',
			},
			link: function($scope, element, attrs) {
				var param = {};
				param.ddShow = $scope.ddShow !== 'false';
				param.height = $scope.ddHeight || '300px';
				param.width = $scope.ddWidth || '500px';
				param.zindex = $scope.ddZindex || 1000;
				param.className = $scope.ddClass || 'ng-dragable';
				param.background = $scope.ddBackground || 'rgba(170,242,255,0.5)';
				param.top = $scope.ddTop || '300px';
				param.left = $scope.ddLeft || '300px';
				element.addClass(param.className);
				var body = document.body;
				dragable = element[0];
				dragable.style.width = param.width;
				dragable.style.height = param.height;
				dragable.style.zIndex = param.zindex;
				dragable.style.position = 'absolute';
				dragable.style.background = param.background;
				dragable.style.cursor = 'move';
				dragable.style.top = param.top;
				dragable.style.left = param.left;
				if ($scope.ddShow) {
					dragable.style.display = "block";
				} else {
					dragable.style.display = "none";
				}
				if (dragable.tagName.toLowerCase() !== 'div' &&
					dragable.tagName.toLowerCase() !== 'drag-able') {
					throw new Error('drag-able can only be applied to <div> or <drag-able> elements');
				}
				if (dragable.children.length === 0) {
					throw new Error('You need to have content inside the <dragable>');
				}
				var closeIcon = document.createElement("a")
				closeIcon.style.float = "right";
				closeIcon.style.marginRight = "10px";
				closeIcon.style.fontSize = "20px";
				closeIcon.style.textDecoration = "none";
				closeIcon.style.color = "#f22";
				closeIcon.innerHTML = "×";
				closeIcon.setAttribute("href", "#");
				closeIcon.onclick = function(e) {
					console.log("click")
					e.preventDefault();
					$scope.ddShow = false
					$scope.$apply()
				}
				dragable.insertBefore(closeIcon, dragable.firstChild)
				body.appendChild(dragable);
				var clicked = "N";
				var mausx, mausy, winx, winy, difx, dify;
				angular.element(document.querySelector("html")).on('mousemove', function(event) {
					mausx = event.pageX;
					mausy = event.pageY;
					winx = document.querySelector("." + param.className).offsetLeft;
					winy = document.querySelector("." + param.className).offsetTop;
					if (clicked == "N") {
						difx = mausx - winx;
						dify = mausy - winy;
					}
					var newx = event.pageX - difx - angular.element(document.querySelector("." + param.className)).css("marginLeft").replace("px", "");
					var newy = event.pageY - dify - angular.element(document.querySelector("." + param.className)).css("marginTop").replace("px", "");
					angular.element(document.querySelector("." + param.className)).css("left", newx + "px");
					angular.element(document.querySelector("." + param.className)).css("top", newy + "px");
				});
				angular.element(document.querySelector("." + param.className)).on("mousedown", function(event) {
					clicked = "Y";
				});
				angular.element(document.querySelector("." + param.className)).on("mouseup", function(event) {
					clicked = "N";
				});
				$scope.$watch('ddShow', function(value) {
					if (!!value) {
						dragable.style.display = "block";
					} else {
						dragable.style.display = "none";
					}
				});
			}
		}
	})