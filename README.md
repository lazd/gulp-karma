# gulp-karma [![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url]
> CSSLint plugin for gulp 3

## Usage

First, install `gulp-karma` as a development dependency:

```shell
npm install --save-dev gulp-karma
```

Then, add it to your `gulpfile.js`:

```javascript
var karma = require('gulp-karma');

gulp.task('css', function() {
  gulp.src('test/*.js')
    .pipe(karma())
    .pipe(karma.reporter());
});
```

## API

### karma(karmaConfig)

#### karmaConfig
Type: `String`

Pass the path to your `karma.conf.js` file instead of a rule configuration object.

```javascript
gulp.src('./client/css/*.css')
  .pipe(karma('karma.conf.js'))
  .pipe(karma.reporter());
```

## Results

Adds the following properties to the file object:

```javascript
file.karma.success = true; // or false
file.karma.errorCount = 0; // number of errors returned by CSSLint
file.karma.results = []; // CSSLint errors
file.karma.opt = {}; // The options you passed to CSSLint
```

## Custom Reporters

Custom reporter functions can be passed as `cssline.reporter(reporterFunc)`. The reporter function will be called for each linted file and passed the file object as described above.

```javascript
var karma = require('gulp-karma');
var gutil = require('gulp-util');

var customReporter = function(file) {
  gutil.log(gutil.colors.cyan(file.karma.errorCount)+' errors in '+gutil.colors.magenta(file.path));

  file.karma.results.forEach(function(result) {
    gutil.log(result.error.message+' on line '+result.error.line);
  });
};

gulp.task('lint', function() {
  gulp.files('./lib/*.js')
    .pipe(karma())
    .pipe(karma.reporter(customReporter));
});
```

[travis-url]: http://travis-ci.org/lazd/gulp-karma
[travis-image]: https://secure.travis-ci.org/lazd/gulp-karma.png?branch=master
[npm-url]: https://npmjs.org/package/gulp-karma
[npm-image]: https://badge.fury.io/js/gulp-karma.png
