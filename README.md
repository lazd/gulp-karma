# gulp-karma [![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url]
> Karma plugin for gulp 3

## Usage

First, install `gulp-karma` as a development dependency:

```shell
npm install --save-dev gulp-karma
```

Then, add it to your `gulpfile.js`:

```javascript
var karma = require('gulp-karma');

var testFiles = [
  'client/todo.js',
  'client/todo.util.js',
  'client/todo.App.js',
  'test/client/*.js'
];

gulp.task('test', function() {
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));
});

gulp.task('default', function() {
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
});
```

## API

### karma(options)

#### options.configFile
Type: `String`

The path to the Karma configuration file.

#### options.action
Type: `String`  
Default: `run`

One of the following:

  * **`run`**: Start the server, run tests once, then exit.
  * **`watch`**: Start the server, run tests once, then watch for changes and run when files change.

#### options.*

Any Karma option can be passed as part of the options object. See [Karma Configuration] for a complete list of options. **Note:** It's best practice to put options in your Karma config file.


[Karma Configuration]: http://karma-runner.github.io/0.10/config/configuration-file.html
[travis-url]: http://travis-ci.org/lazd/gulp-karma
[travis-image]: https://secure.travis-ci.org/lazd/gulp-karma.png?branch=master
[npm-url]: https://npmjs.org/package/gulp-karma
[npm-image]: https://badge.fury.io/js/gulp-karma.png
