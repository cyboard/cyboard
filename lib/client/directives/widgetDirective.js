var _ = require('lodash');

module.exports = function($templateRequest, $compile, $interpolate) {

    typeCounts = {};

    return {
        restrict: 'E',
        link: function($scope, $element, $attrs) {
            var type = $scope.type,
                newScope = $scope.$new();

            var templates = [
                '/templates/' + $attrs.type + '.html',
                '/templates/' + $attrs.type + '-' + $attrs.id + '.html',
                '/templates/' + $attrs.board + '-' + $attrs.type + '.html',
                '/templates/' + $attrs.board + '-' + $attrs.type + '-' + $attrs.id + '.html'
            ];

            newScope.$watch($attrs.data, function(data) {
                _.extend(newScope, data);
            });

            typeCounts[type] = typeCounts[type] || 0

            function tryToLoadNextTemplate() {
                $templateRequest(templates.pop(), true).then(function(template) {
                    $element.append($compile(template)(newScope));
                }, function(response) {
                    if (templates.length === 0) {
                        throw new Error('No template could be loaded for widget ' + $attrs.type);
                    }
                    tryToLoadNextTemplate();
                });
            };

            tryToLoadNextTemplate();
        }
    }
}
