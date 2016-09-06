/// <reference path="../../typings/tsd.d.ts" />
(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('wrWodItem', wrWodItem);


    function wrWodItem() {
        var directive = {
            restrict: 'E',
            scope: {
                'item': '=',
                'initWods': '&'
            },
            bindToController: true,
            templateUrl: 'app/widgets/wrWodItem.html',
            controller: 'WodItemCtrl as wi'
        };
        return directive;
    }
})();
