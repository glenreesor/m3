var gulp          = require('gulp'),
    browserify    = require('browserify'),
    buffer        = require('gulp-buffer'),
    eslint        = require('gulp-eslint'),
    footer        = require('gulp-footer'),
    gutil         = require('gulp-util'),
    shell         = require('gulp-shell'),
    source        = require('vinyl-source-stream'),
    sourcemaps    = require('gulp-sourcemaps'),
    uglify        = require('gulp-uglify');

//-----------------------------------------------------------------------------
// Appcache (this is the deprecated W3C appcache)
//-----------------------------------------------------------------------------
gulp.task('appcache', function() {
   return gulp.src('app/m3.appcache*')
      .pipe(footer('#Timestamp to force browser reload: ${timestamp}\n', {timestamp: Date.now()}))
      .pipe(gulp.dest('out/debug'))
      .pipe(gulp.dest('out/production'));
});

//-----------------------------------------------------------------------------
// CSS Processing
//-----------------------------------------------------------------------------
gulp.task('css', function() {
   return gulp.src('app/src/*.css')
      .pipe(gulp.dest('out/debug'))
      .pipe(gulp.dest('out/production'));
});

//-----------------------------------------------------------------------------
// HTML Processing
//-----------------------------------------------------------------------------
gulp.task('html', function() {
   return gulp.src('app/src/*.html')
      .pipe(gulp.dest('out/debug'))
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
// JS Lint
//-----------------------------------------------------------------------------
gulp.task('js-lint', function() {
   return gulp.src(['app/src/*.js'])
      .pipe(eslint())
      .pipe(eslint.format())
});

//-----------------------------------------------------------------------------
// Javascript Processing
//    - If we have just one task that creates uglified output, it makes
//      debugging a pain because runtime errors are described in terms of
//      the uglified line numbers and variable names,
//      rather than original sources
//
// Therefore one task for debug and one for production
//
// Yes this is inefficient because the browserify and babelify steps are
// performed for each of debug and production.
//-----------------------------------------------------------------------------
gulp.task('js-debug', function() {
   // Set up the browserify instance on a task basis
   var b = browserify({
      entries: ['./app/src/main.js', './app/src/windowOnLoad.js'],
      debug: true
   });

   return b.transform('babelify').bundle()
      .pipe(source('m3.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
         .on('error', gutil.log)
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./out/debug'));
});

gulp.task('js-production', function() {
   // Set up the browserify instance on a task basis
   var b = browserify({
      entries: ['./app/src/main.js', './app/src/windowOnLoad.js'],
      debug: true
   });

   return b.transform('babelify').bundle()
      .pipe(source('m3.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
         .pipe(uglify())
         .on('error', gutil.log)
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./out/production'));
});

//-----------------------------------------------------------------------------
// Lib Processing
//-----------------------------------------------------------------------------
gulp.task('lib', function() {
   return gulp.src('app/lib/*.js')
      .pipe(gulp.dest('out/debug'))
      .pipe(gulp.dest('out/production'))
});

//-----------------------------------------------------------------------------
// Test Linting
//-----------------------------------------------------------------------------
gulp.task('test-lint', function() {
   return gulp.src(['test/unit/*.js'])
      .pipe(eslint())
      .pipe(eslint.format())
});

//-----------------------------------------------------------------------------
// Test Running
//-----------------------------------------------------------------------------
gulp.task('test-run', shell.task(
   ["./node_modules/babel-tape-runner/bin/babel-tape-runner test/unit/*.js|faucet"]
));

//-----------------------------------------------------------------------------
// Webmanifest
//-----------------------------------------------------------------------------
gulp.task('manifest', function() {
   return gulp.src('app/appcache.webmanifest')
      .pipe(gulp.dest('out/debug'))
      .pipe(gulp.dest('out/production'));
});

//-----------------------------------------------------------------------------
// Default
//-----------------------------------------------------------------------------
gulp.task('default', function() {
   gulp.start('appcache', 'css', 'html', 'images',
              'js-lint', 'js-debug', 'js-production',
              'lib', 'manifest', 'test-lint', 'test-run');
});

//-----------------------------------------------------------------------------
// Watch everything. Note that appcache must be processed if *anything*
// changes so that appcache will always get a new timestamp, which forces
// browser to reload
//-----------------------------------------------------------------------------
gulp.watch('app/appcache.manifest*', ['appcache']);
gulp.watch('app/src/*.css', ['css', 'appcache']);
gulp.watch('app/src/*.html', ['html', 'appcache']);
gulp.watch('app/images/*', ['images', 'appcache']);
gulp.watch('app/lib/*', ['lib', 'appcache']);
gulp.watch('app/src/*.js', ['js-lint', 'js-debug', 'js-production',
           'appcache', 'test-run']);
gulp.watch('test/unit/*.js', ['test-lint', 'test-run']);
gulp.watch('app/*.webmanifest', ['manifest']);
