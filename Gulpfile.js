var glob = require('glob');
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
            'sourcemap=none': true,
            style: 'compressed',
            check: true}))
        .pipe(plugins.minifyCss({keepSpecialComments:0}))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest('web/css/'));
});

gulp.task('copy', function() {
    gulp.src(app + '/libs/readmore/**/*')
        .pipe(gulp.dest('web/js/readmore'));

    gulp.src(app + '/libs/jquery-minicolors/jquery.minicolors.js')
        .pipe(gulp.dest('web/js/'));

    gulp.src(app + '/libs/jquery-minicolors/jquery.minicolors.css')
        .pipe(plugins.minifyCss({keepSpecialComments:0}))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest('web/css/'));

    gulp.src(app + '/libs/ckeditor/**/*')
        .pipe(gulp.dest('web/js/ckeditor'));

    gulp.src(app + '/js/ckeditor/plugins/**/*')
        .pipe(gulp.dest('web/js/ckeditor/plugins'));

    gulp.src(app + '/js/ckeditor/skins/**/*')
        .pipe(gulp.dest('web/js/ckeditor/skins'));

    gulp.src(app + '/fonts/*.{ttf,woff,eof,svg,eot}')
        .pipe(gulp.dest('web/fonts/'));

    gulp.src(app + '/libs/fancybox/source/**/*')
        .pipe(gulp.dest('web/js/fancybox'));
});

gulp.task('concat', function() {
    gulp.src([
        app + '/libs/jquery/dist/jquery.js',
        app + '/libs/bootstrap/assets/javascripts/bootstrap.js',
        app + '/libs/fancybox/source/jquery.fancybox.pack.js',
        app + '/js/googleCharts.js',
        app + '/js/cookiechoices.js',
        app + '/js/app.js'
    ])
        .pipe(plugins.concat('app.js'))
        .pipe(plugins.uglify({mangle: true}))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest('web/js/'));
});

gulp.task('watch', function() {
    gulp.watch(app + '/scss/**/*.scss', ['styles']);
});

gulp.task('uncss', function() {
    return gulp.src('web/css/style.min.css')
        .pipe(plugins.uncss({
            html: glob.sync('web/styleguide/**/*.php')
        }))
        .pipe(plugins.minifyCss({keepSpecialComments:0}))
        .pipe(plugins.rename({basename: "clear",suffix: '.min'}))
        .pipe(gulp.dest('web/styleguide/.out'));
});

gulp.task('build', [
    'copy',
    'concat',
    'styles'
]);

gulp.task('default', [
    'styles'
]);

gulp.task('clean', [
    'uncss'
]);
