module.exports = function($rootScope, $location, $window) {
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

    socket.on('pong', function(sequence) {
        console.info('ping: ' + (Date.now() - pings[sequence]) + 'ms');
    });

    socket.on('connect', function() {
        $rootScope.$apply(function() {
            $rootScope.offline = false;
        })
    });
    socket.on('connect_error', function() {
        $rootScope.$apply(function() {
            $rootScope.offline = true;
        });
    });

    return socket;
}