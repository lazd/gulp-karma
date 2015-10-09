var server = require('karma').server;
process.stdin.on('readable', function () {
    var list = process.stdin.read();
    if (list) {
        var data = JSON.parse(list);
        server.start(data);
    }
});
