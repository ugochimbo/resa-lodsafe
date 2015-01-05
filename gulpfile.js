/**
 * Created by Ugochimbo on 11/20/2014.
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var notify = require('gulp-notify');

var extensionsDir = "public/javascripts/extensions";
var handlersDir = extensionsDir + "/handlers/";
var handlers = [
                    handlersDir + 'resaHandler.js',
                    handlersDir + 'lodsafeHandler.js'
               ];

gulp.task('extensionsHandler', function () {
    return gulp.src(handlers)
        .pipe(concat('exthandlers.js'))
        .pipe(gulp.dest(extensionsDir + '/dist/'))
        .pipe(notify({ message: 'Finished Concatenating Extensions Handler'}));
});

gulp.task('watch', function() {
    gulp.watch(['extensionsHandler']);
});

gulp.task('default', ['extensionsHandler', 'watch']);