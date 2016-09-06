(function () {
    'use strict';
    angular
        .module('app.widgets')
        .directive('wrNumbers', wrNumbers);
    function wrNumbers() {
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;
        function link(scope, elm, attrs) {
            elm.on('keydown', function (event) {
                if ([8, 13, 27, 37, 38, 39, 40].indexOf(event.which) > -1) {
                    return true;
                }
                else if (event.which >= 48 && event.which <= 57) {
                    return true;
                }
                else if (event.which >= 96 && event.which <= 105) {
                    return true;
                }
                else if ([110, 190].indexOf(event.which) > -1) {
                    return true;
                }
                else {
                    event.preventDefault();
                    return false;
                }
            });
        }
    }
})();
