/*jshint node:true */

'use strict';

var gutil = require('gulp-util');
var c = gutil.colors;
var Q = require('q');
var extend = require('xtend');
var path = require('path');
var spawn = require('child_process').spawn;
// var optimist = require('optimist');

var runner = require('karma').runner;
var server = require('karma').server;

var karmaPlugin = function(options) {
  var deferred = Q.defer();
  var child;

  options = extend({
    autoWatch: false,
    run: false,
    background: false,
    singleRun: false
    // allow passing of cli args on as client args, for example --grep=x
    // clientArgs: optimist.argv,
    // client: { args: optimist.argv }
  }, options);


  if (options.configFile) {
    options.configFile = path.resolve(options.configFile);
  }

  function done(code) {
    // Stop the server if it's running
    if (child) {
      child.kill();
    }

    // Resolve the promise
    deferred.resolve();
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

  // Just start the server, optionally running/exiting if singleRun is set
  if (options.background || options.singleRun) {
    startKarmaServer();
  }
  else if (options.run) {
    // Perform a run with the server already started
    runner.run(options, function() {
      done();
    });
  }

  return deferred.promise;
};

module.exports = karmaPlugin;
