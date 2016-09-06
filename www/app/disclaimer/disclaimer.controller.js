(function () {
    'use strict';
    angular
        .module('app.disclaimer')
        .controller('DisclaimerCtrl', DisclaimerCtrl);
    DisclaimerCtrl.$inject = ['$state', '$stateParams', '$ionicHistory', '$localstorage'];
    function DisclaimerCtrl($state, $stateParams, $ionicHistory, $localstorage) {
        var vm = this;
        $localstorage.getPromise('disclaimerAgreed', false).then(function (status) {
            vm.disclaimerAgreed = status;
        });
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        vm.agreed = function () {
            $localstorage.set('disclaimerAgreed', true);
            $state.go('app.strength');
        };
    }
})();
