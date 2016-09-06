(function () {
    'use strict';
    angular
        .module('app.launcher')
        .controller('LauncherCtrl', LauncherCtrl);
    LauncherCtrl.$inject = ['$state', '$ionicHistory', 'dataservice'];
    function LauncherCtrl($state, $ionicHistory, dataservice) {
        var vm = this;
        var isIPad = ionic.Platform.isIPad();
        var isIOS = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();
        vm.iOS = false;
        if (isIPad || isIOS) {
            vm.iOS = true;
        }
        vm.mL = dataservice.getMovementList();
        vm.navGo = navGo;
        dataservice.checkDisclaimer().then(function (disclaimer) {
            if (disclaimer) {
                init();
            }
            else {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('app.disclaimer');
            }
        });
        function init() {
            dataservice.getNoHistoryCount().then(function (noHistoryCount) {
                vm.noHistoryCount = noHistoryCount;
            });
            dataservice.getAllHistory().then(function (histories) {
                vm.histories = histories;
            });
        }
        function navGo(target) {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            var goWhere = 'app.' + target;
            $state.go(goWhere);
        }
    }
})();
