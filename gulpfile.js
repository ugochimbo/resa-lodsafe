/**
 * Created by Ugochimbo on 11/20/2014.
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var notify = require('gulp-notify');

var extensionsDir = "public/javascripts/extensions";
var handlersDir = extensionsDir + "/handlers/";

var visualizationsDir = "public/javascripts/visualizations/";
var visualizations = [
                        visualizationsDir + 'visualizations.js',
                        visualizationsDir + 'bubblecloud.js'
                ];

var extensionsHandler = [
                    handlersDir + 'resaHandler.js',
                    handlersDir + 'lodsafeHandler.js'
               ];

gulp.task('extensionsHandler', function () {
    return gulp.src(extensionsHandler)
        .pipe(concat('extensionsHandler.js'))
        .pipe(gulp.dest(extensionsDir + '/dist/'))
        .pipe(notify({ message: 'Finished Concatenating Extensions Handler'}));
});

gulp.task('visualizations', function () {
    return gulp.src(visualizations)
        .pipe(concat('visualizations.js'))
        .pipe(gulp.dest(visualizationsDir + '/dist/'))
        .pipe(notify({ message: 'Finished Concatenating Visualizations'}));
});

gulp.task('watch', function() {
    gulp.watch(['extensionsHandler', 'visualizations']);
});

gulp.task('default', ['extensionsHandler', 'visualizations', 'watch']);