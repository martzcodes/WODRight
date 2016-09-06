var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var ts = require('gulp-typescript');
var inject = require('gulp-inject');

var paths = {
  sass: ['./scss/**/*.scss'],
  src: ['./src/*.ts','./src/**/*.ts'],
  html: ['./src/**/*.html'],
  css: ['./www/css/*.css'],
  js: ['./www/app/*.js','./www/app/**/*.js']
};

gulp.task('default', ['sass', 'compile', 'html'/*, 'index'*/]);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

// gulp.task('index', function(){
//     return gulp.src('./www/index.html')
//         .pipe(inject(
//             gulp.src(paths.js,
//                 {read: false}), {relative: true}))
//         .pipe(gulp.dest('./www'))
//         .pipe(inject(
//             gulp.src(paths.css,
//               {read: false}), {relative: true}))
//         .pipe(gulp.dest('./www'));
// });

gulp.task('compile', function(){
  gulp.src(paths.src)
  .pipe(ts({
     emitError: false,
     removeComments: true
  }))
  //.pipe(concat('wodright.js'))
  .pipe(gulp.dest('www/app/'))
})

gulp.task('html', function(){
  gulp.src(paths.html)
  .pipe(gulp.dest('www/app/'))
})

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.src, ['compile']);
  gulp.watch(paths.html, ['html']);
  //gulp.watch([paths.js, paths.css], ['index']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
