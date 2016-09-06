/// <reference path="../../typings/tsd.d.ts" />
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
        vm.inCurrent = inCurrent;
        vm.newWOD = newWOD;
        initWODs();
        function initWODs() {
            $timeout(function () {
                $ionicTabsDelegate.select(1);
            }, 10);
            wodservice.getSavedWODs().then(processWODs);
        }
        function processWODs(wods) {
            vm.wods = wods;
            var wodPromises = [];
            function processWOD(wId) {
                var movementPromises = [];
                function processMovement(wId, mId) {
                    return $q(function (resolve, reject) {
                        dataservice.getMovementById(wods[wId].movements[mId].id).then(function (tempMovement) {
                            var wodMovement = angular.copy(tempMovement);
                            wodMovement.rx = wods[wId].movements[mId].rx;
                            wodMovement.conditioning = wods[wId].movements[mId].conditioning;
                            wodMovement.active = {};
                            delete wodMovement.strength;
                            delete wodMovement.convert;
                            delete wodMovement.family;
                            delete wodMovement.modType;
                            if (wodMovement.history.length > 0) {
                                if (wodMovement.history[wodMovement.history.length - 1].direct) {
                                    wodMovement.active = {
                                        use: wodMovement.history[wodMovement.history.length - 1].value,
                                        source: 'direct'
                                    };
                                }
                                else {
                                    wodMovement.active = {
                                        use: wodMovement.history[wodMovement.history.length - 1].value,
                                        source: 'estimate'
                                    };
                                }
                            }
                            else {
                                if (wodMovement.indirect) {
                                    wodMovement.active = {
                                        use: wodMovement.indirect.use.value * wodMovement.indirect.multiplier / 100,
                                        source: 'indirect'
                                    };
                                }
                                else {
                                    wodMovement.active = {
                                        source: 'none'
                                    };
                                }
                            }
                            wodMovement.active.mod = wodMovement.conditioning;
                            console.log(wodMovement);
                            delete wodMovement.conditioning;
                            delete wodMovement.history;
                            delete wodMovement.indirect;
                            if (wodMovement.active.use) {
                                wodMovement.active.low = 0.95 * wodMovement.active.use * wodMovement.active.mod.value;
                                wodMovement.active.high = wodMovement.active.use * wodMovement.active.mod.value;
                                wods[wId].movements[mId] = angular.copy(wodMovement);
                                resolve();
                            }
                            else {
                                wods[wId].movements[mId] = angular.copy(wodMovement);
                                resolve();
                            }
                        });
                    });
                }
                for (var j = 0; j < wods[wId].movements.length; j++) {
                    movementPromises.push(processMovement(wId, j));
                }
                return $q.all(movementPromises);
            }
            for (var i = 0; i < vm.wods.length; i++) {
                wodPromises.push(processWOD(i));
            }
            return $q.all(wodPromises);
        }
        function newWOD() {
            $state.go('app.newwod');
        }
        function inCurrent() {
            return true;
        }
    }
})();
