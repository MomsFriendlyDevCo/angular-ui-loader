var app = angular.module("app", [
	'angular-ui-loader',
]);

app.controller('demoController', function($scope, $loader) {
	$scope.$loader = $loader;
});
