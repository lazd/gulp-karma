/*jshint node:true */

'use strict';

var extend = require('xtend');
var path = require('path');
var spawn = require('child_process').spawn;
var karmaParseConfig = require('karma/lib/config').parseConfig;

var runner = require('karma').runner;

var methods = {
  start: function(cb, options) {

    if (this._serverStarted) {
      console.log('Karma server already started');
      return;
    }

    var self = this;
    this._serverStarted = true;

    options = extend(this.options, options);

    if (options.debug) {
      console.log('Starting Karma server...');
    }

    // Start the server
    // A child process is used because server.start() refuses to die unless you do a process.exit()
    // Doing a process.exit() would muck with gulp, so we have to take other measures
    // See https://github.com/karma-runner/karma/issues/734
    var child = this.child = spawn(
      'node',
      [
        path.join(__dirname, 'lib', 'background.js'),
        JSON.stringify(options)
      ],
      {
        stdio: [
          'pipe',
          'pipe',
          'pipe'
        ]
      }
    );

    // Cleanup when the child process exits
    child.on('exit', function(code) {
      if (self.options.debug) {
        console.log('Karma server ended');
      }

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

      if (str.match(/Starting browser/)) {
        // Store the number of browsers we're waiting to capture
        self._browsersLeft++;
      }

      if (str.match(/Connected/)) {
        // Do nothing unless we're waiting
        // Otherwise, reconnects can result in negative _browsersLeft
        if (!self._serverReady) {
          // One less browser to wait for
          self._browsersLeft--;

          if (self._browsersLeft === 0) {
            self._handleServerReady();
          }
          else {
            if (self.options.debug) {
              console.log('Waiting for '+self._browsersLeft+' browsers...');
            }
          }
        }
      }
    });

    return this;
  },

  stop: function() {
    if (this.child) {
      if (this.options.debug) {
        console.log('Killing Karma server...');
      }
      this.child.kill();
    }
    else if (this.options.debug) {
      console.log('Karma server not running');
    }

    return this;
  },

  once: function(cb, options) {
    this.start(cb, extend(options, {
      singleRun: true,
      autoWatch: false // @todo might not be needed
    }));

    return this;
  },

  run: function(cb, options) {
    if (!this._serverReady) {
      this._runWhenServerReady = true;
      return;
    }

    var self = this;

    // Runner and server will the same output
    // Stop the server's output from displaying
    this._ignoreServerOutput = true;
    runner.run(extend(this.options, options), function(code) {
      self._ignoreServerOutput = false;

      if (typeof cb === 'function') {
        cb(code);
      }
    });

    return this;
  },

  _handleServerReady: function() {
    this._serverReady = true;

    if (this._runWhenServerReady) {
      this.run();
      this._runWhenServerReady = false;
    }
  }
};

var karmaHelper = function(options) {
  options.configFile = path.resolve(options.configFile);

  return extend({}, methods, {
    options: options,

    // Disables server output
    _ignoreServerOutput: false,

    // The numbers of browsers remaining to be captures
    _browsersLeft: 0,

    // Whether a child process has been started for the server
    _serverStarted: false,

    // Whether to perform a run when the server is ready
    _runWhenServerReady: false
  });
};

module.exports = karmaHelper;
