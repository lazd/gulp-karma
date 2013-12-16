/*jshint node:true */

'use strict';

var gutil = require('gulp-util');
var c = gutil.colors;
var q = require('q');
var es = require('event-stream');
var extend = require('xtend');
var path = require('path');
var spawn = require('child_process').spawn;
// var optimist = require('optimist');

var runner = require('karma').runner;
var server = require('karma').server;

var karmaPlugin = function(options) {
  var child;
  var stream;

  options = extend({
    autoWatch: false,
    serverStarted: false,
    background: false,
    singleRun: false
    // allow passing of cli args on as client args, for example --grep=x
    // clientArgs: optimist.argv,
    // client: { args: optimist.argv }
  }, options);


  if (options.configFile) {
    options.configFile = path.resolve(options.configFile);
  }

  // Just start the server
  if (options.background) {
    startKarmaServer();
  }

  function done(code) {
    // Stop the server if it's running
    if (child) {
      child.kill();
    }

    // End the stream if it exists
    if (stream) {
      stream.emit('end');
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
        stdio: 'inherit'
      }
    );

    // Cleanup when the child process exits
    child.on('exit', function() {
      // gutil.log('Karma child process ended');
      done();
    });
  }

  function runKarma() {
    if (options.run) {
      gutil.log('Karma options on run:', options);

      delete options.files;
      options.addedFiles = files;
      // Run without starting the server
      runner.run(options, function() {
        done();
      });
    }
    else {
      // Start the server
      // Tests will be run if options.singleRun is set
      startKarmaServer();
    }
  }

  var files = [];
  function queueFile(file) {
    if (file) {
      gutil.log('Queueing file '+file.path);
      files.push(file.path);
    }
    else {
      throw new Error('Got undefined file');
    }
  }

  function endStream() {
    // Override files if they were piped
    if (files.length) {
      options.files = files;
    }

    runKarma();
  }

  stream = es.through(queueFile, endStream);;

  return stream;
};

module.exports = karmaPlugin;
