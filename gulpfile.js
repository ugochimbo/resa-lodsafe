/**
 * Created by Ugochimbo on 11/20/2014.
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var notify = require('gulp-notify');

var javascriptsDir = "public/javascripts/";
var extensionsDir = javascriptsDir + "extensions/";
var extensionsHandlerDir = extensionsDir + "handlers/";
var distDir = javascriptsDir + 'dist/';
var appDir = javascriptsDir + 'app/';

var visualizationsDir = "public/javascripts/visualizations/";
var visualizations = [
                        visualizationsDir + 'visualizations.js',
                        visualizationsDir + 'bubblecloud.js',
                        visualizationsDir + 'lodsafe-facet.js',
                        visualizationsDir + 'factory/visualizationfactory.js'
                ];

var extensionsHandler = [
                    extensionsHandlerDir + 'resaHandler.js',
                    extensionsHandlerDir + 'lodsafeHandler.js',
                    extensionsDir + 'factory/extensionsHandlerFactory.js'
               ];

var scripts = [
    distDir + 'visualizations.js',
    distDir + 'extensionshandler.js',
    appDir + 'appScope.js',
    appDir + 'appHandler.js',
    appDir + 'domEvents.js',
    appDir + 'socketEvents.js'
];

gulp.task('extensionsHandler', function () {
    return gulp.src(extensionsHandler)
        .pipe(concat('extensionshandler.js'))
        .pipe(gulp.dest(distDir))
        .pipe(notify({ message: 'Finished Concatenating Extensions Handler'}));
});

gulp.task('visualizations', function () {
    return gulp.src(visualizations)
        .pipe(concat('visualizations.js'))
        .pipe(gulp.dest(distDir))
        .pipe(notify({ message: 'Finished Concatenating Visualizations'}));
});

gulp.task('scripts', function () {
    return gulp.src(scripts)
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(distDir))
        .pipe(notify({ message: 'Finished Concatenating Scripts'}));
});

/*gulp.task('watch', function() {
    gulp.watch(['extensionsHandler', 'visualizations']);
});*/

gulp.task('default', ['extensionsHandler', 'visualizations', 'scripts']);