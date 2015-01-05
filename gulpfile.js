/**
 * Created by Ugochimbo on 11/20/2014.
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var notify = require('gulp-notify');

var extensionsDir = "public/javascripts/extensions";
var entitiesDir = extensionsDir + "/entities/";
var handlersDir = extensionsDir + "/handlers/";

var entities = [
                    entitiesDir + 'extensions.js',
                    entitiesDir + 'resa.js',
                    entitiesDir + 'lodsafe.js',
                    entitiesDir + 'extensionfactory.js'
            ];

gulp.task('extensionsEntity', function () {
     return gulp.src(entities)
                .pipe(concat('entities.js'))
                .pipe(gulp.dest(extensionsDir + '/dist/'))
                .pipe(notify({ message: 'Finished Concatenating Extensions Entities Scripts'}));
});


gulp.task('extensionsHandler', function () {
    return gulp.src(handlersDir)
        .pipe(concat('handlers.js'))
        .pipe(gulp.dest(extensionsDir + '/handlers/'))
        .pipe(notify({ message: 'Finished Concatenating Extensions Handler Scripts'}));
});

gulp.task('watch', function() {
    gulp.watch(['extensionsEntity'], ['extensionsHandler']);
});

gulp.task('default', ['extensionsEntity', 'extensionsHandler', 'watch']);