var data = JSON.parse(process.argv[2]);
var Server = require('karma').Server;

new Server(data).start();
