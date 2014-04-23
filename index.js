/*jshint node:true */

'use strict';

var extend = require('xtend');
var path = require('path');
var spawn = require('child_process').spawn;
var karmaParseConfig = require('karma/lib/config').parseConfig;
var Q = require('q');

var runner = require('karma').runner;

var karmaHelper = function(options) {
  var obj = {
    start: start,
    stop: stop,
    run: run,
    once: once
  };

  // Store debug mode based on options in first invocation
  var debug = options.debug;

  // Disables server output
  var ignoreServerOutput = false;

  // Whether a child process has been started for the server
  var serverStarted = false;

  // Whether the server is ready to run tests
  // At least one browser is connected
  var serverReady = false;

  // Whether to perform a run when the server is ready
  var runWhenServerReady = false;

  // The numbers of browsers remaining to be captures
  var browsersLeft = 0;

  // The child process
  var child;

  //Location of the wrapper background script
  var background = path.join(__dirname, 'lib', 'background.js');

  // Process options
  options.configFile = path.resolve(options.configFile);

  // The promise that will be fulfilled when the server is started
  var readyDefer = Q.defer();

  function start(newOptions) {
    newOptions = extend(options, newOptions);

    if (serverStarted) {
      if (debug) {
        console.log('Karma server already started');
      }

      return readyDefer.promise;
    }

    // Store that we've spawned the server
    serverStarted = true;

    if (debug) {
      console.log('Starting Karma server...');
    }

    // Start the server
    // A child process is used because server.start() refuses to die unless you do a process.exit()
    // Doing a process.exit() would muck with gulp, so we have to take other measures
    // See https://github.com/karma-runner/karma/issues/734 and https://github.com/karma-runner/karma/issues/1035
    child = spawn(
      'node',
      [
        background,
        JSON.stringify(newOptions)
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
      if (debug) {
        console.log('Karma server stopped');
      }
    });

    child.stderr.on('data', function(data) {
      if (!ignoreServerOutput) {
        process.stderr.write(data);
      }
    });

    child.stdout.on('data', function(data) {
      if (!ignoreServerOutput) {
        process.stdout.write(data);
      }

      var str = data.toString();

      // Gross, awful hack, but there's no way to know when Karma has captured browsers
      if (str.match(/Starting browser/)) {
        // Store the number of browsers we're waiting to capture
        browsersLeft++;

        if (debug) {
          console.log('Waiting for '+browsersLeft+' browsers...');
        }
      }
      else if (str.match(/Connected/)) {
        // Do nothing unless we're waiting
        // Otherwise, reconnects can result in negative browsersLeft
        if (!serverReady) {
          // One less browser to wait for
          browsersLeft--;

          if (browsersLeft === 0) {
            readyDefer.resolve();
          }
          else if (debug) {
            console.log('Browser connected! Waiting for '+browsersLeft+' more...');
          }
        }
      }
    });

    return readyDefer.promise;
  }

  function stop() {
    var deferred = Q.defer();

    if (child) {
      if (debug) {
        console.log('Killing Karma server...');
      }

      child.kill();
      deferred.resolve();
    }
    else {
      if (debug) {
        console.log('Karma server not running');
      }

      deferred.reject(new Error('Karma server not running'));
    }

    return deferred.promise;
  }

  function once(newOptions) {
    var deferred = Q.defer(), oncePs;
    newOptions = extend(options, newOptions, {singleRun: true});

    oncePs = spawn(
      'node',
      [
        background,
        JSON.stringify(newOptions)
      ],
      {
        stdio: 'inherit'
      }
    );

    oncePs.on('exit', function (code) {
      if (code) {
        deferred.reject(new TestsFailedError(code));
      }
      else {
        deferred.resolve();
      }
    });

    return deferred.promise;
  }

  function run(newOptions) {
    return start().then(function() {
      var deferred = Q.defer();

      // Runner and server will the same output
      // Stop the server's output from displaying
      ignoreServerOutput = true;
      runner.run(extend(options, newOptions), function(code) {
        ignoreServerOutput = false;

        if (code) {
          deferred.reject(new TestsFailedError(code));
        }
        else {
          deferred.resolve();
        }
      });

      return deferred.promise;
    });
  }


  function TestsFailedError(code) {
    Error.call(this, 'Tests failed with code '+code);
    this.code = code;
  }

  TestsFailedError.prototype = Object.create(Error.prototype);
  TestsFailedError.prototype.constructor = TestsFailedError;

  return obj;
};

module.exports = karmaHelper;
