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

gulp.task('test', function() {
  return karma({
    configFile: 'karma.conf.js',
    singleRun: true
  });
});

gulp.task('default', function() {
  return karma({
    configFile: 'karma.conf.js',
    background: true,
    autoWatch: true
  });
});
```

## API

### karma(options)

gulp-karma works differently that most gulp plugins as it does not deal with streams. Karma is written in such a way that passing updated file lists to the server is impossible, so watch cannot be handled by gulp and must be handled by Karma.

#### options
Type: `Object`

##### options.configFile
Type: `String`

The path to the Karma configuration file.

##### options.singleRun
Type: `Boolean`
Default: `false`

Start the server, run tests once, then exit.

##### options.background
Type: `Boolean`
Default: `false`

Start the server in the background. Requires a Karma configuration file.

##### options.autoWatch
Type: `Boolean`
Default: `false`

Watch files and run tests when they change. **Note:** This could not be implemented using gulp's watch.


[travis-url]: http://travis-ci.org/lazd/gulp-karma
[travis-image]: https://secure.travis-ci.org/lazd/gulp-karma.png?branch=master
[npm-url]: https://npmjs.org/package/gulp-karma
[npm-image]: https://badge.fury.io/js/gulp-karma.png
