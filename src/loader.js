/**
* Generic loading widget
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
* It also applies the following CSS classes to the body element:
* 	- loading - The loader is active
* 	- loading-foreground - The loader is loading a foreground resource OR
* 	- loading-background - The loader is loading a background resource
*
* NOTE: loader-foreground and loader-background are mutually exclusive
*
*
* This module is usually used in the form:
*	Loader.start(id, stuff === undefined);
*	// Do complex stuff
*	Loader.stop(id);
*/
Loader = {
	loadingForeground: {},
	loadingBackground: {},

	/**
	* Returns if the loader is active
	* @return {boolean} Whether the loader is active
	*/
	isActive: function() {
		return (
			Object.keys(Loader.loadingForeground).length ||
			Object.keys(Loader.loadingBackground).length
		);
	},

	/**
	* Determines if we are loading in the foreground rather than background loading
	* @return {boolean} True if we are loading in the foreground, false if the background
	*/
	isForeground: function() {
		return Object.keys(Loader.loadingForeground).length > 0;
	},

	/**
	* Start the loading of an item by an optional ID
	* Loading is only closed off when all ID's call the .stop() function
	* @param {string} [id='default'] Optional ID to use
	* @param {boolean} [foreground=true] Whether to load the object in the foreground (if false $scope.startBackground is used instead)
	* @return {Object} This chainable loader object
	*/
	start: function(id, foreground) {
		if (!id) id = 'default';
		if (foreground === undefined) foreground = true;

		if (foreground) {
			Loader.loadingForeground[id] = true;
		} else {
			Loader.loadingBackground[id] = true;
		}

		var isForeground = Loader.isForeground();
		document.body.classList.add('loading', isForeground ? 'loading-foreground' : 'loading-background');
		document.body.classList.remove(isForeground ? 'loading-background' : 'loading-foreground');


		return Loader;
	},

	/**
	* Alias function for start(id, false)
	* @see start()
	* @param {string} [id='default'] Optional ID to use
	* @return {Object} This chainable loader object
	*/
	startBackground: function(id) {
		return Loader.start(id, false);
	},

	/**
	* Release an item from loading
	* When all items are released the loader animation is stopped
	* @param {string} [id='default'] Optional ID to use
	* @return {Object} This chainable loader object
	*/
	stop: function(id) {
		if (!id) id = 'default';
		if (Loader.loadingForeground[id]) delete Loader.loadingForeground[id];
		if (Loader.loadingBackground[id]) delete Loader.loadingBackground[id];

		if (!Loader.isActive()) {
			document.body.classList.remove('loading', 'loading-foreground', 'loading-background');
		} else if (!Loader.isForeground()) {
			document.body.classList.add('loading-background');
			document.body.classList.remove('loading-foreground');
		}

		return Loader;
	},

	/**
	* Remove all pending items from the loader queue
	* @return {Object} This chainable loader object
	*/
	clear: function() {
		Loader.loadingForeground = {};
		Loader.loadingBackground = {};
		Loader.stop();
		return Loader;
	},
};
