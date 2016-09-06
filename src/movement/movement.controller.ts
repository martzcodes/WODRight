/// <reference path="../../typings/tsd.d.ts" />
(function() {
    'use strict';

    angular
        .module('app.movement')
        .controller('MovementCtrl', MovementCtrl);

    MovementCtrl.$inject = ['$stateParams', '$timeout', '$ionicHistory', '$ionicActionSheet', '$ionicTabsDelegate', 'dataservice'];

    function MovementCtrl($stateParams, $timeout, $ionicHistory, $ionicActionSheet, $ionicTabsDelegate, dataservice) {
        var vm = this;
        vm.movement = {};
        vm.update = {
            weight: null,
            reps: 1,
            orm: 0
        };
        vm.history = [];
        
        vm.calculateEstimate = calculateEstimate;
        vm.submitUpdate = submitUpdate;
        vm.cancel = cancel;
        vm.saveDisable = saveDisable;
        vm.calculate = calculate;

        dataservice.getMovementById($stateParams.movementId).then(function(movement) {
            vm.movement = angular.copy(movement);
            if (vm.movement.history.length > 0) {
                vm.update.weight = vm.movement.history[vm.movement.history.length-1].value;
                calculate();
            }
            dataservice.getFamilyHistory(vm.movement.id).then(function(history){
                vm.history = history;
            });
        });

        if ($stateParams.update === true) {
            $timeout(function() {
                $ionicTabsDelegate.select(3);
            },10);
        }

        function calculateEstimate() {
            dataservice.calculateEstimate(vm.update.weight, dataservice.getRepMod(vm.update.reps), function(newWeight) {
                vm.update.orm = newWeight;
            });
        }
        
        function submitUpdate() {
            if (Number(vm.update.reps) === 1) {
                useKnown();
            }
            if (Number(vm.update.reps) > 1) {
                useEstimate();
            }
        }

        function useKnown() {
            dataservice.newOneRepMax(vm.movement, vm.update.orm, true).then(function() {
                cancel();
            });
        }

        function useEstimate() {
            dataservice.newOneRepMax(vm.movement, {
                weight: vm.update.weight,
                reps: dataservice.getRepMod(vm.update.reps)
            }, false).then(function() {
                cancel();
            });
        }
        
        function calculate() {
            if (vm.update.reps > 1) {
                calculateEstimate();
            } else {
                vm.update.orm = vm.update.weight * dataservice.getRepMod(1).value;
            }
        }

        function cancel() {
            $ionicHistory.goBack();
        }
        
        function saveDisable() {
            return Number(vm.update.orm) <= 0;
        }
    }
})();
