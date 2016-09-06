/// <reference path="../../typings/tsd.d.ts" />
(function() {
    'use strict';

    angular
        .module('app.widgets')
        .controller('WodItemCtrl', WodItemCtrl);

    WodItemCtrl.$inject = ['$scope', '$state', '$q', '$ionicActionSheet', '$ionicPopup', 'dataservice', 'wodservice', 'WODconstants'];

    function WodItemCtrl($scope, $state, $q, $ionicActionSheet, $ionicPopup, dataservice, wodservice, WODconstants) {
        var vm = this;

        vm.openOptions = openOptions;

        initWOD();

        function initWOD() {
            var movementPromises = [];
            function processMovement(mId) {
                return $q(function(resolve, reject) {
                    dataservice.getMovementById(vm.item.movements[mId].id).then(function(tempMovement) {
                        var wodMovement = angular.copy(tempMovement);
                        wodMovement.rx = vm.item.movements[mId].rx;
                        wodMovement.conditioning = vm.item.movements[mId].conditioning;
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
                            } else {
                                wodMovement.active = {
                                    use: wodMovement.history[wodMovement.history.length - 1].value,
                                    source: 'estimate'
                                };
                            }
                        } else {
                            if (wodMovement.indirect) {
                                wodMovement.active = {
                                    use: wodMovement.indirect.use.value / (wodMovement.indirect.multiplier / 100),
                                    source: 'indirect'
                                };
                            } else {
                                wodMovement.active = {
                                    source: 'none'
                                };
                            }
                        }
                        wodMovement.active.mod = wodMovement.conditioning;
                        delete wodMovement.conditioning;
                        delete wodMovement.history;
                        delete wodMovement.indirect;
                        if (wodMovement.active.use) {
                            wodMovement.active.low = 0.95 * wodMovement.active.use * wodMovement.active.mod.value;
                            wodMovement.active.high = wodMovement.active.use * wodMovement.active.mod.value;
                            vm.item.movements[mId] = angular.copy(wodMovement);
                            resolve();
                        } else {
                            vm.item.movements[mId] = angular.copy(wodMovement);
                            resolve();
                        }
                    });
                });
            }
            for (var j = 0; j < vm.item.movements.length; j++) {
                movementPromises.push(processMovement(j));
            }
            return $q.all(movementPromises);
        }

        function openOptions() {
            var buttonOptions = [{
                text: 'Log WOD',
                value: 'log'
            }, {
                text: 'Show Details',
                value: 'details'
            }];

            var hideSheet = $ionicActionSheet.show({
                buttons: buttonOptions,
                destructiveText: 'Delete WOD',
                titleText: vm.item.name,
                cancelText: 'Cancel',
                cancel: function() {
                    return true;
                },
                buttonClicked: function(index) {
                    switch (buttonOptions[index].value) {
                        case 'details':
                            wodDetails();
                            return true;
                        case 'log':
                            logWOD();
                            return true;
                        default:
                            return true;
                    }
                },
                destructiveButtonClicked: function() {
                    $scope.data = {};
                    var deletePopup = $ionicPopup.show({
                        //templateUrl: 'templates/modals/wodname.html',
                        title: 'Deleting will remove this WOD and all of it\'s data.  You CANNOT undo this.',
                        subTitle: '',
                        scope: $scope,
                        buttons: [{
                            text: 'Cancel',
                            type: 'button-light'
                        }, {
                            text: '<b>Delete</b>',
                            type: 'button-assertive',
                            onTap: function(e) {
                                wodservice.removeWOD(vm.item).then(function(){
                                    vm.initWods();
                                });
                                return true;
                            }
                        }]
                    });
                    return true;
                },
            });
        }
        function logWOD() {
            $state.go('app.woddetails', {
                wodId: vm.item.id,
                log: true
            });
        }

        function wodDetails() {
            $state.go('app.woddetails', {
                wodId: vm.item.id,
                log: false
            });
        }
    }
})();
