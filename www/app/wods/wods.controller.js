(function () {
    'use strict';
    angular
        .module('app.wods')
        .controller('WodsCtrl', WodsController);
    WodsController.$inject = ['$state', '$timeout', '$q', 'dataservice', 'wodservice', '$ionicTabsDelegate'];
    function WodsController($state, $timeout, $q, dataservice, wodservice, $ionicTabsDelegate) {
        var vm = this;
        var isIPad = ionic.Platform.isIPad();
        var isIOS = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();
        vm.iOS = false;
        if (isIPad || isIOS) {
            vm.iOS = true;
        }
        vm.wods = [];
        vm.mL = [];
        vm.m = {};
        vm.filter = {
            search: ''
        };
        vm.inCurrent = inCurrent;
        vm.newWOD = newWOD;
        vm.initWODs = initWODs;
        initWODs();
        function initWODs() {
            $timeout(function () {
                $ionicTabsDelegate.select(1);
            }, 10);
            wodservice.getSavedWODs().then(function (wods) {
                vm.wods = angular.copy(wods);
                dataservice.getWODHistories().then(function (histories) {
                    vm.histories = histories;
                });
            });
        }
        function newWOD() {
            $state.go('app.newwod');
        }
        function inCurrent() {
            return true;
        }
    }
})();
