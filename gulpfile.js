var gulp          = require('gulp'),
    babel         = require('gulp-babel'),
    concat        = require('gulp-concat'),
    footer        = require('gulp-footer'),
    iife          = require("gulp-iife"),
    eslint        = require('gulp-eslint'),
    preprocess    = require('gulp-preprocess'),
    sourcemaps    = require('gulp-sourcemaps'),
    uglify        = require('gulp-uglify');

//-----------------------------------------------------------------------------
// CSS Processing
//-----------------------------------------------------------------------------
gulp.task('css', function() {
   return gulp.src('app/src/*.css')
      .pipe(gulp.dest('out/debug'))
      .pipe(gulp.dest('out/production'));
});

//-----------------------------------------------------------------------------
// Lib Processing
//-----------------------------------------------------------------------------
gulp.task('lib', function() {
   return gulp.src('app/lib/*.js')
      .pipe(gulp.dest('out/debug'))
      .pipe(uglify())
      .pipe(gulp.dest('out/production'));
});

//-----------------------------------------------------------------------------
// Javascript Processing
//    - Need a debug and production version because
//          - uglifying the source renames all the variables, thus variable
//            names in source don't match variable names in the debugger
//          - when all files are concatenated into one, runtime errors are
//            in terms of the concatenated file line numbers, not original
//            file line numbers
//-----------------------------------------------------------------------------
gulp.task('js-debug', function() {
   return gulp.src('app/src/*.js')
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(sourcemaps.init())
         .pipe(babel())
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest('out/debug'))
});

gulp.task('js-production', function() {
   return gulp.src('app/src/*.js')
      .pipe(babel())
      .pipe(concat('m3.js'))
      .pipe(iife())
      .pipe(uglify())
      .pipe(gulp.dest('out/production'));
});

//-----------------------------------------------------------------------------
// HTML Processing
//-----------------------------------------------------------------------------
gulp.task('html-debug', function() {
   return gulp.src('app/src/*.html')
      .pipe(preprocess({context: {environment: "debug"}}))
      .pipe(gulp.dest('out/debug'))
});

gulp.task('html-production', function() {
   return gulp.src('app/src/*.html')
      .pipe(preprocess({context: {environment: "production"}}))
      .pipe(gulp.dest('out/production'))
});

//-----------------------------------------------------------------------------
// Image Processing
//-----------------------------------------------------------------------------
gulp.task('images', function() {
   return gulp.src('app/images/*')
      .pipe(gulp.dest('out/debug/images'))
      .pipe(gulp.dest('out/production/images'))
});

//-----------------------------------------------------------------------------
// Deprecated appcache
//-----------------------------------------------------------------------------
gulp.task('appcache', function() {
   return gulp.src('app/m3.appcache*')
      .pipe(footer('#Timestamp to force browser reload: ${timestamp}\n', {timestamp: Date.now()}))
      .pipe(gulp.dest('out/debug'))
      .pipe(gulp.dest('out/production'));
});

//-----------------------------------------------------------------------------
// W3C Webmanifest
//-----------------------------------------------------------------------------
gulp.task('manifest', function() {
   return gulp.src('app/*.webmanifest')
      .pipe(gulp.dest('out/debug'))
      .pipe(gulp.dest('out/production'));
});

//-----------------------------------------------------------------------------
// Default
//-----------------------------------------------------------------------------
gulp.task('default', function() {
   gulp.start('css',      'appcache',      'html-debug', 'html-production', 'images',
              'js-debug', 'js-production', 'lib',        'manifest');
});

//-----------------------------------------------------------------------------
// Watch everything. Note that appcache must be processed if *anything* changes
// so that appcache will always get a new timestamp, which forces browser to reload
//-----------------------------------------------------------------------------
gulp.watch('app/appcache.manifest*',  ['appcache']);
gulp.watch('app/src/*.css',           ['css', 'appcache']);
gulp.watch('app/src/*.html',          ['html-debug', 'html-production', 'appcache']);
gulp.watch('app/images/*',            ['images', 'appcache']);
gulp.watch('app/src/*.js',            ['js-debug', 'js-production', 'appcache']);
gulp.watch('app/lib/',                ['lib', 'appcache']);
gulp.watch('app/*.webmanifest',       ['manifest']);
