var app = angular.module("app", [
	'angular-ui-loader',
]);

app.controller('demoController', function($scope, $loader) {
	$scope.$loader = $loader;

	$scope.$on('$loaderStart', (e, id) => console.log('$loaderStart', id));
	$scope.$on('$loaderStop', (e, id) => console.log('$loaderStop', id));
	$scope.$on('$loaderStopAll', e => console.log('$loaderStopAll'));
	$scope.$on('$loaderUpdateState', (e, state) => console.log('$loaderUpdateState', state));
});
