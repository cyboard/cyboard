var angular = require('angular-bsfy'),
    uiRouter = require('angular-ui-router'),
    ocLazyLoad = require('oclazyload');

angular.module('WallboardApp', ['ui.router', 'cyboard.plugins'])
    .config(require('./client/config/states'))
    .factory('websocket', require('./client/factory/websocket'))
    .factory('boardsConfig', require('./client/factory/boardsConfig'))
    .controller('OverviewController', require('./client/controllers/OverviewController'))
    .controller('BoardController', require('./client/controllers/BoardController'))
    .directive('widget', require('./client/directives/widgetDirective'))
    .filter('ensurePluralizeObject', require('./client/filters/ensurePluralizeObject'));