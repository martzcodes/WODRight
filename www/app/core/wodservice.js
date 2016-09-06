(function () {
    'use strict';
    angular
        .module('app.core')
        .factory('wodservice', wodservice);
    wodservice.$inject = ['$q', '$localstorage', 'WODconstants'];
    function wodservice($q, $localstorage, WODconstants) {
        var service = {
            checkName: checkName,
            checkUnique: checkUnique,
            saveWOD: saveWOD,
            removeWOD: removeWOD,
            getWODbyName: getWODbyName,
            getWODbyId: getWODbyId,
            getCurrentWOD: getCurrentWOD,
            saveCurrentWOD: saveCurrentWOD,
            getSavedWODs: getSavedWODs,
            addLog: addLog,
            clearWODs: function () {
                var userObject = getUserObject();
                userObject.wods = {
                    current: {},
                    saved: []
                };
                $localstorage.setObject('user-object', userObject);
            }
        };
        return service;
        function getUserObject() {
            return $localstorage.getObject('user-object', {
                movements: {},
                wods: {
                    current: {},
                    saved: []
                }
            });
        }
        function getSavedWODs() {
            return $q(function (resolve, reject) {
                resolve(getUserObject().wods.saved);
            });
        }
        function checkName(nameToCheck) {
            var namePromises = [];
            var userObject = getUserObject();
            function checkWodName(wod) {
                return $q(function (resolve, reject) {
                    if (wod.name === nameToCheck) {
                        reject();
                    }
                    else {
                        resolve();
                    }
                });
            }
            for (var i = 0; i < userObject.wods.saved.length; i++) {
                namePromises.push(checkWodName(userObject.wods.saved[i]));
            }
            return $q.all(namePromises);
        }
        function checkUnique(wodToCheck) {
            var configPromises = [];
            var userObject = getUserObject();
            function checkWodConfig(wod) {
                return $q(function (resolve, reject) {
                    var wodObj = wod.movements.map(function (obj) {
                        var rObj = {};
                        rObj[obj.id] = obj.conditioning.value;
                        return rObj;
                    });
                    var checkObj = wodToCheck.movements.map(function (obj) {
                        var rObj = {};
                        rObj[obj.id] = obj.conditioning.value;
                        return rObj;
                    });
                    if (JSON.stringify(wodObj) == JSON.stringify(checkObj)) {
                        reject(wod);
                    }
                    else {
                        resolve();
                    }
                });
            }
            for (var i = 0; i < userObject.wods.saved.length; i++) {
                configPromises.push(checkWodConfig(userObject.wods.saved[i]));
            }
            return $q.all(configPromises);
        }
        function saveWOD(rawWOD) {
            return $q(function (resolve, reject) {
                var newWOD = {
                    id: generateId(),
                    name: rawWOD.name,
                    movements: rawWOD.movements.map(function (obj) {
                        return {
                            id: obj.id,
                            conditioning: obj.conditioning,
                            rx: obj.rx
                        };
                    }),
                    history: []
                };
                var userObject = getUserObject();
                userObject.wods.saved.push(newWOD);
                $localstorage.setObject('user-object', userObject);
                resolve(newWOD);
            });
        }
        function removeWOD(wodToRemove) {
            return $q(function (resolve, reject) {
                var userObject = getUserObject();
                if (userObject.wods.saved.length === 0) {
                    resolve();
                }
                else {
                    for (var i = userObject.wods.saved.length - 1; i >= 0; i--) {
                        if (userObject.wods.saved[i].id === wodToRemove.id) {
                            userObject.wods.saved.splice(i, 1);
                            $localstorage.setObject('user-object', userObject);
                            resolve(userObject);
                        }
                    }
                }
            });
        }
        function getWODbyName(wodName) {
            return $q(function (resolve, reject) {
                var userObject = getUserObject();
                if (userObject.wods.saved.length === 0) {
                    resolve();
                }
                else {
                    for (var i = 0; i < userObject.wods.saved.length; i++) {
                        if (userObject.wods.saved[i].name === wodName) {
                            resolve(userObject.wods.saved[i]);
                        }
                    }
                }
            });
        }
        function getWODbyId(wodId) {
            return $q(function (resolve, reject) {
                var userObject = getUserObject();
                if (userObject.wods.saved.length === 0) {
                    resolve();
                }
                else {
                    for (var i = 0; i < userObject.wods.saved.length; i++) {
                        if (userObject.wods.saved[i].id === wodId) {
                            resolve(userObject.wods.saved[i]);
                        }
                    }
                }
            });
        }
        function getCurrentWOD(callback) {
            var userObject = getUserObject();
            callback(userObject.wods.current);
        }
        function saveCurrentWOD(wods) {
            var wodPromises = [];
            var userObject = getUserObject();
            var currentWOD = {
                name: wods.name,
                movements: []
            };
            function addWOD(wod) {
                return $q(function (resolve, reject) {
                    currentWOD.movements.push({
                        id: wod.id,
                        conditioning: wod.conditioning,
                        rx: -1
                    });
                    resolve();
                });
            }
            for (var i = 0; i < wods.movements.length; i++) {
                wodPromises.push(addWOD(wods.movements[i]));
            }
            $q.all(wodPromises).then(function () {
                userObject.wods.current = currentWOD;
                $localstorage.setObject('user-object', userObject);
            });
        }
        function generateId() {
            var ts = new Date;
            return ts.toString();
        }
        function getIds() {
            return $q(function (resolve, reject) {
                var userObject = getUserObject();
                if (userObject.wods.saved.length === 0) {
                    resolve([]);
                }
                else {
                    resolve(userObject.wods.saved.map(function (obj) {
                        return obj.id;
                    }));
                }
            });
        }
        function addLog(wodToUpdate, logToAdd) {
            return $q(function (resolve, reject) {
                var userObject = getUserObject();
                if (userObject.wods.saved.length === 0) {
                    reject();
                }
                else {
                    for (var i = userObject.wods.saved.length - 1; i >= 0; i--) {
                        if (userObject.wods.saved[i].id === wodToUpdate.id) {
                            userObject.wods.saved[i].history.push(logToAdd);
                            $localstorage.setObject('user-object', userObject);
                            resolve(userObject.wods.saved[i]);
                        }
                    }
                }
            });
        }
    }
})();
