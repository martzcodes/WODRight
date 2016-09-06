(function () {
    'use strict';
    angular
        .module('app.core')
        .factory('dataservice', dataservice);
    dataservice.$inject = ['$q', '$localstorage', 'WODconstants'];
    function dataservice($q, $localstorage, WODconstants) {
        var userObject = {
            movements: {},
            wods: {
                current: {},
                saved: []
            }
        };
        var mL = [];
        var currentDbVersion = '1';
        var service = {
            getMovements: getMovements,
            getMovementList: getMovementList,
            getMovementById: getMovementById,
            resetMovements: resetMovements,
            newOneRepMax: newOneRepMax,
            checkDisclaimer: checkDisclaimer,
            setReps: setReps,
            setEffort: setEffort,
            setOverallReps: setOverallReps,
            setModType: setModType,
            resetMovement: resetMovement,
            calculateEstimate: calculateEstimate,
            getFamilyHistory: getFamilyHistory,
            getAllHistory: getAllHistory,
            getWODHistories: getWODHistories,
            getNoHistoryCount: getNoHistoryCount,
            getRepMod: getRepMod
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
        function getMovements() {
            return $q(function (resolve, reject) {
                if (Object.keys(userObject.movements).length !== 0) {
                    resolve(userObject.movements);
                }
                else {
                    checkDatabase().then(function () {
                        resolve(userObject.movements);
                    });
                }
            });
        }
        function getMovementList() {
            angular.copy(WODconstants.movementList, mL);
            return mL;
        }
        function resetMovements() {
            return $q(function (resolve, reject) {
                userObject.movements = {};
                resolve();
            });
        }
        function resetMovement(movement) {
            return $q(function (resolve, reject) {
                initializeMovement(movement.id).then(function (newMovement) {
                    userObject.movements[movement.id] = newMovement;
                }).then(updateFamily).then(storeUserObject).then(function () {
                    resolve(userObject.movements[movement.id]);
                });
            });
        }
        function getMovementById(movementId) {
            return $q(function (resolve, reject) {
                if (Object.keys(userObject.movements).length !== 0) {
                    resolve(userObject.movements[movementId]);
                }
                else {
                    getMovements().then(function (newUserObject) {
                        resolve(newUserObject.movements[movementId]);
                    });
                }
            });
        }
        function getFamilyHistory(movementId) {
            return getMovementById(movementId).then(function (movement) {
                var familyPromises = [];
                var histories = [];
                function familyName(famName, fam) {
                    return $q(function (resolve, reject) {
                        fam.name = famName;
                        resolve();
                    });
                }
                function familyHistory(familyId) {
                    return $q(function (resolve, reject) {
                        getMovementById(familyId).then(function (familyMovement) {
                            var familyNamePromises = [];
                            for (var j = 0; j < familyMovement.history.length; j++) {
                                familyNamePromises.push(familyName(familyMovement.name, familyMovement.history[j]));
                            }
                            $q.all(familyNamePromises).then(function () {
                                histories.push(familyMovement.history);
                                resolve();
                            });
                        }, reject);
                    });
                }
                for (var i = 0; i < movement.convert.length; i++) {
                    familyPromises.push(familyHistory(movement.convert[i].id));
                }
                return $q.all(familyPromises).then(function () {
                    return $q(function (resolve, reject) {
                        var flattenedFamily = histories.reduce(function (a, b) {
                            return a.concat(b);
                        });
                        flattenedFamily.sort(function (a, b) {
                            return a.date < b.date;
                        });
                        resolve(flattenedFamily);
                    });
                });
            });
        }
        function getMovementHistories(limit) {
            return getMovements().then(function (mvmts) {
                return $q(function (resolve, reject) {
                    var unprocessedHistories = Object.keys(mvmts).map(function (val, ind) {
                        return mvmts[val].history.map(function (obj) {
                            obj.name = mvmts[val].name;
                            obj.id = mvmts[val].id;
                            obj.type = 'strength';
                            return obj;
                        });
                    });
                    var flattenedHistories = unprocessedHistories.reduce(function (a, b) {
                        return a.concat(b);
                    });
                    flattenedHistories.sort(function (a, b) {
                        return a.date < b.date;
                    });
                    resolve(flattenedHistories);
                });
            }).then(function (historyOutput) {
                return $q(function (resolve, reject) {
                    historyOutput.sort(function (a, b) {
                        return a.date < b.date;
                    });
                    if (limit) {
                        resolve(historyOutput.slice(0, limit));
                    }
                    else {
                        resolve(historyOutput);
                    }
                });
            });
        }
        function getWODHistories(limit) {
            return $q(function (resolve, reject) {
                var wods = getUserObject().wods;
                if (wods.saved.length > 0) {
                    var unWodHistory = wods.saved.map(function (obj) {
                        return obj.history.map(function (historyObj) {
                            historyObj.name = obj.name;
                            historyObj.type = 'wod';
                            return historyObj;
                        });
                    });
                    var flattenedHistories = unWodHistory.reduce(function (a, b) {
                        return a.concat(b);
                    });
                    flattenedHistories.sort(function (a, b) {
                        return a.date < b.date;
                    });
                    resolve(flattenedHistories);
                }
                else {
                    resolve([]);
                }
            }).then(function (historyOutput) {
                return $q(function (resolve, reject) {
                    historyOutput.sort(function (a, b) {
                        return a.date < b.date;
                    });
                    if (limit) {
                        resolve(historyOutput.slice(0, limit));
                    }
                    else {
                        resolve(historyOutput);
                    }
                });
            });
        }
        function getAllHistory(limit) {
            var movementHistory = getMovementHistories(null);
            var wodHistory = getWODHistories(null);
            return $q.all([movementHistory, wodHistory]).then(function (historyOutput) {
                return $q(function (resolve, reject) {
                    var flatHistory = historyOutput.reduce(function (a, b) {
                        return a.concat(b);
                    });
                    flatHistory.sort(function (a, b) {
                        var aDate = new Date(a.date).getTime();
                        var bDate = new Date(b.date).getTime();
                        return bDate - aDate;
                    });
                    if (limit) {
                        resolve(flatHistory.slice(0, limit));
                    }
                    else {
                        resolve(flatHistory);
                    }
                });
            });
        }
        function getNoHistoryCount() {
            return getMovements().then(function (mvmts) {
                return $q(function (resolve, reject) {
                    var historyLengths = Object.keys(mvmts).map(function (val) {
                        return mvmts[val].history.length;
                    });
                    resolve(historyLengths.filter(function (value) {
                        return value === 0;
                    }).length);
                });
            });
        }
        function checkDatabase() {
            return $q(function (resolve, reject) {
                var dbVersion = $localstorage.get('database-version', '0');
                if (dbVersion === currentDbVersion) {
                    userObject = $localstorage.getObject('user-object', {});
                    resolve();
                }
                else {
                    if (dbVersion === '0') {
                        updateDBtoOne().then(updateFamily).then(storeUserObject).then(function () {
                            $localstorage.set('database-version', '1');
                            resolve();
                        });
                    }
                }
            });
        }
        function updateDBtoOne() {
            userObject = {
                movements: {},
                wods: {
                    current: {},
                    saved: []
                }
            };
            var movementPromises = [];
            function checkMovement(movementId) {
                var storedMovement = $localstorage.getObject(movementId, {});
                return $q(function (resolve, reject) {
                    if (storedMovement.length !== 0) {
                        var movement = angular.copy(WODconstants.movements[movementId], movement);
                        movement.modType = storedMovement.modType;
                        movement.history = [];
                        movement.strength = {
                            reps: WODconstants.repOptions[storedMovement.reps.value - 1],
                            effort: storedMovement.effort
                        };
                        movement.conditioning = storedMovement.overallreps;
                        if (storedMovement.orm.direct.use) {
                            movement.history.push({
                                direct: true,
                                value: storedMovement.orm.direct.value,
                                date: storedMovement.orm.direct.date
                            });
                        }
                        else {
                            if (storedMovement.orm.estimate.use) {
                                movement.history.push({
                                    direct: false,
                                    value: storedMovement.orm.estimate.value,
                                    date: storedMovement.orm.estimate.date
                                });
                            }
                        }
                        userObject.movements[movementId] = movement;
                        resolve();
                    }
                    else {
                        initializeMovement(movementId).then(function (movement) {
                            userObject.movements[movementId] = movement;
                            resolve();
                        });
                    }
                });
            }
            mL = getMovementList();
            for (var i = 0; i < mL.length; i++) {
                movementPromises.push(checkMovement(mL[i].id));
            }
            return $q.all(movementPromises);
        }
        function initializeMovement(movementId) {
            return $q(function (resolve, reject) {
                var movement = angular.copy(WODconstants.movements[movementId]);
                movement.modType = 'Reps';
                movement.strength = {
                    reps: WODconstants.repOptions[0],
                    effort: WODconstants.effortOptions[0]
                };
                movement.conditioning = WODconstants.overallRepOptions[0];
                movement.history = [];
                resolve(movement);
            });
        }
        function updateFamily() {
            var movementPromises = [];
            function checkMovement(movementId) {
                var familyPromises = [];
                delete userObject.movements[movementId].indirect;
                var movement = userObject.movements[movementId];
                function checkFamily(mov, mem) {
                    return getMovementById(userObject.movements[mov].convert[j].id).then(function (relatedMovement) {
                        return $q(function (resolve, reject) {
                            if (relatedMovement.history.length > 0) {
                                var recentRelated = angular.copy(relatedMovement.history[relatedMovement.history.length - 1]);
                                userObject.movements[mov].convert[mem].use = recentRelated;
                                if (userObject.movements[mov].indirect) {
                                    if (userObject.movements[mov].indirect.use.date < userObject.movements[mov].convert[mem].use.date) {
                                        if (userObject.movements[mov].convert[mem].use.direct) {
                                            userObject.movements[mov].indirect = userObject.movements[mov].convert[mem];
                                            resolve();
                                        }
                                        else {
                                            if (!userObject.movements[mov].indirect.use.date) {
                                                userObject.movements[mov].indirect = userObject.movements[mov].convert[mem];
                                            }
                                            else {
                                                resolve();
                                            }
                                        }
                                    }
                                    else {
                                        if (!userObject.movements[mov].indirect.use.direct && userObject.movements[mov].convert[mem].use.direct) {
                                            userObject.movements[mov].indirect = userObject.movements[mov].convert[mem];
                                            resolve();
                                        }
                                        else {
                                            resolve();
                                        }
                                    }
                                }
                                else {
                                    userObject.movements[mov].indirect = userObject.movements[mov].convert[mem];
                                    resolve();
                                }
                            }
                            else {
                                resolve();
                            }
                        });
                    });
                }
                for (var j = 0; j < movement.convert.length; j++) {
                    if (movement.convert[j].id !== movementId) {
                        familyPromises.push(checkFamily(movement.id, j));
                    }
                }
                return $q.all(familyPromises);
            }
            mL = getMovementList();
            for (var i = 0; i < mL.length; i++) {
                movementPromises.push(checkMovement(mL[i].id));
            }
            return $q.all(movementPromises);
        }
        function storeUserObject() {
            return $q(function (resolve, reject) {
                $localstorage.setObject('user-object', userObject);
                resolve();
            });
        }
        function newOneRepMax(movement, newOrm, direct) {
            return $q(function (resolve, reject) {
                if (direct) {
                    if (newOrm !== '' && !isNaN(newOrm)) {
                        userObject.movements[movement.id].history.push({
                            direct: direct,
                            value: newOrm,
                            date: Date.now()
                        });
                        resolve();
                    }
                    else {
                        resolve(null);
                    }
                }
                else {
                    calculateEstimate(newOrm.weight, newOrm.reps, function (newWeight) {
                        userObject.movements[movement.id].history.push({
                            direct: direct,
                            value: newWeight,
                            weight: newOrm.weight,
                            reps: newOrm.reps,
                            date: Date.now()
                        });
                    });
                    resolve();
                }
            }).then(updateFamily).then(storeUserObject);
        }
        function setModType(movement, newModType, saveChanges) {
            return $q(function (resolve, reject) {
                movement.modType = newModType;
                if (saveChanges) {
                    userObject.movements[movement.id].modType = newModType;
                    $localstorage.setObject('user-object', userObject);
                    resolve(movement);
                }
                else {
                    resolve(movement);
                }
            });
        }
        function setReps(movement, newReps, saveChanges) {
            return $q(function (resolve, reject) {
                movement.strength.reps = newReps;
                if (saveChanges) {
                    userObject.movements[movement.id].strength.reps = newReps;
                    $localstorage.setObject('user-object', userObject);
                    resolve(movement);
                }
                else {
                    resolve(movement);
                }
            });
        }
        function setOverallReps(movement, newReps, saveChanges) {
            return $q(function (resolve, reject) {
                movement.conditioning = newReps;
                if (saveChanges) {
                    userObject.movements[movement.id].conditioning = newReps;
                    $localstorage.setObject('user-object', userObject);
                    resolve(movement);
                }
                else {
                    resolve(movement);
                }
            });
        }
        function setEffort(movement, newEffort, saveChanges) {
            return $q(function (resolve, reject) {
                movement.strength.effort = newEffort;
                if (saveChanges) {
                    userObject.movements[movement.id].strength.effort = newEffort;
                    $localstorage.setObject('user-object', userObject);
                    resolve(movement);
                }
                else {
                    resolve(movement);
                }
            });
        }
        function calculateEstimate(ormWeight, ormReps, callback) {
            var newWeight = ormWeight / ormReps.value;
            callback(newWeight);
        }
        function checkDisclaimer() {
            return $localstorage.getPromise('disclaimerAgreed', false);
        }
        function getRepMod(reps) {
            if (reps >= 15) {
                return WODconstants.repOptions[WODconstants.repOptions.length - 1];
            }
            else {
                if (reps <= 0) {
                    return { name: 'n/a', value: 0 };
                }
                else {
                    return WODconstants.repOptions[reps - 1];
                }
            }
        }
    }
})();
