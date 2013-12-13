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
  options = extend({
    background: false,
    // allow passing of cli args on as client args, for example --grep=x
    // clientArgs: optimist.argv,
    // client: { args: optimist.argv }
  }, options);


  if (options.configFile) {
    options.configFile = path.resolve(options.configFile);
  }

  console.log('Karma options:', options);

  function startKarmaServer() {
    console.log('Starting Karma server...');

    var childProcess = spawn(
      'node',
      [
        path.join(__dirname, 'lib', 'background.js'),
        JSON.stringify(options)
      ],
      {
        stdio: 'pipe'
      }
    );

    childProcess.on('exit', function() {
      console.log('Karma child process ended');
      done();
    });    
  }

  function runKarma() {
    server.start(options, function(code) {
      console.log('Karma finished with ', code);
      done();
    });

    // Support `karma run`, useful for watch tasks
    // if (options.run) {
    //     runner.run(options, function() {
    //       console.log('Karma finished');
    //       childProcess.kill();
    //       done();
    //     });
    //   return;
    // }
  }

  var files = [];
  function queueFile(file) {
    if (file) {
      files.push(file.path);
      console.log('Queueing:', file.path);
    }
    else {
      console.log('Got empty file:', file);
    }
  }

  function endStream() {
    // Override files if they were piped
    if (files.length) {
      options.files = files;
    }

    runKarma();
  }

  var stream = es.through(queueFile, endStream);;

  var done = (function done(code) {
    this.emit('end');

    // process.exit(); // Wrong, but node needs a kill -9 without this
  }).bind(stream);

  return stream;
};

module.exports = karmaPlugin;
