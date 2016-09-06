/// <reference path="../../typings/tsd.d.ts" />
(function() {
    'use strict';

    angular
        .module('app.widgets')
        .controller('MovementItemCtrl', MovementItemCtrl);

    MovementItemCtrl.$inject = ['$scope', '$state', '$ionicActionSheet', '$ionicPopup', 'dataservice', 'WODconstants'];

    function MovementItemCtrl($scope, $state, $ionicActionSheet, $ionicPopup, dataservice, WODconstants) {
        var vm = this;

        vm.itemClass = '';
        vm.itemDate = '';
        vm.footer = '';

        vm.openModSheet = openModSheet;
        if (vm.mode === 'strength') {
            vm.openOptionSheet = openOptionSheetStrength;
        }
        if (vm.mode === 'conditioning') {
            vm.openOptionSheet = openOptionSheetConditioning;
        }

        vm.updateMovement = updateMovement;

        initializeInfo();

        function initializeInfo() {
            vm.active = {};
            if (vm.item.history.length > 0) {
                if (vm.item.history[vm.item.history.length - 1].direct) {
                    vm.itemClass = 'direct';
                    vm.itemDate = vm.item.history[vm.item.history.length - 1].date;
                    vm.footer = '';
                    vm.active = {
                        use: vm.item.history[vm.item.history.length - 1].value
                    };
                } else {
                    vm.itemClass = 'estimate';
                    vm.itemDate = vm.item.history[vm.item.history.length - 1].date;
                    vm.footer = '(estimate)';
                    vm.active = {
                        use: vm.item.history[vm.item.history.length - 1].value
                    };
                }
            } else {
                if (vm.item.indirect) {
                    vm.itemClass = 'indirect';
                    vm.itemDate = vm.item.indirect.use.date;
                    vm.footer = '(' + vm.item.indirect.name + ')';
                    vm.active = {
                        use: vm.item.indirect.use.value / (vm.item.indirect.multiplier / 100)
                    };
                } else {
                    vm.updateButton = true;
                }
            }
            if (vm.active.use) {
                if (vm.mode === 'strength') {
                    if (vm.item.modType === 'Reps') {
                        vm.active.mod = vm.item.strength.reps;
                    } else {
                        vm.active.mod = vm.item.strength.effort;
                    }
                } else {
                    vm.active.mod = vm.item.conditioning;
                }
                vm.active.low = 0.95 * vm.active.use * vm.active.mod.value;
                vm.active.high = vm.active.use * vm.active.mod.value;
            }
        }

        function refreshMovement() {
            var movement = dataservice.getMovementById(vm.item.id);
            vm.item = movement;
            initializeInfo();
        }

        function openModSheet() {
            if (vm.mode === 'strength') {
                if (vm.item.modType === 'Reps') {
                    openRepSheet();
                } else {
                    openEffortSheet();
                }
            } else {
                openOverallRepSheet();
            }
        }

        function openOverallRepSheet() {
            var buttons = [];
            for (var i = 0; i < WODconstants.overallRepOptions.length; i++) {
                buttons.push({
                    text: WODconstants.overallRepOptions[i].name
                });
            }

            var hideSheet = $ionicActionSheet.show({
                buttons: buttons,
                //destructiveText: 'Delete',
                titleText: 'How Many Overall Reps?',
                cancelText: 'Cancel',
                cancel: function() {
                    // add cancel code..
                    return true;
                },
                buttonClicked: function(index) {
                    dataservice.setOverallReps(vm.item, WODconstants.overallRepOptions[index], vm.saveChanges).then(function(movement) {
                        vm.item = movement;
                        initializeInfo();
                    });
                    return true;
                }
            });
        }

        function openRepSheet() {
            var buttons = [];
            for (var i = 0; i < WODconstants.repOptions.length; i++) {
                buttons.push({
                    text: WODconstants.repOptions[i].name
                });
            }

            var hideSheet = $ionicActionSheet.show({
                buttons: buttons,
                titleText: 'How Many Reps?',
                cancelText: 'Cancel',
                cancel: function() {
                    return true;
                },
                buttonClicked: function(index) {
                    dataservice.setReps(vm.item, WODconstants.repOptions[index], vm.saveChanges).then(function(movement) {
                        vm.item = movement;
                        initializeInfo();
                    });
                    return true;
                }
            });
        }

        function openEffortSheet() {
            var buttons = [];
            for (var i = 0; i < WODconstants.effortOptions.length; i++) {
                buttons.push({
                    text: WODconstants.effortOptions[i].name
                });
            }

            var hideSheet = $ionicActionSheet.show({
                buttons: buttons,
                //destructiveText: 'Delete',
                titleText: 'How Much Effort?',
                cancelText: 'Cancel',
                cancel: function() {
                    return true;
                },
                buttonClicked: function(index) {
                    dataservice.setEffort(vm.item, WODconstants.effortOptions[index], vm.saveChanges).then(function(movement) {
                        vm.item = movement;
                        initializeInfo();
                    });
                    return true;
                }
            });
        }

        function openOptionSheetStrength() {
            var repEffortButton = {
                text: 'Switch to Reps',
                value: 'reps'
            };
            var buttonOptions = [{
                text: 'Update One Rep Max',
                value: 'update'
            }, {
                text: 'Show Details',
                value: 'details'
            }];
            if (vm.item.history.length > 0 || vm.item.indirect) {
                if (vm.item.modType === 'Reps') {
                    repEffortButton = {
                        text: 'Switch to Effort',
                        value: 'effort'
                    };
                } else {
                    repEffortButton = {
                        text: 'Switch to Reps',
                        value: 'reps'
                    };
                }
                buttonOptions.splice(1, 0, repEffortButton); //change to 2 when details enabled
            }

            var hideSheet = $ionicActionSheet.show({
                buttons: buttonOptions,
                destructiveText: 'Delete Info',
                titleText: vm.item.name,
                cancelText: 'Cancel',
                cancel: function() {
                    return true;
                },
                destructiveButtonClicked: function() {
                    $scope.data = {};
                    var deletePopup = $ionicPopup.show({
                        //templateUrl: 'templates/modals/wodname.html',
                        title: 'Deleting will remove all history for this movement, are you sure?',
                        subTitle: '',
                        scope: $scope,
                        buttons: [{
                            text: 'Cancel',
                            type: 'button-light'
                        }, {
                            text: '<b>Delete</b>',
                            type: 'button-assertive',
                            onTap: function(e) {
                                dataservice.resetMovement(vm.item).then(function(movement) {
                                    vm.item = movement;
                                    vm.movementRefresh();
                                    initializeInfo();
                                });
                                return true;
                            }
                        }]
                    });
                },
                buttonClicked: function(index) {
                    switch (buttonOptions[index].value) {
                        case 'reps':
                            dataservice.setModType(vm.item, 'Reps', vm.saveChanges).then(function(movement) {
                                vm.item = movement;
                                initializeInfo();
                            });
                            return true;
                        case 'effort':
                            dataservice.setModType(vm.item, 'Effort', vm.saveChanges).then(function(movement) {
                                vm.item = movement;
                                initializeInfo();
                            });
                            return true;
                        case 'details':
                            movementDetails();
                            return true;
                        case 'update':
                            updateMovement();
                            return true;
                        default:
                            return true;
                    }
                }
            });
        }

        function openOptionSheetConditioning() {
            var repEffortButton = {};
            var buttonOptions = [{
                text: 'Update One Rep Max',
                value: 'update'
            }, {
                text: 'Show Details',
                value: 'details'
            }];

            var hideSheet = $ionicActionSheet.show({
                buttons: buttonOptions,
                destructiveText: 'Delete Info',
                titleText: vm.item.name,
                cancelText: 'Cancel',
                cancel: function() {
                    return true;
                },
                destructiveButtonClicked: function() {
                    dataservice.resetMovement(vm.item).then(function() {
                        var movement = dataservice.getMovementById(vm.item.id);
                        vm.item = movement;
                        vm.movementRefresh();
                        initializeInfo();
                    });
                    return true;
                },
                buttonClicked: function(index) {
                    switch (buttonOptions[index].value) {
                        case 'details':
                            movementDetails();
                            return true;
                        case 'update':
                            updateMovement();
                            return true;
                        default:
                            return true;
                    }
                }
            });
        }

        function updateMovement() {
            $state.go('app.movement', {
                movementId: vm.item.id,
                update: true
            });
        }

        function movementDetails() {
            $state.go('app.movement', {
                movementId: vm.item.id,
                update: false
            });
        }
    }
})();
