/*jshint node:true */

'use strict';

var gutil = require('gulp-util');
var extend = require('xtend');
var path = require('path');
var spawn = require('child_process').spawn;
var karmaParseConfig = require('karma/lib/config').parseConfig;

var runner = require('karma').runner;

var karmaPlugin = function(options) {
  options.configFile = path.resolve(options.configFile);

  return {
    _ignoreServerOutput: false, // On when running with runner
    _browsers: 0,
    _waitingForBrowsers: true,
    _serverStarted: false,
    _serverReady: false,
    _runQueued: false,
    _runIfQueued: function() {
      if (this._runQueued) {
        this.run();
        this._runQueued = false;
      }
    },
    options: options,
    start: start,
    stop: stop,
    run: run,
    once: once
  };
};

function start(cb, options) {
  var self = this;

  if (this._serverStarted) {
    gutil.log('Karma server already started');
    return;
  }

  this._serverStarted = true;

  gutil.log('Starting Karma server...');

  options = extend(this.options, options);

  // Start the server
  // A child process is used because server.start() refuses to die unless you do a process.exit()
  // See https://github.com/karma-runner/karma/issues/734
  var child = this.child = spawn(
    'node',
    [
      path.join(__dirname, 'lib', 'background.js'),
      JSON.stringify(options)
    ]
  );

  // Cleanup when the child process exits
  child.on('exit', function(code) {
    gutil.log('Karma server ended');

    if (typeof cb === 'function') {
      cb(code);
    }
  });

  child.stderr.on('data', function(data) {
    if (!self._ignoreServerOutput) {
      process.stderr.write(data);
    }
  });

  child.stdout.on('data', function(data) {
    if (!self._ignoreServerOutput) {
      process.stdout.write(data);
    }

    var str = data.toString();

    if (str.match(/Karma .*? server started/)) {
      gutil.log('Karma server ready');
      self._serverReady = true;
    }

    if (str.match(/Starting browser/)) {
      // Store the number of browsers we're waiting to capture
      self._browsers++;
      self._waitingForBrowsers = true;
      gutil.log('Waiting for '+self._browsers+' browsers...');
    }

    if (str.match(/Connected/)) {
      // Do nothing unless we're waiting
      if (!self._waitingForBrowsers) {
        return;
      }

      self._browsers--;
      if (self._browsers === 0) {
        self._waitingForBrowsers = false;
        gutil.log('All browsers captured!');
        self._runIfQueued();
      }
      else {
        gutil.log('Waiting for '+self._browsers+' browsers...');
      }
    }
  });

  return this;
}

function stop() {
  if (this.child) {
    gutil.log('Killing Karma server');
    this.child.kill();
  }
  else {
    gutil.log('Karma server not running');
  }

  return this;
};

function once(cb, options) {
  this.start(cb, extend(options, {
    singleRun: true,
    autoWatch: false // @todo might not be needed
  }));

  return this;
};

function run(cb, options) {
  var self = this;

  if (!this._serverReady) {
    this._runQueued = true;
    return;
  }

  this._ignoreServerOutput = true;
  runner.run(extend(this.options, options), function(code) {
    self._ignoreServerOutput = false;

    gutil.log('Karma run completed '+(code === 0 ? 'successfully' : 'with error '+code));

    if (typeof cb === 'function') {
      cb(code);
    }
  });

  return this;
};

module.exports = karmaPlugin;
