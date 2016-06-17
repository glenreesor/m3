/* eslint no-var: 0 */

//-----------------------------------------------------------------------------
// Gulp plugins
//-----------------------------------------------------------------------------
var browserify    = require('browserify');
var buffer        = require('gulp-buffer');
var eslint        = require('gulp-eslint');
var footer        = require('gulp-footer');
var gulp          = require('gulp');
var gutil         = require('gulp-util');
var shell         = require('gulp-shell');
var source        = require('vinyl-source-stream');
var sourcemaps    = require('gulp-sourcemaps');
var uglify        = require('gulp-uglify');

//-----------------------------------------------------------------------------
// Output folders
//-----------------------------------------------------------------------------
var debugDir = 'out/debug';
var productionDir = 'out/production';

//-----------------------------------------------------------------------------
// Fast things that don't need to be in parallel, and which will finish before
// everything else.
//
// If they are separate tasks, then output is polluted with all their start
// and stop messages.
//-----------------------------------------------------------------------------
gulp.task('fast', function() {
   var result;

   //--------------------------------------------------------------------------
   // Deprecated appcache
   //--------------------------------------------------------------------------
   result = gulp.src('app/m3.appcache*')
      .pipe(footer('#Timestamp to force browser reload: ${timestamp}\n',
                   {timestamp: Date.now()}))
      .pipe(gulp.dest(debugDir))
      .pipe(gulp.dest(productionDir));

   //--------------------------------------------------------------------------
   // CSS
   //--------------------------------------------------------------------------
   result = gulp.src('app/src/*.css')
      .pipe(gulp.dest(debugDir))
      .pipe(gulp.dest(productionDir));

   //--------------------------------------------------------------------------
   // HTML
   //--------------------------------------------------------------------------
   result = gulp.src('app/src/*.html')
      .pipe(gulp.dest(debugDir))
      .pipe(gulp.dest(productionDir));

   //--------------------------------------------------------------------------
   // Images
   //--------------------------------------------------------------------------
   result = gulp.src('app/images/*')
      .pipe(gulp.dest(debugDir))
      .pipe(gulp.dest(productionDir));

   //--------------------------------------------------------------------------
   // Libs
   //--------------------------------------------------------------------------
   result = gulp.src('app/lib/*.js')
      .pipe(gulp.dest(debugDir))
      .pipe(gulp.dest(productionDir));

   //--------------------------------------------------------------------------
   // Webmanifest
   //--------------------------------------------------------------------------
   result = gulp.src('app/manifest.webmanifest')
      .pipe(gulp.dest(debugDir))
      .pipe(gulp.dest(productionDir));
});

//-----------------------------------------------------------------------------
// JS Lint
//-----------------------------------------------------------------------------
gulp.task('js-lint', function() {
   return gulp.src(['app/src/*.js'])
      .pipe(eslint())
      .pipe(eslint.format());
});

//-----------------------------------------------------------------------------
// Javascript Processing
//    - Although the debugger uses sourcemaps to show proper original source,
//      Firefox runtime errors do not use sourcemaps
//    - Therefore we need separate non-uglified output for debugging
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
      .pipe(gulp.dest(debugDir));
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
      .pipe(gulp.dest(productionDir));
});

//-----------------------------------------------------------------------------
// Test Linting
//-----------------------------------------------------------------------------
gulp.task('test-lint', function() {
   return gulp.src(['test/unit/*.js'])
      .pipe(eslint())
      .pipe(eslint.format());
});

//-----------------------------------------------------------------------------
// Test Running
//-----------------------------------------------------------------------------
var cmd;
cmd = "./node_modules/babel-tape-runner/bin/babel-tape-runner " +
      "test/unit/*.js|faucet";
gulp.task('test-run', shell.task(
   [cmd]
));

//-----------------------------------------------------------------------------
// Tasks that are intended to be used from command line
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// dev (all tasks except test linting and running)
// Setup with dependencies on other tasks, so it's always the last one to
// print 'Finished'.
//-----------------------------------------------------------------------------
gulp.task('build', ['fast', 'js-lint', 'js-debug', 'js-production']);

//-----------------------------------------------------------------------------
// test (Run tests first, so linting output doesn't get lost)
//-----------------------------------------------------------------------------
gulp.task('test', ['test-run'], function() {
   gulp.start('test-lint');
});

//-----------------------------------------------------------------------------
// All (all tasks)
//-----------------------------------------------------------------------------
gulp.task('all', ['build', 'test']);

//-----------------------------------------------------------------------------
// Default - Just provide options
//-----------------------------------------------------------------------------
gulp.task('default', shell.task(
   [
      "echo 'Gulp Targets'",
      "echo '   all      (All tasks)'",
      "echo '   build    (All tasks except test linting and running)'",
      "echo '   test     (Test linting and running)'"
   ]
));
