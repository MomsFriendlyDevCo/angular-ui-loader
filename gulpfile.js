var async = require('async-chainable')
var asyncExec = require('async-chainable-exec');
var annotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var minifyCSS = require('gulp-minify-css');
var ncp = require('ncp');
var nodemon = require('gulp-nodemon');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

gulp.task('default', ['build']);
gulp.task('build', ['scripts', 'style']);
gulp.task('scripts', ['scripts-loader', 'scripts-ng-loader']);

gulp.task('style', function() {
	gulp.src('./src/*.css')
		.pipe(concat('loader.css'))
		.pipe(minifyCSS())
		.pipe(gulp.dest('./dist'))
});

gulp.task('scripts-loader', function() {
	gulp.src('./src/loader.js')
		.pipe(uglify())
		.pipe(gulp.dest('./dist'))
});

gulp.task('scripts-ng-loader', function() {
	gulp.src('./src/ng-loader.js')
		.pipe(annotate())
		.pipe(uglify())
		.pipe(gulp.dest('./dist'))
});

gulp.task('server', ['build'], function() {
	watch('./src/*.js', function() {
		gutil.log('Rebuild client-side JS files...');
		gulp.start('scripts');
	});

	watch('./src/*.css', function() {
		gutil.log('Rebuild client-side CSS files...');
		gulp.start('style');
	});

	var runCount = 0;
	nodemon({
		script: './demo/server.js',
		ext: 'html js css',
	})
		.on('start', function() {
			if (runCount > 0) return;
			notify({
				title: 'MFDC-Loader - Nodemon',
				message: 'Server started',
			}).write(0);
		})
		.on('restart', function() {
			runCount++;
			notify({
				title: 'MFDC-Loader - Nodemon',
				message: 'Server restart' + (++runCount > 1 ? ' #' + runCount : ''),
			}).write(0);
		});
});

gulp.task('gh-pages', ['build'], function(done) {
	async()
		.use(asyncExec)
		.exec('git clone -b gh-pages git@github.com:MomsFriendlyDevCo/angular-ui-loader.git ./gh-pages')
		.parallel([
			next => ncp('./demo/index.html', './gh-pages', next),
			next => ncp('./demo/app.css', './gh-pages', next),
			next => ncp('./demo/app.js', './gh-pages', next),
			next => ncp('./dist/loader.css', './gh-pages/dist', next),
			next => ncp('./dist/loader.js', './gh-pages/dist', next),
			next => ncp('./dist/ng-loader.js', './gh-pages/dist', next),
		])
		.end(function(err) {
			console.log("DONE WITH", err);
			done();
		});
});
