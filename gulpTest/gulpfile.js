var gulp = require('gulp');
var karma = require('../index.js');
var es = require('event-stream');

var includeOrder = [
  'client/scripts/todo/todo.js',
  'client/scripts/todo/todo.polyfills.js',
  'client/scripts/todo/todo.util.js',
  'client/scripts/todo/todo.App.js',
  'test/client/**/*.js'
];

gulp.task('test', function() {
  return gulp.src(includeOrder)
    .pipe(karma({
      configFile: 'karma.conf.js',
      singleRun: true
    }));
});

gulp.task('test-watch', function() {
  return gulp.src(includeOrder)
    .pipe(karma({
      serverStarted: true
    }));
})

// default task gets called when you run the `gulp` command
gulp.task('default', function() {
  // Start the Karma server
  karma({
    configFile: 'karma.conf.js',
    background: true
  });

  // Run the tests when the files change
  gulp.watch(includeOrder, function(event) {
    gulp.run('test-watch')
  });
});
