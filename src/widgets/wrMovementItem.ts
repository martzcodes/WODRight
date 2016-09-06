/// <reference path="../../typings/tsd.d.ts" />
(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('wrMovementItem', wrMovementItem);


    function wrMovementItem() {
        var directive = {
            restrict: 'E',
            scope: {
                'item': '=',
                'saveChanges': '@',
                'mode': '@',
                'movementRefresh': '&'
            },
            bindToController: true,
            templateUrl: 'app/widgets/wrMovementItem.html',
            controller: 'MovementItemCtrl as mi'
        };
        return directive;
    }
})();
