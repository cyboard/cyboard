var _ = require('lodash');

module.exports = function($scope, $stateParams, $http, websocket) {

    var board = _.find($scope.boards, {'slug': $stateParams.board});

    $scope.currentBoard = board

    websocket.on('data', function(data) {
        $scope.$apply(function() {
            _.each(data, function(widgetData, index) {
                board.widgets[index].data = widgetData;
            });
        });
    });
};