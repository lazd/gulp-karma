var gulp = require('gulp');
var karma = require('../index.js');
var es = require('event-stream');

gulp.task('test', function(cb) {
  gulp.src([
      'client/scripts/todo/todo.js',
      'client/scripts/todo/todo.polyfills.js',
      'client/scripts/todo/todo.util.js',
      'client/scripts/todo/todo.App.js',
      'test/client/**/*.js'
    ])
    .pipe(karma({
      configFile: 'karma.conf.js',
      singleRun: true
    }));
});

// default task gets called when you run the `gulp` command
gulp.task('default', function() {
  gulp.run('test');
  // gulp.watch('tests/*.js', function(event){
  //   gulp.run('test');
  // });
});
