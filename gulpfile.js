var async = require('async-chainable')
var asyncExec = require('async-chainable-exec');
var asyncLog = require('async-chainable-log');
var annotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');
var copy = require('fs-copy-simple');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var minifyCSS = require('gulp-minify-css');
var nodemon = require('gulp-nodemon');
var notify = require('gulp-notify');
var rimraf = require('rimraf');
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

// Create ./gh-pages as a folder which contains a GitHub compatible demo
gulp.task('gh-pages', ['build'], function(done) {
	async()
		.use(asyncExec)
		.use(asyncLog)
		.logDefaults({callback: gutil.log})
		.execDefaults({
			log: function(cmd) { gutil.log(gutil.colors.blue('[RUN]'), cmd.cmd + ' ' + cmd.params.join(' ')) },
			out: function(line) { line.split('\n').forEach(l => gutil.log(gutil.colors.grey('[>>>]'), l)) },
		})

		.log('Removing existing gh-pages directory')
		.then(next => rimraf('./gh-pages', next))

		.log('Cloning gh-pages branch from GitHub')
		.exec('git clone -b gh-pages git@github.com:MomsFriendlyDevCo/angular-ui-loader.git ./gh-pages')

		.log('Cleaning up existing files')
		.parallel([
			next => rimraf('./gh-pages/index.html', next),
			next => rimraf('./gh-pages/app.css', next),
			next => rimraf('./gh-pages/app.js', next),
			next => rimraf('./gh-pages/dist/loader.css', next),
			next => rimraf('./gh-pages/dist/loader.js', next),
			next => rimraf('./gh-pages/dist/ng-loader.js', next),
		])

		.log('Copying new files')
		.parallel([
			next => copy('./demo/index.html', './gh-pages', next),
			next => copy('./demo/app.css', './gh-pages', next),
			next => copy('./demo/app.js', './gh-pages', next),
			next => copy('./dist/loader.css', './gh-pages/dist', next),
			next => copy('./dist/loader.js', './gh-pages/dist', next),
			next => copy('./dist/ng-loader.js', './gh-pages/dist', next),
		])

		.log('Adding altered files into cache')
		.then(next => { process.chdir('./gh-pages'); next() })
		.exec('git status')
		.exec('git add --all')

		.log('Pushing new files to GitHub/gh-pages')
		.exec('git push')

		.end(done);
});
