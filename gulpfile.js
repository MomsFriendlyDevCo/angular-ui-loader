var annotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');
var gulp = require('gulp');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');

gulp.task('default', ['build']);
gulp.task('build', ['scripts-loader', 'scripts-ng-loader', 'style']);

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
