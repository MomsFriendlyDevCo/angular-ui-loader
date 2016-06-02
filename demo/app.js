var app = angular.module("app", [
	'angular-ui-loader',
	'ngResource',
]);

app.factory('Reddit', function($resource) {
	return $resource('https://www.reddit.com', {}, {
		subreddit: {url: 'https://www.reddit.com/r/:subreddit.json', method: 'GET'},
	});
});

app.controller('redditController', function($scope, $http, $loader, $window, Reddit) {
	$scope.$loader = $loader;
	$scope.posts = [];

	// Allow Angular to communicate cross domain (not normally needed)
	$http.defaults.useXDomain = true;

	Reddit.subreddit({subreddit: 'australia'}).$promise
		.then(function(listings) {
			// Titles exist within listings.data.children (and for annoying reasons each payload is packed into .data)
			$scope.posts = listings.data.children.map(function(post) {
				return post.data;
			});
		})
		.catch(function(e) {
			console.error('An error has occured!', e);
		});

	$scope.selectPost = function(post) {
		$window.location = 'https://www.reddit.com' + post.permalink;
	};
});
