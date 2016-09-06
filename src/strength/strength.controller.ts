/// <reference path="../../typings/tsd.d.ts" />
(function() {
    'use strict';

    angular
        .module('app.strength')
        .controller('StrengthCtrl', StrengthCtrl);

    StrengthCtrl.$inject = ['$state', '$ionicHistory', 'dataservice'];

    function StrengthCtrl($state, $ionicHistory, dataservice) {
        var vm = this;

        var isIPad = ionic.Platform.isIPad();
        var isIOS = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();
        vm.iOS = false;
        if (isIPad || isIOS) {
            vm.iOS = true;
        }

        vm.mL = [];
        vm.m = {};

        vm.movementRefresh = movementRefresh;

        dataservice.checkDisclaimer().then(function(disclaimer) {
            if (disclaimer) {
                movementRefresh();
            } else {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('app.disclaimer');
            }
        });

        function movementRefresh () {
            vm.mL = [];
            vm.m = {};
            dataservice.getMovements().then(function(movements) {
                angular.copy(movements, vm.m);
                angular.copy(dataservice.getMovementList(), vm.mL);
            });
        }
    }
})();
