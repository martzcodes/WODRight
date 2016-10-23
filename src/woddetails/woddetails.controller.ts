/// <reference path="../../typings/tsd.d.ts" />
(function() {
    'use strict';

    angular
        .module('app.woddetails')
        .controller('WodDetailsCtrl', WodDetailsController);

    WodDetailsController.$inject = ['$stateParams', '$state', '$timeout', '$q', 'dataservice', 'wodservice', '$ionicTabsDelegate', '$ionicPopup'];
    function WodDetailsController($stateParams, $state, $timeout, $q, dataservice, wodservice, $ionicTabsDelegate, $ionicPopup) {
        var vm = this;

        var isIPad = ionic.Platform.isIPad();
        var isIOS = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();
        vm.iOS = false;
        if (isIPad || isIOS) {
            vm.iOS = true;
        }

        var tempD = new Date;
        var d = new Date(tempD.getFullYear(), tempD.getMonth(), tempD.getDate(),
            tempD.getHours(), tempD.getMinutes(), 0);

        vm.deleteWOD = deleteWOD;
        vm.newLog = {
            date: angular.copy(d),
            timed: {
                enabled: false,
                minutes: null,
                seconds: null
            },
            finish: angular.copy(d),
            notes: '',
            movements: []
        };

        vm.addLogged = addLogged;

        initWODs();

        function resetNewLog() {
            return $q(function(resolve, reject) {
                tempD = new Date;
                d = new Date(tempD.getFullYear(), tempD.getMonth(), tempD.getDate(), tempD.getHours(), tempD.getMinutes(), 0);
    
                vm.deleteWOD = deleteWOD;
                vm.newLog = {
                    date: angular.copy(d),
                    timed: {
                        enabled: false,
                        minutes: null,
                        seconds: null
                    },
                    finish: angular.copy(d),
                    notes: '',
                    movements: []
                };
                resolve();
            });
        }

        function initWODs() {
            if ($stateParams.log === true) {
                $timeout(function() {
                    $ionicTabsDelegate.select(1);
                }, 10);
            }
            wodservice.getWODbyId($stateParams.wodId).then(function(wod) {
                vm.wod = angular.copy(wod);
                processWOD();
            });
        }

        function processWOD() {
            var movementPromises = [];
            function processMovement(mId) {
                return $q(function(resolve, reject) {
                    dataservice.getMovementById(vm.wod.movements[mId].id).then(function(tempMovement) {
                        var wodMovement = angular.copy(tempMovement);
                        var logMovement = {
                            id: wodMovement.id,
                            name: wodMovement.name,
                            rx: -1,
                            target: '',
                            reps: null,
                            rec: {
                                low: -1,
                                high: -1,
                                source: 'none'
                            },
                            weight: null
                        };
                        wodMovement.rx = vm.wod.movements[mId].rx;
                        logMovement.rx = wodMovement.rx;
                        wodMovement.conditioning = vm.wod.movements[mId].conditioning;
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
                                logMovement.rec.source = 'direct';
                            } else {
                                wodMovement.active = {
                                    use: wodMovement.history[wodMovement.history.length - 1].value,
                                    source: 'estimate'
                                };
                                logMovement.rec.source = 'estimate';
                            }
                        } else {
                            if (wodMovement.indirect) {
                                wodMovement.active = {
                                    use: wodMovement.indirect.use.value * wodMovement.indirect.multiplier / 100,
                                    source: 'indirect'
                                };
                                logMovement.rec.source = 'indirect';
                            } else {
                                wodMovement.active = {
                                    source: 'none'
                                };
                            }
                        }
                        wodMovement.active.mod = wodMovement.conditioning;
                        logMovement.target = wodMovement.active.mod.name;
                        delete wodMovement.conditioning;
                        delete wodMovement.history;
                        delete wodMovement.indirect;
                        if (wodMovement.active.use) {
                            wodMovement.active.low = 0.95 * wodMovement.active.use * wodMovement.active.mod.value;
                            wodMovement.active.high = wodMovement.active.use * wodMovement.active.mod.value;
                            vm.wod.movements[mId] = angular.copy(wodMovement);
                            logMovement.rec.low = wodMovement.active.low;
                            logMovement.rec.high = wodMovement.active.high;
                            vm.newLog.movements.push(logMovement);
                            resolve();
                        } else {
                            vm.wod.movements[mId] = angular.copy(wodMovement);
                            vm.newLog.movements.push(logMovement);
                            resolve();
                        }
                    });
                });
            }
            for (var j = 0; j < vm.wod.movements.length; j++) {
                movementPromises.push(processMovement(j));
            }
            return $q.all(movementPromises);
        }

        function deleteWOD() {
            var deletePopup = $ionicPopup.show({
                //templateUrl: 'templates/modals/wodname.html',
                title: 'Deleting will remove this WOD and all of it\'s data.  You CANNOT undo this.',
                subTitle: '',
                buttons: [{
                    text: 'Cancel',
                    type: 'button-light'
                }, {
                        text: '<b>Delete</b>',
                        type: 'button-assertive',
                        onTap: function(e) {
                            wodservice.removeWOD(vm.wod).then(function() {
                                $state.go('app.wods');
                            });
                            return true;
                        }
                    }]
            });
        }

        function addLogged() {
            var logDate = new Date(vm.newLog.date.getFullYear(), vm.newLog.date.getMonth(), vm.newLog.date.getDate(), vm.newLog.finish.getHours(), vm.newLog.finish.getMinutes(), vm.newLog.finish.getSeconds());
            vm.newLog.date = logDate.getTime();
            delete vm.newLog.finish;
            delete vm.newLog.timed.enabled;
            var submitLog = angular.copy(vm.newLog);
            wodservice.addLog(vm.wod,submitLog).then(function(newWOD) {
                vm.wod = angular.copy(newWOD);
                resetNewLog().then(function() {
                    processWOD(); 
                });
            });
        }
    }
})();