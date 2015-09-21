var Server = require('karma').server;
var data = JSON.parse(process.argv[2]);
var server = new Server(data, [done]);
server.start();
