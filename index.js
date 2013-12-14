/*jshint node:true */

'use strict';

var gutil = require('gulp-util');
var c = gutil.colors;
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
    background: false
    // allow passing of cli args on as client args, for example --grep=x
    // clientArgs: optimist.argv,
    // client: { args: optimist.argv }
  }, options);


  if (options.configFile) {
    options.configFile = path.resolve(options.configFile);
  }

  console.log('Karma options:', options);

  // Just start the server
  if (options.background) {
    startKarmaServer();
    return;
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
    console.log('Starting Karma server...');

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
      console.log('Karma child process ended');
      done();
    });    
  }

  function runKarma() {
    if (options.serverStarted) {
      // Just run
      runner.run(options, function() {
        console.log('Karma run finished');
        done();
      });
    }
    else {
      startKarmaServer();
    }
  }

  var files = [];
  function queueFile(file) {
    if (file) {
      files.push(file.path);
      console.log('Queueing:', file.path);
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
