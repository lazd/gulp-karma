/*jshint node:true */

'use strict';

var gutil = require('gulp-util');
var c = gutil.colors;
var es = require('event-stream');
var extend = require('xtend');
var path = require('path');
var spawn = require('child_process').spawn;

var server = require('karma').server;
var runner = require('karma').runner;

var karmaPlugin = function(options) {
  var child;
  var stream;
  var files = [];

  options = extend({
    action: 'run'
  }, options);

  var action = options.action;

  // Remove option in case Karma uses it in the future
  delete options.action;

  if (action === 'watch') {
    // Never set singleRun in background mode
    options.singleRun = false;

    // Enable watching
    options.autoWatch = true;
  }
  else if (action === 'run') {
    // Tell Karma to run once and exit
    options.singleRun = true;

    // Disable watching
    options.autoWatch = false;
  }
  // use 'start' action for support native gulp watch mechanism
  else if (action === 'start') {
    // Never set singleRun in background mode
    options.singleRun = false;

    // Disable watching
    options.autoWatch = false;
  }

  if (options.configFile) {
    options.configFile = path.resolve(options.configFile);
  }

  function done(code) {
    // Stop the server if it's running
    if (child) {
      child.kill();
    }

    // End the stream if it exists
    if (stream) {
      if (code) {
        stream.emit('error', new gutil.PluginError('gulp-karma', 'karma exited with code ' + code));
      }
      else {
        stream.emit('end');
      }
    }
  }

  function startKarmaServer() {
    gutil.log('Starting Karma server...');

    // Start the server
    child = spawn(
      'node',
      [
        path.join(__dirname, 'lib', 'background.js'),
        JSON.stringify(options)
      ],
      {
        stdio: (action === 'start') ? 'ignore' : 'inherit'
      }
    );

    // Cleanup when the child process exits
    child.on('exit', function(code) {
      // gutil.log('Karma child process ended');
      done(code);
    });
  }

  function queueFile(file) {
    if (file) {
      // gutil.log('Queueing file '+file.path);
      files.push(file.path);
    }
    else {
      stream.emit('error', new Error('Got undefined file'));
    }
  }

  function endStream() {
    // Override files if they were piped
    // This doesn't work with the runner, but works fine with singleRun and autoWatch
    if (files.length) {
      options.files = files;
    }

    // Start the server
    // If options.singleRun: Server starts, tests run, task completes
    // If options.background: Server starts, tests run, files watched
    startKarmaServer();
  }

  stream = es.through(queueFile, endStream);

  return stream;
};


// Manually runs tests on an already running server
// Usefull for use with gulp.watch or gulp-watch plugin
karmaPlugin.run = function(options) {
  var stream, buffer = [];

  options = extend({}, options);


  // Remove option in case Karma uses it in the future
  delete options.action;

  function cb(code) {
    if (code) {
      stream.emit('error', new gutil.PluginError('gulp-karma', 'karma runner exited with code ' + code));
    }
    else {
      while (buffer.length) {
        stream.emit('data', buffer.shift());
      }
      stream.emit('end');
    }
  }

  function endStream() {
    runner.run(options, cb);
  }

  function queueFile(file) {
    buffer.push(file);
  }

  stream = es.through(queueFile, endStream);
  return stream;
};

module.exports = karmaPlugin;
