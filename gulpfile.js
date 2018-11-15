var babel = require('gulp-babel');
var cleanCSS = require('gulp-clean-css');
var ghPages = require('gulp-gh-pages');
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var rename = require('gulp-rename');
var rimraf = require('rimraf');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

gulp.task('default', ['serve']);
gulp.task('build', ['build:loader', 'build:ngLoader', 'build:css']);

gulp.task('serve', ['build'], function() {
	var monitor = nodemon({
		script: './demo/server.js',
		ext: 'js css',
		ignore: ['**/*.js', '**/.css'], // Ignore everything else as its watched seperately
	})
		.on('start', function() {
			console.log('Server started');
		})
		.on('restart', function() {
			console.log('Server restarted');
		});

	watch(['./index.js', 'demo/**/*.js', 'src/**/*.js'], function() {
		console.log('Rebuild client-side JS files...');
		gulp.start('js');
	});

	watch(['demo/**/*.css', 'src/**/*.css'], function() {
		console.log('Rebuild client-side CSS files...');
		gulp.start('css');
	});
});


gulp.task('build:loader', () => {
	gulp.src('./src/loader.js')
		.pipe(rename('loader.js'))
		.pipe(babel({
			presets: ['@babel/env'],
			plugins: ['angularjs-annotate'],
		}))
		.pipe(uglify())
		.pipe(gulp.dest('./dist'))
});

gulp.task('build:ngLoader', ()=> {
	gulp.src('./src/ng-loader.js')
		.pipe(rename('ng-loader.js'))
		.pipe(babel({
			presets: ['@babel/env'],
			plugins: ['angularjs-annotate'],
		}))
		.pipe(uglify())
		.pipe(gulp.dest('./dist'))
});

gulp.task('build:css', ()=> {
	gulp.src('./src/*.css')
		.pipe(rename('loader.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest('./dist'))
});

gulp.task('gh-pages', ['build'], function() {
	rimraf.sync('./gh-pages');

	return gulp.src([
		'./LICENSE',
		'./demo/_config.yml',
		'./demo/app.js',
		'./demo/app.css',
		'./demo/index.html',
		'./dist/**/*',
		'./node_modules/angular/angular.min.js',
		'./node_modules/bootstrap/dist/css/bootstrap.min.css',
		'./node_modules/bootstrap/dist/js/bootstrap.min.js',
		'./node_modules/jquery/dist/jquery.min.js',
		'./node_modules/font-awesome/css/font-awesome.min.css',
		'./node_modules/font-awesome/fonts/fontawesome-webfont.ttf',
		'./node_modules/font-awesome/fonts/fontawesome-webfont.woff',
		'./node_modules/font-awesome/fonts/fontawesome-webfont.woff2',
	], {base: __dirname})
		.pipe(rename(function(path) {
			if (path.dirname == 'demo') { // Move all demo files into root
				path.dirname = '.';
			}
			return path;
		}))
		.pipe(ghPages({
			cacheDir: 'gh-pages',
			push: true, // Change to false for dryrun (files dumped to cacheDir)
		}))
});
