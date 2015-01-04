/**
 * Created by Ugochimbo on 11/20/2014.
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var notify = require('gulp-notify');

var dir = "public/javascripts/extensions/";

var src = [
            dir + 'resa.js',
            dir + 'lodsafe.js',
            dir + 'extensionfactory.js',
            dir + 'extensions.js'
        ];

gulp.task('extensions', function () {
     return gulp.src(src)
                .pipe(concat('script.js'))
                .pipe(gulp.dest(dir + 'dist/'))
                .pipe(notify({ message: 'Finished Concatenating Extension Scripts'}));
});

gulp.task('watch', function() {
    gulp.watch(dir + '*.js', ['extensions']);
});

gulp.task('default', ['extensions', 'watch']);