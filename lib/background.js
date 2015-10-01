var Server = require('karma').Server;
var data = JSON.parse(process.argv[2]);
new Server(data).start();
