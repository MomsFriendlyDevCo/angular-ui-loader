angular-ui-loader
=================
Generic page loading control in plain JS + Angular, designed to be as small as possible.

This module ships with an Angular wrapper (`$loader`) but can be addressed either as `$loader` (Angular) or `Loader` (vanilla JavaScript).


[Demo available here](http://momsfriendlydevco.github.io/angular-ui-loader)


This component was built by the really cool guys at [Moms Friendly Development Company](http://mfdc.biz).



```javascript
Loader.start('doing-something');

// Do something complicated

Loader.stop('doing-something');
```

Or mix up foreground + background loading:

```javascript
Loader.start('doing-something-foreground');
Loader.startBackground('doing-something-background');

// Do something complicated

Loader.stop('doing-something-foreground');

// Much later...

Loader.stop('doing-something-background');
```

Installation
============

Vanilla JavaScript + Core install
---------------------------------

* Include the `dist/loader.css` and `dist/loader.js` files as high as possible within your `<head/>` element:

```html
<link rel="stylesheet" href="node_modules/angular-ui-loader/dist/loader.css"/>
<script src="node_modules/angular-ui-loader/dist/loader.js"></script>
```


Angular install (optional)
--------------------------

* Install the core files as above

* Include the `dist/ng-loader.js` after the main Angular module has loaded:

```html
<script src="node_modules/angular-ui-loader/dist/ng-loader.js"></script>
```

* Add the `angular-ui-loader` module into the `angular.app()` call:

```javascript
var app = angular.module("app", [
	'angular-ui-loader',
]);
```

* You should now have access to the `$loader` service which exposes the [Loader API](#api).


See the [demo HTML file](demo/index.html) for an example file layout.




API
===

Loader.isActive()
-----------------
Returns true if the loader is active for either foreground or background loading.

Loader.isForeground()
---------------------
Returns true if the loader is loading in the foreground.

Loader.isBackground()
---------------------
Returns true if the loader is loading in the background.

Loader.start([id='default'], [foreground=true])
--------------------------------
Add an ID to the loader process. If foreground is truthy (the default) it will be treated as a foreground process, if falsy it will be treated as a background process.

Loader.startBackground([id='default'])
--------------------------------------
Convenience function to register a process in the background.
This function is the same as `Loader.start(id, false)`.

Loader.stop([id='default'])
---------------------------
Release an ID from loading.

Loader.clear()
--------------
Clear all ID's from loading.

There is more functionality to tweak inside the [JavaScript](src/loader.js) file. See its internal documentation for details.


CSS classes
===========
The base CSS of this component supports the following CSS classes:

| CSS Class                    | Applied When        | Description                                                                                                       |
|------------------------------|---------------------|-------------------------------------------------------------------------------------------------------------------|
| `loading`                    | Loading             | Applied to the `body` element during any loading operation                                                        |
| `loading-foreground`         | Foreground loading  | Applied to the `body` element during a foreground loading operation                                               |
| `loading-foreground-closing` | Foreground load end | Applied temporarily to the `body` element to run any CSS animations to close out foreground loading               |
| `loading-background`         | Background loading  | Applied to the `body` element during a background loading operation                                               |
| `loading-background-closing` | Background load end | Applied temporarily to the `body` element to run any CSS animations to close out background loading               |
| `hidden-loading`             | Loading             | Utility class which sets `display:none` to any element it is applied to when the page is in any loading operation |
| `hidden-loading-background`  | Background loading  | As above but only for background loading events                                                                   |
| `hidden-loading-foreground`  | Foreground loading  | As above but only for foreground loading events                                                                   |
| `visible-loading`            | Finished loading    | Utility class which sets items as visible when the page has finished any loading operation                        |
| `visible-loading-background` | Background loading  | As above but for background loading events                                                                        |
| `visible-loading-foreground` | Foreground loading  | As above but for foreground loading events                                                                        |


**NOTES:**

* Foreground and Background loading events are mutually exclusive. A `body` element will not have `loading-foreground` and `loading-background` applied at the same time.
* There are no "loaded" styles. If you want this behaviour use `not(body.loading)` instead.
* The module applies the `.loading-(foreground|background)-closing` style temporarily (default is 1s) to allow closing CSS transitions. The main `loading-(foreground|background)` style does *not* remain attached, if you wish for the element to remain visible you will have to add an override for visibility for the `loading-*-closing` styles. See the [stylesheet](src/loader.css) for examples.
