module.exports = function($stateProvider, $urlRouterProvider, $locationProvider) {

    if ($locationProvider) {
        $locationProvider.html5Mode(true);
    }

    if ($urlRouterProvider) {
        $urlRouterProvider.when('/', '/boards');
    }

    $stateProvider
        .state('overview', {
            url: '/',
            templateUrl: '/templates/overview.html'
        })

        .state('boards', {
            url: '/boards',
            controller: 'OverviewController',
            templateUrl: '/templates/overview.html',
            resolve: {
                boards: function(boardsConfig) {
                    return boardsConfig
                }
            }
        })

        .state('boards.board', {
            url: '/:board',
            controller: 'BoardController',
            templateUrl: '/templates/board.html',
            onEnter: function(websocket, $stateParams) {
                this.joinSocketRoom = function() {
                    websocket.emit('join', $stateParams.board);
                };
                websocket.on('reconnect', this.joinSocketRoom);
                this.joinSocketRoom();
            },
            onExit: function(websocket, $stateParams) {
                websocket.emit('leave', $stateParams.board);
                websocket.off('reconnect', this.joinSocketRoom);
            }
        });

}