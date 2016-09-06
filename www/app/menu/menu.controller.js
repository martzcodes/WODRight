(function () {
    'use strict';
    angular
        .module('app.menu')
        .controller('MenuCtrl', MenuCtrl);
    MenuCtrl.$inject = ['dataservice'];
    function MenuCtrl(dataservice) {
        var vm = this;
        dataservice.checkDisclaimer().then(function (disclaimer) {
            vm.disclaimerAgreed = disclaimer;
        });
    }
})();
