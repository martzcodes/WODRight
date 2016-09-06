/// <reference path="../../typings/tsd.d.ts" />
(function() {
    'use strict';

    angular
        .module('app.named')
        .controller('NamedCtrl', NamedCtrl);

    NamedCtrl.$inject = ['dataservice'];

    function NamedCtrl(dataservice) {
        var vm = this;
        var mL = dataservice.getMovementList();
        var m = {};

        vm.girls = dataservice.getGirls();

        dataservice.getMovements().then(function(movements) {
            angular.copy(movements, m);
            calculateMovements();
        });


        function calculateMovements() {
            var girlPromises = [];

            function processGirl(girl) {
                function sumReps(pv, cv) {
                    return pv + cv;
                }

                function calculateRange(movement) {
                    if (movement.orm.direct.use || movement.orm.estimate.use || movement.orm.indirect.use) {
                        movement = dataservice.calculateNamedHighLow(movement);
                    }
                }
                girl.movements = {};
                for (var i = 0; i < girl.round.length; i++) {
                    var reps = girl.round[i].reps.reduce(sumReps, 0);
                    if (girl.movements[girl.round[i].id]) {
                        girl.movements[girl.round[i].id].total_reps += reps;
                        if (mL.indexOf(girl.round[i].id) > -1) {
                            girl.movements[girl.round[i].id].named = angular.copy(dataservice.findRepMod(girl.movements[girl.round[i].id].total_reps));
                            calculateRange(girl.movements[girl.round[i].id]);
                        }
                    } else {
                        if (mL.indexOf(girl.round[i].id) > -1) {
                            girl.movements[girl.round[i].id] = angular.copy(m[girl.round[i].id]);
                            girl.movements[girl.round[i].id].total_reps = reps;
                            girl.movements[girl.round[i].id].rx = girl.round[i].rx;
                            girl.movements[girl.round[i].id].rx_units = girl.round[i].rx_units;
                            girl.movements[girl.round[i].id].named = angular.copy(dataservice.findRepMod(reps));
                            calculateRange(girl.movements[girl.round[i].id]);
                        } else {
                            girl.movements[girl.round[i].id] = {
                                total_reps: girl.round[i].reps.reduce(sumReps, 0),
                                rx: girl.round[i].rx,
                                rx_units: girl.round[i].rx_units
                            };
                        }
                    }
                }
            }

            for (var i = 0; i < vm.girls.length; i++) {
                girlPromises.push(processGirl(vm.girls[i]));
            }
        }
    }
})();
