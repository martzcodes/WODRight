(function () {
    'use strict';
    angular
        .module('app.core')
        .factory('$localstorage', localstorage);
    localstorage.$inject = ['$q', '$window'];
    function localstorage($q, $window) {
        var service = {
            set: set,
            get: get,
            getPromise: getPromise,
            setObject: setObject,
            getObject: getObject,
            removeObject: removeObject
        };
        return service;
        function set(key, value) {
            $window.localStorage[key] = value;
        }
        function get(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        }
        function getPromise(key, defaultValue) {
            return $q(function (resolve, reject) {
                if ($window.localStorage[key] !== null) {
                    resolve($window.localStorage[key]);
                }
                else {
                    resolve(defaultValue);
                }
            });
        }
        function setObject(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        }
        function getObject(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
        function removeObject(key) {
            $window.localStorage[key] = JSON.stringify({});
        }
    }
})();
