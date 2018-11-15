/**
* Wrapper around the standard Loader instance for Vue
*/

import './loader.css';

export default {
	install: function(Vue) {
		// @include loader.js
		Vue.prototype.$loader = Loader;
	},
};
