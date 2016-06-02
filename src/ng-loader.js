/**
* This module is usually used in the form:
*	$loader.start($scope.$id, $scope.stuff === undefined);
*	// Do complex stuff
*	$loader.stop($scope.$id);
* In the above the Angular unique ID (`$scope.$id`) is used as the ID and the initial start call determines if the object is new or exists (and is being refreshed)
*/

angular.module('angular-ui-loader', [])
.service('$loader', function() {
	return Loader;
});
