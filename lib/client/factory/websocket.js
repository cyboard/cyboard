module.exports = function($location, $window) {
    var socket = io(),
        lastVersion;

    socket.on('checkversion', function(currentVersion) {
        if(lastVersion && lastVersion !== currentVersion) {
            // Reload entire page to refresh client scripts and styles
            $window.location.href = $window.location.href;
        };
        lastVersion = currentVersion;
    });

    var sequence = 0,
        pings = new Array(10);

//    setInterval(function() {
//        pings[sequence] = Date.now();
//        socket.emit('ping', sequence);
//        sequence = sequence < pings.length - 1 ? sequence + 1 : 0;
//    }, 500)

    socket.on('pong', function(sequence) {
        console.info('ping: ' + (Date.now() - pings[sequence]) + 'ms');
    });

    return socket;
}