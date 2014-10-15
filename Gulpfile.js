var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();

var app = 'app/Resources';

var onError = function(err) {
    console.log(err);
};

gulp.task('styles', function() {

    gulp.src(app + '/scss/**/*.scss')
        .pipe(plugins.plumber({
            errorHandler: onError
        }))
        .pipe(plugins.rubySass({
            compass: true,
            style: 'compressed',
            check: true}))
        .pipe(plugins.minifyCss({keepSpecialComments:0}))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest('web/css/'));
});

gulp.task('copy', function() {
    gulp.src(app + '/fonts/*.{ttf,woff,eof,svg,eot}')
        .pipe(gulp.dest('web/fonts/'));
});

gulp.task('concat', function() {
    gulp.src([
        app + '/libs/jquery/dist/jquery.js',
        app + '/libs/bootstrap/assets/javascripts/bootstrap.js'
    ])
        .pipe(plugins.concat('app.js'))
        .pipe(plugins.uglify({mangle: true}))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest('web/js/'));
});

gulp.task('watch', function() {
    gulp.watch(app + '/scss/**/*.scss', ['styles']);
});

gulp.task('build', [
    'copy',
    'concat',
    'styles'
]);

gulp.task('default', [
    'styles'
]);