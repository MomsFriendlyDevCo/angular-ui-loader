/**
* Generic replacable service which should map onto a loading widget
* To start a loader call either:
* 	.start(id) - for foreground loads
* 	.startBackground(id) - for background loads
*
* NOTE: .start(id) can also be called with an optional second parameter, which if falsy is redirected to .startBackground
*
* To stop a loader call:
* 	.stop(id)
*
* This service invokes / kills the Loader service
* It also applies the following CSS classes to the body element to customize:
* 	- loader - The loader is active
* 	- loader-foreground - The loader is loading a foreground resource OR
* 	- loader-background - The loader is loading a background resource
*
* NOTE: loader-foreground and loader-background are mutually exclusive
*
*
* This module is usually used in the form:
*	$loader.start($scope.$id, $scope.stuff === undefined);
*	// Do complex stuff
*	$loader.stop($scope.$id);
* In the above the Angular unique ID (`$scope.$id`) is used as the ID and the initial start call determines if the object is new or exists (and is being refreshed)
*/
angular.module('angular-ui-loader')
.service('$loader', function($timeout) {
	var $scope = this;
	$scope.loading = {};
	$scope.loadingBackground = {};

	/**
	* Returns if the loader is active
	* @return {boolean} Whether the loader is active
	*/
	$scope.isActive = function() {
		return (
			_.keys($scope.loading).length ||
			_.keys($scope.loadingBackground).length
		);
	};


	/**
	* Determines if we are loading in the foreground rather than background loading
	* @return {boolean} True if we are loading in the foreground, false if the background
	*/
	$scope.isForeground = function() {
		return !! _.keys($scope.loading).length;
	};


	// Debugging {{{
	/**
	* Whether debugging is enabled
	* Determined initially from the server name, can be set using setDebug()
	* @see setDebug()
	* @var {boolean}
	*/
	$scope.debug = location.host.match(/^local|glitch|slab/);


	/**
	* Handle of the debug timer
	* @var {Object}
	*/
	$scope.debugComplainer;

	/**
	* How long to wait until the debugger starts complaining in MS
	* @var {number}
	*/
	$scope.debugComplainInterval = 5 * 1000;


	/**
	* Set the debugging mode
	* This has behaviour such as complaining if the loading state is left for too long
	* This should only be enabled for `localhost` type situations
	* @param {boolean} state The state of the debuger
	*/
	$scope.setDebug = function(state) {
		$scope.debug = state;
	};

	
	/**
	* Install the timeout for the debugComplainer function
	*/
	$scope._debugInstall = function() {
		$timeout.cancel($scope.debugComplainer);
		$scope.debugComplainer = $timeout(function() {
			console.log('$loader still waiting for handles to finish:', 'Foreground:', _.keys($scope.loading), 'Background:', _.keys($scope.loadingBackground));
		}, $scope.debugComplainInterval);
	};


	/**
	* Uninstall the timeout - this function should be called when everything has terminated correctly
	*/
	$scope._debugUninstall = function() {
		$timeout.cancel($scope.debugComplainer);
	};
	// }}}


	/**
	* Start the loading of an item by an optional ID
	* Loading is only closed off when all ID's call the .stop() function
	* @param {string} [id='default'] Optional ID to use
	* @param {boolean} [foreground=true] Whether to load the object in the foreground (if false $scope.startBackground is used instead)
	* @return {Object} This chainable loader object
	*/
	$scope.start = function(id, foreground) {
		if (!id) id = 'default';
		if (foreground === false) return $scope.startBackground(id);
		if (!$scope.isActive()) Loader.start();
		$scope.loading[id] = true;
		angular.element('body')
			.addClass('loader')
			.addClass('loader-foreground')
			.removeClass('loader-background');

		if ($scope.debug) $scope._debugInstall();

		return $scope;
	};


	/**
	* Start the loading of an item in the background
	* This is functionally the same as .start() (you can still call .stop() to kill this) but applies background loading styles in the Body DOM
	* @param {string} [id='default'] Optional ID to use
	* @return {Object} This chainable loader object
	*/
	$scope.startBackground = function(id) {
		if (!id) id = 'default';
		if (!$scope.isActive()) NProgress.start();
		$scope.loadingBackground[id] = true;
		angular.element('body').addClass('loader');
		if (!$scope.isForeground())
			angular.element('body')
				.addClass('loader-background')
				.removeClass('loader-foreground');

		if ($scope.debug) $scope._debugInstall();

		return $scope;
	};


	/**
	* Release an item from loading
	* When all items are released the loader animation is stopped
	* @param {string} [id='default'] Optional ID to use
	* @return {Object} This chainable loader object
	*/
	$scope.stop = function(id) {
		if (!id) id = 'default';
		if ($scope.loading[id]) delete $scope.loading[id];
		if ($scope.loadingBackground[id]) delete $scope.loadingBackground[id];

		if (!$scope.isActive()) {
			Loader.stop();
			angular.element('body').removeClass('loader loader-foreground loader-background');
			if ($scope.debug) $scope._debugUninstall();
		} else if ($scope.isForeground()) {
			angular.element('body')
				.addClass('loader-foreground')
				.removeClass('loader-background');
		} else {
			angular.element('body')
				.addClass('loader-background')
				.removeClass('loader-foreground');
		}
		return $scope;
	};


	/**
	* Remove all pending items from the loader queue
	* @return {Object} This chainable loader object
	*/
	$scope.clear = function() {
		$scope.loading = {};
		$scope.loadingBackground = {};
		$scope.stop();
		return $scope;
	};

	return $scope;
});
