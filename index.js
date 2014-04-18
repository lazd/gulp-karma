/*jshint node:true */

'use strict';

var extend = require('xtend');
var path = require('path');
var spawn = require('child_process').spawn;
var karmaParseConfig = require('karma/lib/config').parseConfig;

var runner = require('karma').runner;


var karmaHelper = function(options) {
  var obj = {
    start: start,
    stop: stop,
    run: run,
    once: once
  };

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

  // Process options
  options.configFile = path.resolve(options.configFile);

  function start(cb, newOptions) {
    if (serverStarted) {
      console.log('Karma server already started');
      return;
    }

    // Store that we've spawned the server
    serverStarted = true;

    newOptions = extend(options, newOptions);

    if (newOptions.debug) {
      console.log('Starting Karma server...');
    }

    // Start the server
    // A child process is used because server.start() refuses to die unless you do a process.exit()
    // Doing a process.exit() would muck with gulp, so we have to take other measures
    // See https://github.com/karma-runner/karma/issues/734
    child = spawn(
      'node',
      [
        path.join(__dirname, 'lib', 'background.js'),
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
      if (newOptions.debug) {
        console.log('Karma server ended');
      }

      if (typeof cb === 'function') {
        cb(code);
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

      if (str.match(/Starting browser/)) {
        // Store the number of browsers we're waiting to capture
        browsersLeft++;
      }

      if (str.match(/Connected/)) {
        // Do nothing unless we're waiting
        // Otherwise, reconnects can result in negative browsersLeft
        if (!serverReady) {
          // One less browser to wait for
          browsersLeft--;

          if (browsersLeft === 0) {
            handleServerReady();
          }
          else {
            if (newOptions.debug) {
              console.log('Waiting for '+browsersLeft+' browsers...');
            }
          }
        }
      }
    });

    return obj;
  };

  function stop() {
    if (child) {
      if (options.debug) {
        console.log('Killing Karma server...');
      }
      child.kill();
    }
    else if (options.debug) {
      console.log('Karma server not running');
    }

    return obj;
  };

  function once(cb, newOptions) {
    start(cb, extend(newOptions, {
      singleRun: true,
      autoWatch: false // @todo might not be needed
    }));

    return obj;
  };

  function run(cb, newOptions) {
    if (!serverReady) {
      runWhenServerReady = true;
      return obj;
    }

    // Runner and server will the same output
    // Stop the server's output from displaying
    ignoreServerOutput = true;
    runner.run(extend(options, newOptions), function(code) {
      ignoreServerOutput = false;

      if (typeof cb === 'function') {
        cb(code);
      }
    });

    return obj;
  };

  function handleServerReady() {
    serverReady = true;

    if (runWhenServerReady) {
      run();
      runWhenServerReady = false;
    }
  }

  return obj;
};

module.exports = karmaHelper;
