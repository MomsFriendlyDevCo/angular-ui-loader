function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".loader-bar,.loader-spinner{left:0;pointer-events:none;position:fixed;top:0;z-index:1}.loader-bar{height:5px;display:none;transition:opacity .5s ease-in;width:100vw}.loader-bar:after,.loader-bar:before{background-color:#ac348c;content:\"\";display:block;height:100%;position:absolute;top:0;width:100%}.loader-bar:after{animation-duration:20s;animation-timing-function:ease-out;animation-name:b;animation-iteration-count:1;transform:translate3d(-5vw,0,0)}.loader-bar:before{transform:translate3d(-100vw,0,0)}.loading-foreground-closing .loader-bar,.loading-foreground .loader-bar{display:block}.loading-foreground-closing .loader-bar{opacity:0;transition:opacity .5s ease-out .5s}.loading-foreground-closing .loader-bar:before{animation:1s ease-out c 1;transform:translateZ(0)}.loader-spinner{color:#555;font-family:sans-serif;margin:15px;display:none;height:20px;line-height:20px;padding:0 25px;transition:opacity .4s ease-in}.loading-background .loader-spinner{opacity:.5}.loader-spinner:before{animation-duration:.75s;animation-timing-function:linear;border:2px solid #ac348c;animation-name:a;animation-iteration-count:infinite;border-bottom-color:transparent;border-left-color:transparent;border-radius:50%;box-sizing:border-box;content:\"\";display:block;height:20px;left:0;position:absolute;width:20px}.loading-background-closing .loader-spinner,.loading-foreground-closing .loader-spinner,.loading .loader-spinner{display:block}.loading-background-closing .loader-spinner,.loading-foreground-closing .loader-spinner{opacity:0;transition:opacity .4s ease-out}@keyframes a{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}@keyframes b{0%{transform:translate3d(-100vw,0,0)}to{transform:translate3d(-5vw,0,0)}}@keyframes c{0%{transform:translate3d(-75vw,0,0)}50%{transform:translateZ(0)}}body.loading-background .hidden-loading-background,body.loading-foreground .hidden-loading-foreground,body.loading .hidden-loading{display:none}body.loading-background .visible-loading-background,body.loading-foreground .visible-loading-foreground,body.loading .visible-loading{display:block}body:not(.loading) .visible-loading,body:not(.loading-background) .visible-loading-background,body:not(.loading-foreground) .visible-loading-foreground{display:none}";
styleInject(css);

/**
* Wrapper around the standard Loader instance for Vue
*/

var vueLoader = {
	install: function(Vue) {
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
		var Loader = {
			/**
			* Fast access boolean to determine if we are doing any loading (foreground or background)
			* @var {boolean}
			*/
			loading: false,
		
			/**
			* Fast access boolean to determine if we are doing specifically foreground loading
			* @var {boolean}
			* @see updateStates()
			*/
			loadingForeground: false,
		
			/**
			* Fast access boolean to determine if we are doing specifically background loading
			* @var {boolean}
			* @see updateStates()
			*/
			loadingBackground: false,
		
			/**
			* Storage of all ID's that we are waiting on in the foreground
			* This object should be empty when there is no more foreground loading to do
			* @var {Object}
			* @see updateStates()
			*/
			waitingForeground: {},
		
			/**
			* Storage of all ID's that we are waiting on in the background
			* This object should be empty when there is no more background loading to do
			* @var {Object}
			*/
			waitingBackground: {},
		
			/**
			* Custom bindings to execute when certain events occur
			* This is a really low-rent implementation of an event omtiter
			* Replace these noop functions with your own if you wish to bind to custom events
			* @var {Object}
			*/
			on: {
				start: id => {},
				stateUpdate: state => {},
				stop: id => {},
				stopAll: ()=> {},
			},
		
			/**
			* Returns if the loader is active
			* @return {boolean} Whether the loader is active
			*/
			isActive: function() {
				return Boolean(
					Object.keys(Loader.waitingForeground).length ||
					Object.keys(Loader.waitingBackground).length
				);
			},
		
			/**
			* Determines if we are loading in the foreground rather than background loading
			* @return {boolean} True if we are loading in the foreground, false if the background
			*/
			isForeground: function() {
				return Object.keys(Loader.waitingForeground).length > 0;
			},
		
			/**
			* Determines if we are loading in the background rather than foreground loading
			* @return {boolean} True if we are loading in the background, false if the foreground
			*/
			isBackground: function() {
				return Object.keys(Loader.waitingBackground).length > 0;
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
		
				var wasBackground = false;
		
				if (foreground) {
					wasBackground = Loader.isBackground();
					Loader.waitingForeground[id] = true;
				} else {
					Loader.waitingBackground[id] = true;
				}
		
				Loader.on.start(id);
		
				var isForeground = Loader.isForeground();
				document.body.classList.add('loading', isForeground ? 'loading-foreground' : 'loading-background');
				if (wasBackground) Loader.timers.backgroundCloseout.setup(); // Manage transition from background -> foreground
				document.body.classList.remove(isForeground ? 'loading-background' : 'loading-foreground');
				Loader.updateStates();
		
		
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
			* Update the fast-access state variables
			*/
			updateStates: function() {
				var isLoading = Loader.isActive();
				var isForeground = Loader.isForeground();
				var isBackground = Loader.isBackground();
				Loader.loading = isLoading;
				Loader.loadingForeground = isForeground;
				Loader.loadingBackground = isBackground;
				Loader.on.stateUpdate({loading: isLoading, foreground: isForeground, background: isBackground});
			},
		
			/**
			* Handle for various timers
			* @var {Object}
			*/
			timers: {
				foregroundCloseout: {
					handle: null,
					interval: 1000,
					callback: function() {
						document.body.classList.remove('loading-foreground-closing');
					},
					setup: function() {
						document.body.classList.add('loading-foreground-closing');
						Loader.timers.foregroundCloseout.handle = setTimeout(Loader.timers.foregroundCloseout.callback, Loader.timers.foregroundCloseout.interval);
					},
					teardown: function() {
						cancelTimeout(Loader.timers.foregroundCloseout.handle);
					},
				},
				backgroundCloseout: {
					handle: null,
					interval: 1000,
					callback: function() {
						document.body.classList.remove('loading-background-closing');
					},
					setup: function() {
						document.body.classList.add('loading-background-closing');
						Loader.timers.backgroundCloseout.handle = setTimeout(Loader.timers.backgroundCloseout.callback, Loader.timers.backgroundCloseout.interval);
					},
					teardown: function() {
						cancelTimeout(Loader.timers.backgroundCloseout.handle);
					},
				},
			},
		
			/**
			* Release an item from loading
			* When all items are released the loader animation is stopped
			* @param {string} [id='default'] Optional ID to use
			* @return {Object} This chainable loader object
			*/
			stop: function(id) {
				if (!id) id = 'default';
		
				var wasForeground = Loader.waitingForeground[id];
				if (wasForeground) {
					delete Loader.waitingForeground[id];
				} else if (Loader.waitingBackground[id]) {
					delete Loader.waitingBackground[id];
				} else { // Unknown ID
					return;
				}
		
				Loader.on.stop(id);
		
				if (!Loader.isActive()) { // Nothing waiting
					document.body.classList.remove('loading', 'loading-foreground', 'loading-background');
					if (wasForeground) {
						Loader.timers.foregroundCloseout.setup();
					} else {
						Loader.timers.backgroundCloseout.setup();
					}
					Loader.on.stopAll();
				} else if (!Loader.isForeground()) { // Transition from foreground -> background
					document.body.classList.add('loading-background');
					document.body.classList.remove('loading-foreground');
					Loader.timers.foregroundCloseout.setup();
				}
				Loader.updateStates();
		
				return Loader;
			},
		
			/**
			* Remove all pending items from the loader queue
			* @return {Object} This chainable loader object
			*/
			clear: function() {
				Loader.waitingForeground = {};
				Loader.waitingBackground = {};
				Loader.stop();
				return Loader;
			},
		
		
			/**
			* The template to add to the page during init()
			* @see init()
			* @var {string}
			*/
			templateHTML: '<div class="loader-bar"></div><div class="loader-spinner"></div>',
		
			/**
			* Fired at the earliest possible point when we have the document.body addressable
			* This function creates all the elements required for the loader to operate from templateHTML
			* @see templateHTML
			*/
			init: function() {
				var elem = document.createElement('div');
				elem.innerHTML = Loader.templateHTML;
				document.body.appendChild(elem);
			},
		};
		document.addEventListener('DOMContentLoaded', Loader.init);
		
		Vue.prototype.$loader = Loader;
	},
};

export default vueLoader;
