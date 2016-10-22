(function () {
    'use strict';
    angular
        .module('app.widgets')
        .directive('wrMaxItem', wrMaxItem);
    function wrMaxItem() {
        var directive = {
            restrict: 'E',
            scope: {
                'item': '=',
                'saveChanges': '@',
                'mode': '@',
                'movementRefresh': '&'
            },
            bindToController: true,
            templateUrl: 'app/widgets/wrMaxItem.html',
            controller: 'MaxItemCtrl as mi'
        };
        return directive;
    }
})();
