(function () {
    'use strict';
    angular
        .module('app.newwod')
        .controller('NewWodCtrl', NewWodController);
    NewWodController.$inject = ['$state', '$q', 'dataservice', 'wodservice', 'WODconstants', '$ionicTabsDelegate', '$ionicHistory'];
    function NewWodController($state, $q, dataservice, wodservice, WODconstants, $ionicTabsDelegate, $ionicHistory) {
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
        vm.repOptions = WODconstants.overallRepOptions;
        vm.formSubmitAttempt = false;
        vm.saveSuccess = false;
        vm.addToWOD = addToWOD;
        vm.removeFromWOD = removeFromWOD;
        vm.clearWOD = clearWOD;
        vm.movementRefresh = movementRefresh;
        vm.saveWOD = saveWOD;
        vm.updateWodItem = updateWodItem;
        vm.toggleWOD = toggleWOD;
        vm.checkName = checkName;
        vm.goToWOD = goToWOD;
        resetWOD();
        movementRefresh();
        function movementRefresh() {
            vm.mL = [];
            vm.m = {};
            vm.wod.movements = [];
            function initWOD(currentMovement) {
                return $q(function (resolve, reject) {
                    dataservice.getMovementById(currentMovement.id).then(function (newMovement) {
                        var wodMovement = angular.copy(newMovement);
                        wodMovement.conditioning = currentMovement.conditioning;
                        vm.wod.movements.push(wodMovement);
                        resolve();
                    });
                });
            }
            dataservice.getMovements().then(function (movements) {
                angular.copy(movements, vm.m);
                angular.copy(dataservice.getMovementList(), vm.mL);
                wodservice.getCurrentWOD(function (currentWOD) {
                    if (currentWOD.movements) {
                        var createPromises = [];
                        for (var i = 0; i < currentWOD.movements.length; i++) {
                            vm.m[currentWOD.movements[i].id].wod = true;
                            createPromises.push(initWOD(currentWOD.movements[i]));
                        }
                        $q.all(createPromises).then(function () {
                            wodservice.checkUnique(vm.wod).then(function () {
                                vm.wod.unique = true;
                                vm.wod.name = '';
                            }, function (wod) {
                                vm.wod.id = wod.id;
                                vm.wod.name = wod.name;
                                vm.wod.unique = false;
                            });
                        });
                    }
                });
            });
        }
        function updateWodItem(id, reps) {
            var updatePromises = [];
            function updateMovement(i) {
                return $q(function (resolve, reject) {
                    if (vm.wod.movements[i].id === id) {
                        vm.wod.movements[i].conditioning = reps;
                        resolve();
                    }
                    else {
                        resolve();
                    }
                });
            }
            for (var i = 0; i < vm.wod.movements.length; i++) {
                updatePromises.push(updateMovement(i));
            }
            $q.all(updatePromises).then(function () {
                wodservice.checkUnique(vm.wod).then(function () {
                    vm.wod.unique = true;
                    wodservice.saveCurrentWOD(vm.wod);
                }, function (wod) {
                    vm.wod.name = wod.name;
                    vm.wod.unique = false;
                    wodservice.saveCurrentWOD(vm.wod);
                });
            });
        }
        function addToWOD(mvmt) {
            vm.wod.movements.push(mvmt);
            wodservice.checkUnique(vm.wod).then(function () {
                vm.wod.unique = true;
                vm.wod.name = '';
                wodservice.saveCurrentWOD(vm.wod);
            }, function (wod) {
                vm.wod.unique = false;
                vm.wod.name = wod.name;
                wodservice.saveCurrentWOD(vm.wod);
            });
        }
        function removeFromWOD(mvmt) {
            var wodPromises = [];
            vm.m[mvmt.id].wod = false;
            function removeWOD(j) {
                return $q(function (resolve, reject) {
                    if (vm.wod.movements[j].id === mvmt.id) {
                        vm.wod.movements.splice(j, 1);
                        resolve();
                    }
                    else {
                        resolve();
                    }
                });
            }
            for (var j = vm.wod.movements.length - 1; j >= 0; j--) {
                wodPromises.push(removeWOD(j));
            }
            $q.all(wodPromises).then(function () {
                wodservice.checkUnique(vm.wod).then(function () {
                    vm.wod.unique = true;
                    vm.wod.name = '';
                    wodservice.saveCurrentWOD(vm.wod);
                }, function (wod) {
                    vm.wod.unique = false;
                    vm.wod.name = wod.name;
                    wodservice.saveCurrentWOD(vm.wod);
                });
            });
        }
        function resetWOD() {
            vm.wod = {
                movements: [],
                unique: true,
                name: '',
                history: []
            };
        }
        function clearWOD() {
            for (var i = vm.mL.length - 1; i >= 0; i--) {
                vm.m[vm.mL[i].id].wod = false;
            }
            resetWOD();
            wodservice.saveCurrentWOD(vm.wod);
        }
        function saveWOD() {
            vm.formSubmitAttempt = true;
            if (vm.wod.unique && vm.nameUnique) {
                wodservice.saveWOD(vm.wod).then(function (wod) {
                    vm.wod.id = wod.id;
                    vm.wod.unique = false;
                    vm.saveSuccess = true;
                    $ionicTabsDelegate.select(1);
                });
            }
            else {
                $ionicTabsDelegate.select(1);
            }
        }
        function goToWOD() {
            if (vm.wod.id) {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('app.woddetails', {
                    wodId: vm.wod.id,
                    log: false
                });
            }
        }
        function checkName() {
            wodservice.checkName(vm.wod.name).then(function () {
                vm.nameUnique = true;
            }, function () {
                vm.nameUnique = false;
            });
        }
        function toggleWOD(mId) {
            var mvmt = vm.m[mId.id];
            if (mvmt.wod) {
                addToWOD(mvmt);
            }
            else {
                removeFromWOD(mvmt);
            }
        }
    }
})();
