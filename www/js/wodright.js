/// <reference path="../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('app', [
        'app.core',
        'app.menu',
        'app.disclaimer',
        'app.about',
        'app.launcher',
        'app.movement',
        'app.strength',
        'app.conditioning',
        'app.wods',
        //'app.named',
        'app.widgets'
    ]);
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular
        .module('app.about')
        .controller('AboutCtrl', AboutCtrl);
    function AboutCtrl() {
        var vm = this;
    }
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('app.about', []);
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular
        .module('app.conditioning')
        .controller('ConditioningCtrl', ConditioningCtrl);
    ConditioningCtrl.$inject = ['$scope', '$state', '$q', '$ionicHistory', '$ionicPopup', 'dataservice', 'wodservice'];
    function ConditioningCtrl($scope, $state, $q, $ionicHistory, $ionicPopup, dataservice, wodservice) {
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
        vm.addToWOD = addToWOD;
        vm.removeFromWOD = removeFromWOD;
        vm.clearWOD = clearWOD;
        vm.movementRefresh = movementRefresh;
        vm.saveWOD = saveWOD;
        vm.goToWOD = goToWOD;
        vm.updateWodItem = updateWodItem;
        dataservice.checkDisclaimer().then(function (disclaimer) {
            if (disclaimer) {
                resetWOD();
                movementRefresh();
            }
            else {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('app.disclaimer');
            }
        });
        function movementRefresh() {
            vm.mL = [];
            vm.m = {};
            vm.wod.movements = [];
            function initWOD(currentMovement) {
                return $q(function (resolve, reject) {
                    dataservice.getMovementById(currentMovement.id).then(function (newMovement) {
                        var wodMovement = {};
                        angular.copy(newMovement, wodMovement);
                        wodMovement.conditioning = currentMovement.reps;
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
                            }, function (wodname) {
                                vm.wod.name = wodname;
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
                    vm.wod.name = '';
                    wodservice.saveCurrentWOD(vm.wod);
                }, function (wodname) {
                    vm.wod.name = wodname;
                    vm.wod.unique = false;
                    wodservice.saveCurrentWOD(vm.wod);
                });
            });
        }
        function addToWOD(mvmt) {
            mvmt.wod = true;
            var newMvmt = angular.copy(mvmt);
            vm.wod.movements.push(newMvmt);
            wodservice.checkUnique(vm.wod).then(function () {
                vm.wod.unique = true;
                vm.wod.name = '';
                wodservice.saveCurrentWOD(vm.wod);
            }, function (wodname) {
                vm.wod.unique = false;
                vm.wod.name = wodname;
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
                }, function (wodname) {
                    vm.wod.unique = false;
                    vm.wod.name = wodname;
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
            for (var i = vm.m.length - 1; i >= 0; i--) {
                vm.m[i].wod = false;
            }
            resetWOD();
            wodservice.saveCurrentWOD(vm.wod);
        }
        function saveWOD() {
            $scope.data = {};
            var wodNamePopup = $ionicPopup.show({
                templateUrl: 'templates/modals/wodname.html',
                title: 'Enter the name for this WOD',
                subTitle: '',
                scope: $scope,
                buttons: [{
                        text: 'Cancel',
                        type: 'button-light'
                    }, {
                        text: '<b>Save</b>',
                        type: 'button-calm',
                        onTap: function (e) {
                            e.preventDefault();
                            if (!$scope.data.name) {
                                //don't allow the user to close unless they enter a name
                                $scope.data.error = 'Please enter a name or cancel';
                            }
                            else {
                                wodservice.checkName($scope.data.name).then(function () {
                                    vm.wod.name = $scope.data.name;
                                    wodservice.saveWOD(vm.wod).then(function () {
                                        vm.wod.unique = false;
                                    });
                                }, function () {
                                    $scope.data.error = "That name is already taken.";
                                });
                            }
                        }
                    }]
            });
        }
        function goToWOD() {
        }
    }
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('app.conditioning', []);
})();

/// <reference path="../../typings/tsd.d.ts" />
/**
 * ==================  angular-ios9-uiwebview.patch.js v1.1.1 ==================
 *
 * This patch works around iOS9 UIWebView regression that causes infinite digest
 * errors in Angular.
 *
 * The patch can be applied to Angular 1.2.0 – 1.4.5. Newer versions of Angular
 * have the workaround baked in.
 *
 * To apply this patch load/bundle this file with your application and add a
 * dependency on the "ngIOS9UIWebViewPatch" module to your main app module.
 *
 * For example:
 *
 * ```
 * angular.module('myApp', ['ngRoute'])`
 * ```
 *
 * becomes
 *
 * ```
 * angular.module('myApp', ['ngRoute', 'ngIOS9UIWebViewPatch'])
 * ```
 *
 *
 * More info:
 * - https://openradar.appspot.com/22186109
 * - https://github.com/angular/angular.js/issues/12241
 * - https://github.com/driftyco/ionic/issues/4082
 *
 *
 * @license AngularJS
 * (c) 2010-2015 Google, Inc. http://angularjs.org
 * License: MIT
 */
angular.module('ngIOS9UIWebViewPatch', ['ng']).config(['$provide', function ($provide) {
        'use strict';
        $provide.decorator('$browser', ['$delegate', '$window', function ($delegate, $window) {
                if (isIOS9UIWebView($window.navigator.userAgent)) {
                    return applyIOS9Shim($delegate);
                }
                return $delegate;
                function isIOS9UIWebView(userAgent) {
                    return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
                }
                function applyIOS9Shim(browser) {
                    var pendingLocationUrl = null;
                    var originalUrlFn = browser.url;
                    browser.url = function () {
                        if (arguments.length) {
                            pendingLocationUrl = arguments[0];
                            return originalUrlFn.apply(browser, arguments);
                        }
                        return pendingLocationUrl || originalUrlFn.apply(browser, arguments);
                    };
                    window.addEventListener('popstate', clearPendingLocationUrl, false);
                    window.addEventListener('hashchange', clearPendingLocationUrl, false);
                    function clearPendingLocationUrl() {
                        pendingLocationUrl = null;
                    }
                    return browser;
                }
            }]);
    }]);

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    var core = angular.module('app.core');
    core.run(wodrightRun);
    wodrightRun.$inject = ['$ionicPlatform'];
    function wodrightRun($ionicPlatform) {
        $ionicPlatform.registerBackButtonAction(function () {
            if ($ionicHistory.currentStateName === 'someStateName') {
                event.preventDefault();
            }
            else {
                $ionicHistory.goBack();
            }
        }, 100);
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
            if (AdMob) {
                var admob_key = device.platform == "Android" ? "ca-app-pub-6778064968647340/3963516510" : "ca-app-pub-6778064968647340/3823915719";
                AdMob.createBanner({
                    adId: admob_key,
                    position: AdMob.AD_POSITION.BOTTOM_CENTER,
                    isTesting: false,
                    autoShow: true,
                    success: function () {
                        console.log("success");
                    },
                    error: function () {
                        console.log("error");
                    }
                });
            }
        });
    }
    core.config(wodrightConfig);
    wodrightConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
    function wodrightConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "app/menu/menu.html",
            controller: 'MenuCtrl as mn'
        })
            .state('app.launcher', {
            cache: false,
            url: "/launcher",
            views: {
                'menuContent': {
                    templateUrl: "app/launcher/launcher.html",
                    controller: 'LauncherCtrl as wr'
                }
            }
        })
            .state('app.movement', {
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "app/movement/movement.html",
                    controller: 'MovementCtrl as mvmt'
                }
            },
            params: {
                movementId: null,
                update: false
            }
        })
            .state('app.strength', {
            cache: false,
            url: "/strength",
            views: {
                'menuContent': {
                    templateUrl: "app/strength/strength.html",
                    controller: 'StrengthCtrl as str'
                }
            }
        })
            .state('app.conditioning', {
            cache: false,
            url: "/conditioning",
            views: {
                'menuContent': {
                    templateUrl: "app/conditioning/conditioning.html",
                    controller: 'ConditioningCtrl as con'
                }
            }
        })
            .state('app.wods', {
            cache: false,
            url: "/wods",
            views: {
                'menuContent': {
                    templateUrl: "app/wods/wods.html",
                    controller: 'WodsCtrl as wods'
                }
            }
        })
            .state('app.about', {
            url: "/about",
            views: {
                'menuContent': {
                    templateUrl: "app/about/about.html",
                    controller: 'AboutCtrl as ab'
                }
            }
        })
            .state('app.disclaimer', {
            cache: false,
            url: "/disclaimer/:view",
            views: {
                'menuContent': {
                    templateUrl: "app/disclaimer/disclaimer.html",
                    controller: 'DisclaimerCtrl as dc'
                }
            }
        });
        // if none of the above states are matched, use this as the fallback
        //$urlRouterProvider.otherwise('/app/disclaimer/0');
        $urlRouterProvider.otherwise('/app/launcher');
    }
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular
        .module('app.core')
        .constant('WODconstants', {
        familyList: [{
                filter: '',
                title: 'All'
            }, {
                filter: 'Squats',
                title: 'Squat'
            }, {
                filter: 'Presses',
                title: 'Press'
            }, {
                filter: 'Pull',
                title: 'Pulls'
            }, {
                filter: 'Misc',
                title: 'Misc'
            }],
        movementList: [{
                id: "Back-Squat",
                family: "Squats"
            }, {
                id: "Front-Squat",
                family: "Squats"
            }, {
                id: "Overhead-Squat",
                family: "Squats"
            }, {
                id: "Lunge",
                family: "Squats"
            }, {
                id: "Overhead-Lunge",
                family: "Squats"
            }, {
                id: "Press",
                family: "Presses"
            }, {
                id: "Push-Press",
                family: "Presses"
            }, {
                id: "Thruster",
                family: "Presses"
            }, {
                id: "Jerk",
                family: "Presses"
            }, {
                id: "Push-Jerk",
                family: "Presses"
            }, {
                id: "Clean-Jerk",
                family: "Presses"
            }, {
                id: "Deadlift",
                family: "Pulls"
            }, {
                id: "Clean",
                family: "Pulls"
            }, {
                id: "Power-Clean",
                family: "Pulls"
            }, {
                id: "Hang-Clean",
                family: "Pulls"
            }, {
                id: "Hang-Power-Clean",
                family: "Pulls"
            }, {
                id: "Snatch",
                family: "Pulls"
            }, {
                id: "Power-Snatch",
                family: "Pulls"
            }, {
                id: "Hang-Snatch",
                family: "Pulls"
            }, {
                id: "Hang-Power-Snatch",
                family: "Pulls"
            }, {
                id: "Bench-Press",
                family: "Misc"
            }, {
                id: "Barbell-Row",
                family: "Misc"
            }],
        movements: {
            "Back-Squat": {
                name: "Back Squat",
                id: "Back-Squat",
                family: "Squats",
                units: "lbs",
                convert: [{
                        name: "Front Squat",
                        id: "Front-Squat",
                        multiplier: 85
                    }, {
                        name: "Overhead Squat",
                        id: "Overhead-Squat",
                        multiplier: 65
                    }, {
                        name: "Lunge",
                        id: "Lunge",
                        multiplier: 55
                    }, {
                        name: "Overhead Lunge",
                        id: "Overhead-Lunge",
                        multiplier: 45
                    }]
            },
            "Front-Squat": {
                name: "Front Squat",
                id: "Front-Squat",
                family: "Squats",
                units: "lbs",
                convert: [{
                        name: "Back Squat",
                        id: "Back-Squat",
                        multiplier: 118
                    }, {
                        name: "Overhead Squat",
                        id: "Overhead-Squat",
                        multiplier: 76
                    }, {
                        name: "Lunge",
                        id: "Lunge",
                        multiplier: 64
                    }, {
                        name: "Overhead Lunge",
                        id: "Overhead-Lunge",
                        multiplier: 53
                    }]
            },
            "Overhead-Squat": {
                name: "Overhead Squat",
                id: "Overhead-Squat",
                family: "Squats",
                units: "lbs",
                convert: [{
                        name: "Back Squat",
                        id: "Back-Squat",
                        multiplier: 154
                    }, {
                        name: "Front Squat",
                        id: "Front-Squat",
                        multiplier: 131
                    }, {
                        name: "Lunge",
                        id: "Lunge",
                        multiplier: 85
                    }, {
                        name: "Overhead Lunge",
                        id: "Overhead-Lunge",
                        multiplier: 69
                    }]
            },
            "Lunge": {
                name: "Lunge",
                id: "Lunge",
                family: "Squats",
                units: "lbs",
                convert: [{
                        name: "Back Squat",
                        id: "Back-Squat",
                        multiplier: 182
                    }, {
                        name: "Front Squat",
                        id: "Front-Squat",
                        multiplier: 155
                    }, {
                        name: "Overhead Squat",
                        id: "Overhead-Squat",
                        multiplier: 118
                    }, {
                        name: "Overhead Lunge",
                        id: "Overhead-Lunge",
                        multiplier: 82
                    }]
            },
            "Overhead-Lunge": {
                name: "Overhead Lunge",
                id: "Overhead-Lunge",
                family: "Squats",
                units: "lbs",
                convert: [{
                        name: "Back Squat",
                        id: "Back-Squat",
                        multiplier: 222
                    }, {
                        name: "Front Squat",
                        id: "Front-Squat",
                        multiplier: 190
                    }, {
                        name: "Overhead Squat",
                        id: "Overhead-Squat",
                        multiplier: 144
                    }, {
                        name: "Lunge",
                        id: "Lunge",
                        multiplier: 122
                    }]
            },
            "Press": {
                name: "Press",
                id: "Press",
                family: "Presses",
                units: "lbs",
                convert: [{
                        name: "Push Press",
                        id: "Push-Press",
                        multiplier: 130
                    }, {
                        name: "Thruster",
                        id: "Thruster",
                        multiplier: 120
                    }, {
                        name: "Jerk",
                        id: "Jerk",
                        multiplier: 140
                    }, {
                        name: "Push Jerk",
                        id: "Push-Jerk",
                        multiplier: 135
                    }]
            },
            "Push-Press": {
                name: "Push Press",
                id: "Push-Press",
                family: "Presses",
                units: "lbs",
                convert: [{
                        name: "Press",
                        id: "Press",
                        multiplier: 77
                    }, {
                        name: "Thruster",
                        id: "Thruster",
                        multiplier: 92
                    }, {
                        name: "Jerk",
                        id: "Jerk",
                        multiplier: 108
                    }, {
                        name: "Push Jerk",
                        id: "Push-Jerk",
                        multiplier: 104
                    }]
            },
            "Thruster": {
                name: "Thruster",
                id: "Thruster",
                family: "Presses",
                units: "lbs",
                convert: [{
                        name: "Press",
                        id: "Press",
                        multiplier: 83
                    }, {
                        name: "Push Press",
                        id: "Push-Press",
                        multiplier: 108
                    }, {
                        name: "Jerk",
                        id: "Jerk",
                        multiplier: 117
                    }, {
                        name: "Push Jerk",
                        id: "Push-Jerk",
                        multiplier: 113
                    }]
            },
            "Jerk": {
                name: "Jerk",
                id: "Jerk",
                family: "Presses",
                units: "lbs",
                convert: [{
                        name: "Clean and Jerk",
                        id: "Clean-Jerk",
                        multiplier: 100
                    }, {
                        name: "Press",
                        id: "Press",
                        multiplier: 71
                    }, {
                        name: "Push Press",
                        id: "Push-Press",
                        multiplier: 92
                    }, {
                        name: "Thruster",
                        id: "Thruster",
                        multiplier: 86
                    }, {
                        name: "Push Jerk",
                        id: "Push-Jerk",
                        multiplier: 96
                    }]
            },
            "Push-Jerk": {
                name: "Push Jerk",
                id: "Push-Jerk",
                family: "Presses",
                units: "lbs",
                convert: [{
                        name: "Press",
                        id: "Press",
                        multiplier: 74
                    }, {
                        name: "Push Press",
                        id: "Push-Press",
                        multiplier: 96
                    }, {
                        name: "Thruster",
                        id: "Thruster",
                        multiplier: 89
                    }, {
                        name: "Jerk",
                        id: "Jerk",
                        multiplier: 104
                    }]
            },
            "Clean-Jerk": {
                name: "Clean and Jerk",
                id: "Clean-Jerk",
                family: "Presses",
                units: "lbs",
                convert: [{
                        name: "Jerk",
                        id: "Jerk",
                        multiplier: 100
                    }, {
                        name: "Press",
                        id: "Press",
                        multiplier: 71
                    }, {
                        name: "Push Press",
                        id: "Push-Press",
                        multiplier: 92
                    }, {
                        name: "Thruster",
                        id: "Thruster",
                        multiplier: 86
                    }, {
                        name: "Push Jerk",
                        id: "Push-Jerk",
                        multiplier: 96
                    }]
            },
            "Deadlift": {
                name: "Deadlift",
                id: "Deadlift",
                family: "Pulls",
                units: "lbs",
                convert: [{
                        name: "Clean",
                        id: "Clean",
                        multiplier: 55
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 50
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 50
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 45
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 45
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 40
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 40
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 35
                    }]
            },
            "Clean": {
                name: "Clean",
                id: "Clean",
                family: "Pulls",
                units: "lbs",
                convert: [{
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 182
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 91
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 91
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 82
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 82
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 73
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 73
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 64
                    }]
            },
            "Power-Clean": {
                name: "Power Clean",
                id: "Power-Clean",
                family: "Pulls",
                units: "lbs",
                convert: [{
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 200
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 110
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 100
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 90
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 90
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 80
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 80
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 70
                    }]
            },
            "Hang-Clean": {
                name: "Hang Clean",
                id: "Hang-Clean",
                family: "Pulls",
                units: "lbs",
                convert: [{
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 200
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 110
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 100
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 90
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 90
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 80
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 80
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 70
                    }]
            },
            "Hang-Power-Clean": {
                name: "Hang Power Clean",
                id: "Hang-Power-Clean",
                family: "Pulls",
                units: "lbs",
                convert: [{
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 222
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 122
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 111
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 111
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 100
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 89
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 89
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 78
                    }]
            },
            "Snatch": {
                name: "Snatch",
                id: "Snatch",
                family: "Pulls",
                units: "lbs",
                convert: [{
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 222
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 122
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 111
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 111
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 100
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 89
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 89
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 78
                    }]
            },
            "Power-Snatch": {
                name: "Power Snatch",
                id: "Power-Snatch",
                family: "Pulls",
                units: "lbs",
                convert: [{
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 250
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 138
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 125
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 125
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 113
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 113
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 100
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 88
                    }]
            },
            "Hang-Snatch": {
                name: "Hang Snatch",
                id: "Hang-Snatch",
                family: "Pulls",
                units: "lbs",
                convert: [{
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 250
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 138
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 125
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 125
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 113
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 113
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 100
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 88
                    }]
            },
            "Hang-Power-Snatch": {
                name: "Hang Power Snatch",
                id: "Hang-Power-Snatch",
                family: "Pulls",
                units: "lbs",
                convert: [{
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 286
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 157
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 143
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 143
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 129
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 129
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 114
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 114
                    }]
            },
            "Bench-Press": {
                name: "Bench Press",
                id: "Bench-Press",
                family: "Misc",
                units: "lbs",
                convert: []
            },
            "Barbell-Row": {
                name: "Barbell Row",
                id: "Barbell-Row",
                family: "Misc",
                units: "lbs",
                convert: []
            }
        },
        repOptions: [{
                name: '1',
                value: 1.0
            }, {
                name: '2',
                value: 0.94
            }, {
                name: '3',
                value: 0.91
            }, {
                name: '4',
                value: 0.88
            }, {
                name: '5',
                value: 0.86
            }, {
                name: '6',
                value: 0.83
            }, {
                name: '7',
                value: 0.82
            }, {
                name: '8',
                value: 0.78
            }, {
                name: '9',
                value: 0.77
            }, {
                name: '10',
                value: 0.73
            }, {
                name: '11',
                value: 0.72
            }, {
                name: '12',
                value: 0.67
            }, {
                name: '13',
                value: 0.67
            }, {
                name: '14',
                value: 0.67
            }, {
                name: '15+',
                value: 0.63
            }],
        effortOptions: [{
                name: '100%',
                value: 1
            }, {
                name: '95%',
                value: 0.95
            }, {
                name: '90%',
                value: 0.9
            }, {
                name: '85%',
                value: 0.85
            }, {
                name: '80%',
                value: 0.8
            }, {
                name: '75%',
                value: 0.75
            }, {
                name: '70%',
                value: 0.7
            }, {
                name: '65%',
                value: 0.65
            }, {
                name: '60%',
                value: 0.6
            }, {
                name: '55%',
                value: 0.55
            }, {
                name: '50%',
                value: 0.5
            }],
        overallRepOptions: [{
                name: '1-9',
                value: 0.9,
                lower: 1,
                upper: 9
            }, {
                name: '10-19',
                value: 0.8,
                lower: 10,
                upper: 19
            }, {
                name: '20-29',
                value: 0.7,
                lower: 20,
                upper: 29
            }, {
                name: '30-39',
                value: 0.6,
                lower: 30,
                upper: 39
            }, {
                name: '40-49',
                value: 0.5,
                lower: 40,
                upper: 49
            }, {
                name: '50-59',
                value: 0.45,
                lower: 50,
                upper: 59
            }, {
                name: '60-99',
                value: 0.4,
                lower: 60,
                upper: 99
            }, {
                name: '100+',
                value: 0.3,
                lower: 100,
                upper: 100000
            }],
        girls: [{
                name: 'Diane',
                goal: 'time',
                round: [{
                        name: 'Deadlift',
                        id: 'Deadlift',
                        reps: [21, 15, 9],
                        rx: 225.0,
                        rx_units: 'lbs'
                    }, {
                        name: 'Handstand Push-ups',
                        id: 'Handstand-Push-Ups',
                        reps: [21, 15, 9],
                        rx: 1.0,
                        rx_units: 'bodyweight'
                    }],
                rounds: 3,
                description: ['21-15-9 reps, for time']
            }, {
                name: 'Elizabeth',
                goal: 'time',
                round: [{
                        name: 'Clean',
                        id: 'Clean',
                        reps: [21, 15, 9],
                        rx: 135.0,
                        rx_units: 'lbs'
                    }, {
                        name: 'Ring Dips',
                        id: 'Ring-Dips',
                        reps: [21, 15, 9],
                        rx: 1.0,
                        rx_units: 'bodyweight'
                    }],
                rounds: 3,
                description: ['21-15-9 reps, for time']
            }, {
                name: 'Fran',
                goal: 'time',
                round: [{
                        name: 'Thruster',
                        id: 'Thruster',
                        reps: [21, 15, 9],
                        rx: 95.0,
                        rx_units: 'lbs'
                    }, {
                        name: 'Pull-ups',
                        id: 'Pull-Ups',
                        reps: [21, 15, 9],
                        rx: 1.0,
                        rx_units: 'bodyweight'
                    }],
                rounds: 3,
                description: ['21-15-9 reps, for time']
            }, {
                name: 'Grace',
                goal: 'time',
                round: [{
                        name: 'Clean and Jerk',
                        id: 'Clean-Jerk',
                        reps: [30],
                        rx: 135.0,
                        rx_units: 'lbs'
                    }],
                rounds: 1,
                description: ['30 reps, for time']
            }, {
                name: 'Isabel',
                goal: 'time',
                round: [{
                        name: 'Snatch',
                        id: 'Snatch',
                        reps: [30],
                        rx: 135.0,
                        rx_units: 'lbs'
                    }],
                rounds: 1,
                description: ['30 reps, for time']
            }, {
                name: 'Linda',
                goal: 'time',
                round: [{
                        name: 'Deadlift',
                        id: 'Deadlift',
                        reps: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
                        rx: 1.5,
                        rx_units: 'bodyweight'
                    }, {
                        name: 'Bench Press',
                        id: 'Bench-Press',
                        reps: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
                        rx: 1.0,
                        rx_units: 'bodyweight'
                    }, {
                        name: 'Clean',
                        id: 'Clean',
                        reps: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
                        rx: 0.75,
                        rx_units: 'bodyweight'
                    }],
                rounds: 10,
                description: ['10/9/8/7/6/5/4/3/2/1 rep', 'rounds for time', 'a.k.a. "3 bars of death"']
            }, {
                name: 'Nancy',
                goal: 'time',
                round: [{
                        name: 'Run',
                        id: 'run',
                        reps: [1, 1, 1, 1, 1],
                        rx: 400,
                        rx_units: 'm'
                    }, {
                        name: 'Overhead Squat',
                        id: 'Overhead-Squat',
                        reps: [15, 15, 15, 15, 15],
                        rx: 95,
                        rx_units: 'lbs'
                    }],
                rounds: 5,
                description: ['5 rounds for time']
            }, {
                name: 'Lynne',
                goal: 'reps',
                round: [{
                        name: 'Bench Press',
                        id: 'Bench-Press',
                        reps: [-1],
                        rx: 1.0,
                        rx_units: 'bodyweight'
                    }, {
                        name: 'Pull-ups',
                        id: 'Pull-Ups',
                        reps: [-1],
                        rx: 1.0,
                        rx_units: 'bodyweight'
                    }],
                rounds: 5,
                description: ['5 rounds for max reps', 'NO Time Component']
            }, {
                name: 'Amanda',
                goal: 'time',
                round: [{
                        name: 'Muscle-ups',
                        id: 'Muscle-Ups',
                        reps: [9, 7, 5],
                        rx: 1.0,
                        rx_units: 'bodyweight'
                    }, {
                        name: 'Snatch',
                        id: 'Snatch',
                        reps: [9, 7, 5],
                        rx: 135,
                        rx_units: 'lbs'
                    }],
                rounds: 3,
                description: ['For Time']
            }]
    });
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular
        .module('app.core')
        .controller('AppCtrl', AppCtrl);
    function AppCtrl() {
    }
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('app.core', [
        /*
         * Angular modules
         */
        'ionic', 'ngCordova', 'ngIOS9UIWebViewPatch'
    ]);
})();

/// <reference path="../../typings/tsd.d.ts" />
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
            getNoHistoryCount: getNoHistoryCount
        };
        return service;
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
                    getMovements.then(function (newUserObject) {
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
        function getAllHistory(limit) {
            return getMovements().then(function (mvmts) {
                return $q(function (resolve, reject) {
                    var unprocessedHistories = Object.keys(mvmts).map(function (val, ind) {
                        return mvmts[val].history.map(function (obj) {
                            obj.name = mvmts[val].name;
                            obj.id = mvmts[val].id;
                            return obj;
                        });
                    });
                    var flattenedHistories = unprocessedHistories.reduce(function (a, b) {
                        return a.concat(b);
                    });
                    flattenedHistories.sort(function (a, b) {
                        return a.date < b.date;
                    });
                    if (limit) {
                        resolve(flattenedHistories.slice(0, limit));
                    }
                    else {
                        resolve(flattenedHistories);
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
                    // future: do integrity check?
                    userObject = $localstorage.getObject('user-object', {});
                    resolve();
                }
                else {
                    // update DB
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
                    //check for existing information (stored in individual objects)
                    if (storedMovement.length !== 0) {
                        //if existing, store in user object
                        var movement = {};
                        angular.copy(WODconstants.movements[movementId], movement);
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
                        //if no existing, initialize
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
                var movement = {};
                angular.copy(WODconstants.movements[movementId], movement);
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
                                //use the most recent
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
                                            //prefer directs over indirects
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
                if (saveChanges === true) {
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
                if (saveChanges === true) {
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
                if (saveChanges === true) {
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
                if (saveChanges === true) {
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
    }
})();

/// <reference path="../../typings/tsd.d.ts" />
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

/// <reference path="../../typings/tsd.d.ts" />
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
            getCurrentWOD: getCurrentWOD,
            saveCurrentWOD: saveCurrentWOD,
            getSavedWODs: getSavedWODs
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
            return getUserObject().wods.saved;
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
                    //loop through and see if two WODs have the same movements and rep configurations
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
                        reject(wod.name);
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
        function saveWOD(newWOD) {
            return $q(function (resolve, reject) {
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
                    for (var i = wodList.wods.length - 1; i < 0; i--) {
                        if (wodList.wods[i].name === wodToRemove.name) {
                            wodList.wods[i].splice(i, 1);
                            $localstorage.setObject('list-of-wods', wodList);
                            resolve(wodList);
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
                        if (userObject.wods.saved[i].name === nameToCheck) {
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
                        reps: wod.conditioning
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
    }
})();

/// <reference path="../../typings/tsd.d.ts" />
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

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('app.disclaimer', []);
})();

/// <reference path="../../typings/tsd.d.ts" />
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

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('app.launcher', []);
})();

/// <reference path="../../typings/tsd.d.ts" />
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

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('app.menu', []);
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular
        .module('app.movement')
        .controller('MovementCtrl', MovementCtrl);
    MovementCtrl.$inject = ['$stateParams', '$timeout', '$ionicHistory', '$ionicActionSheet', '$ionicTabsDelegate', 'dataservice', 'WODconstants'];
    function MovementCtrl($stateParams, $timeout, $ionicHistory, $ionicActionSheet, $ionicTabsDelegate, dataservice, WODconstants) {
        var vm = this;
        vm.movement = {};
        vm.orm = {
            reps: WODconstants.repOptions[0]
        };
        vm.calculateEstimate = calculateEstimate;
        vm.openUpdateRepSheet = openUpdateRepSheet;
        vm.useKnown = useKnown;
        vm.useEstimate = useEstimate;
        vm.cancel = cancel;
        vm.history = [];
        dataservice.getMovementById($stateParams.movementId).then(function (movement) {
            angular.copy(movement, vm.movement);
            dataservice.getFamilyHistory(vm.movement.id).then(function (history) {
                vm.history = history;
            });
        });
        if ($stateParams.update === true) {
            $timeout(function () {
                $ionicTabsDelegate.select(3);
            }, 10);
        }
        function calculateEstimate() {
            dataservice.calculateEstimate(vm.orm.weight, vm.orm.reps, function (newWeight) {
                vm.orm.newEstimate = newWeight;
            });
        }
        function openUpdateRepSheet() {
            var buttons = [];
            for (var i = 0; i < WODconstants.repOptions.length; i++) {
                buttons.push({
                    text: WODconstants.repOptions[i].name
                });
            }
            var hideSheet = $ionicActionSheet.show({
                buttons: buttons,
                //destructiveText: 'Delete',
                titleText: 'How Many Reps?',
                cancelText: 'Cancel',
                cancel: function () {
                    // add cancel code..
                    return true;
                },
                buttonClicked: function (index) {
                    vm.orm.reps = WODconstants.repOptions[index];
                    dataservice.calculateEstimate(vm.orm.weight, vm.orm.reps, function (newWeight) {
                        vm.orm.newEstimate = newWeight;
                    });
                    return true;
                }
            });
        }
        function useKnown() {
            dataservice.newOneRepMax(vm.movement, vm.orm.direct, true).then(function () {
                cancel();
            });
        }
        function useEstimate() {
            dataservice.newOneRepMax(vm.movement, {
                weight: vm.orm.weight,
                reps: vm.orm.reps
            }, false).then(function () {
                cancel();
            });
        }
        function cancel() {
            $ionicHistory.goBack();
        }
    }
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('app.movement', []);
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
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
        dataservice.getMovements().then(function (movements) {
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
                    }
                    else {
                        if (mL.indexOf(girl.round[i].id) > -1) {
                            girl.movements[girl.round[i].id] = angular.copy(m[girl.round[i].id]);
                            girl.movements[girl.round[i].id].total_reps = reps;
                            girl.movements[girl.round[i].id].rx = girl.round[i].rx;
                            girl.movements[girl.round[i].id].rx_units = girl.round[i].rx_units;
                            girl.movements[girl.round[i].id].named = angular.copy(dataservice.findRepMod(reps));
                            calculateRange(girl.movements[girl.round[i].id]);
                        }
                        else {
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

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('app.named', []);
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular
        .module('app.strength')
        .controller('StrengthCtrl', StrengthCtrl);
    StrengthCtrl.$inject = ['$state', '$ionicHistory', 'dataservice'];
    function StrengthCtrl($state, $ionicHistory, dataservice) {
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
        vm.movementRefresh = movementRefresh;
        dataservice.checkDisclaimer().then(function (disclaimer) {
            if (disclaimer) {
                movementRefresh();
            }
            else {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('app.disclaimer');
            }
        });
        function movementRefresh() {
            vm.mL = [];
            vm.m = {};
            dataservice.getMovements().then(function (movements) {
                angular.copy(movements, vm.m);
                angular.copy(dataservice.getMovementList(), vm.mL);
            });
        }
    }
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('app.strength', []);
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('app.widgets', []);
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular
        .module('app.widgets')
        .controller('MovementItemCtrl', MovementItemCtrl);
    MovementItemCtrl.$inject = ['$scope', '$state', '$ionicActionSheet', '$ionicPopup', 'dataservice', 'WODconstants'];
    function MovementItemCtrl($scope, $state, $ionicActionSheet, $ionicPopup, dataservice, WODconstants) {
        var vm = this;
        vm.itemClass = '';
        vm.itemDate = '';
        vm.footer = '';
        vm.openModSheet = openModSheet;
        if (vm.mode === 'strength') {
            vm.openOptionSheet = openOptionSheetStrength;
        }
        if (vm.mode === 'conditioning') {
            vm.openOptionSheet = openOptionSheetConditioning;
        }
        vm.updateMovement = updateMovement;
        initializeInfo();
        function initializeInfo() {
            vm.active = {};
            if (vm.item.history.length > 0) {
                if (vm.item.history[vm.item.history.length - 1].direct) {
                    vm.itemClass = 'direct';
                    vm.itemDate = vm.item.history[vm.item.history.length - 1].date;
                    vm.footer = '';
                    vm.active = {
                        use: vm.item.history[vm.item.history.length - 1].value
                    };
                }
                else {
                    vm.itemClass = 'estimate';
                    vm.itemDate = vm.item.history[vm.item.history.length - 1].date;
                    vm.footer = '(estimate)';
                    vm.active = {
                        use: vm.item.history[vm.item.history.length - 1].value
                    };
                }
            }
            else {
                if (vm.item.indirect) {
                    vm.itemClass = 'indirect';
                    vm.itemDate = vm.item.indirect.use.date;
                    vm.footer = '(' + vm.item.indirect.name + ')';
                    vm.active = {
                        use: vm.item.indirect.use.value * vm.item.indirect.multiplier / 100
                    };
                }
                else {
                    vm.updateButton = true;
                }
            }
            if (vm.active.use) {
                if (vm.mode === 'strength') {
                    if (vm.item.modType === 'Reps') {
                        vm.active.mod = vm.item.strength.reps;
                    }
                    else {
                        vm.active.mod = vm.item.strength.effort;
                    }
                }
                else {
                    vm.active.mod = vm.item.conditioning;
                }
                vm.active.low = 0.95 * vm.active.use * vm.active.mod.value;
                vm.active.high = vm.active.use * vm.active.mod.value;
            }
        }
        function refreshMovement() {
            var movement = dataservice.getMovementById(vm.item.id);
            vm.item = movement;
            initializeInfo();
        }
        function openModSheet() {
            if (vm.mode === 'strength') {
                if (vm.item.modType === 'Reps') {
                    openRepSheet();
                }
                else {
                    openEffortSheet();
                }
            }
            else {
                openOverallRepSheet();
            }
        }
        function openOverallRepSheet() {
            var buttons = [];
            for (var i = 0; i < WODconstants.overallRepOptions.length; i++) {
                buttons.push({
                    text: WODconstants.overallRepOptions[i].name
                });
            }
            var hideSheet = $ionicActionSheet.show({
                buttons: buttons,
                //destructiveText: 'Delete',
                titleText: 'How Many Overall Reps?',
                cancelText: 'Cancel',
                cancel: function () {
                    // add cancel code..
                    return true;
                },
                buttonClicked: function (index) {
                    dataservice.setOverallReps(vm.item, WODconstants.overallRepOptions[index], vm.saveChanges).then(function (movement) {
                        vm.item = movement;
                        initializeInfo();
                        vm.updateWodItem({
                            id: movement.id,
                            reps: movement.conditioning
                        });
                    });
                    return true;
                }
            });
        }
        function openRepSheet() {
            var buttons = [];
            for (var i = 0; i < WODconstants.repOptions.length; i++) {
                buttons.push({
                    text: WODconstants.repOptions[i].name
                });
            }
            var hideSheet = $ionicActionSheet.show({
                buttons: buttons,
                titleText: 'How Many Reps?',
                cancelText: 'Cancel',
                cancel: function () {
                    return true;
                },
                buttonClicked: function (index) {
                    dataservice.setReps(vm.item, WODconstants.repOptions[index], vm.saveChanges).then(function (movement) {
                        vm.item = movement;
                        initializeInfo();
                    });
                    return true;
                }
            });
        }
        function openEffortSheet() {
            var buttons = [];
            for (var i = 0; i < WODconstants.effortOptions.length; i++) {
                buttons.push({
                    text: WODconstants.effortOptions[i].name
                });
            }
            var hideSheet = $ionicActionSheet.show({
                buttons: buttons,
                //destructiveText: 'Delete',
                titleText: 'How Much Effort?',
                cancelText: 'Cancel',
                cancel: function () {
                    return true;
                },
                buttonClicked: function (index) {
                    dataservice.setEffort(vm.item, WODconstants.effortOptions[index], vm.saveChanges).then(function (movement) {
                        vm.item = movement;
                        initializeInfo();
                    });
                    return true;
                }
            });
        }
        function openOptionSheetStrength() {
            var repEffortButton = {
                text: 'Switch to Reps',
                value: 'reps'
            };
            var buttonOptions = [{
                    text: 'Update One Rep Max',
                    value: 'update'
                }, {
                    text: 'Show Details',
                    value: 'details'
                }];
            if (vm.item.history.length > 0 || vm.item.indirect) {
                if (vm.item.modType === 'Reps') {
                    repEffortButton = {
                        text: 'Switch to Effort',
                        value: 'effort'
                    };
                }
                else {
                    repEffortButton = {
                        text: 'Switch to Reps',
                        value: 'reps'
                    };
                }
                buttonOptions.splice(1, 0, repEffortButton); //change to 2 when details enabled
            }
            var hideSheet = $ionicActionSheet.show({
                buttons: buttonOptions,
                destructiveText: 'Delete Info',
                titleText: vm.item.name,
                cancelText: 'Cancel',
                cancel: function () {
                    return true;
                },
                destructiveButtonClicked: function () {
                    $scope.data = {};
                    var deletePopup = $ionicPopup.show({
                        //templateUrl: 'templates/modals/wodname.html',
                        title: 'Deleting will remove all history for this movement, are you sure?',
                        subTitle: '',
                        scope: $scope,
                        buttons: [{
                                text: 'Cancel',
                                type: 'button-light'
                            }, {
                                text: '<b>Delete</b>',
                                type: 'button-assertive',
                                onTap: function (e) {
                                    dataservice.resetMovement(vm.item).then(function (movement) {
                                        vm.item = movement;
                                        vm.movementRefresh();
                                        initializeInfo();
                                    });
                                    return true;
                                }
                            }]
                    });
                },
                buttonClicked: function (index) {
                    switch (buttonOptions[index].value) {
                        case 'reps':
                            dataservice.setModType(vm.item, 'Reps', vm.saveChanges).then(function (movement) {
                                vm.item = movement;
                                initializeInfo();
                            });
                            return true;
                        case 'effort':
                            dataservice.setModType(vm.item, 'Effort', vm.saveChanges).then(function (movement) {
                                vm.item = movement;
                                initializeInfo();
                            });
                            return true;
                        case 'details':
                            movementDetails();
                            return true;
                        case 'update':
                            updateMovement();
                            return true;
                        default:
                            return true;
                    }
                }
            });
        }
        function openOptionSheetConditioning() {
            var repEffortButton = {};
            var buttonOptions = [{
                    text: 'Update One Rep Max',
                    value: 'update'
                }, {
                    text: 'Show Details',
                    value: 'details'
                }];
            var wodButton = {
                text: 'Add to WOD',
                value: 'addToWOD'
            };
            if (vm.item.wod) {
                wodButton = {
                    text: 'Remove from WOD',
                    value: 'removeFromWOD'
                };
            }
            buttonOptions.push(wodButton);
            var hideSheet = $ionicActionSheet.show({
                buttons: buttonOptions,
                destructiveText: 'Delete Info',
                titleText: vm.item.name,
                cancelText: 'Cancel',
                cancel: function () {
                    return true;
                },
                destructiveButtonClicked: function () {
                    dataservice.resetMovement(vm.item).then(function () {
                        var movement = dataservice.getMovementById(vm.item.id);
                        vm.item = movement;
                        vm.movementRefresh();
                        initializeInfo();
                    });
                    return true;
                },
                buttonClicked: function (index) {
                    switch (buttonOptions[index].value) {
                        case 'details':
                            movementDetails();
                            return true;
                        case 'update':
                            updateMovement();
                            return true;
                        case 'addToWOD':
                            vm.addToWod({
                                mvmt: vm.item
                            });
                            return true;
                        case 'removeFromWOD':
                            vm.removeFromWod({
                                mvmt: vm.item
                            });
                            return true;
                        default:
                            return true;
                    }
                }
            });
        }
        function updateMovement() {
            $state.go('app.movement', {
                movementId: vm.item.id,
                update: true
            });
        }
        function movementDetails() {
            $state.go('app.movement', {
                movementId: vm.item.id,
                update: false
            });
        }
    }
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular
        .module('app.widgets')
        .directive('wrMovementItem', wrMovementItem);
    function wrMovementItem() {
        var directive = {
            restrict: 'E',
            scope: {
                'item': '=',
                'saveChanges': '@',
                'mode': '@',
                'addToWod': '&',
                'removeFromWod': '&',
                'movementRefresh': '&',
                'updateWodItem': '&'
            },
            bindToController: true,
            templateUrl: 'app/widgets/wrMovementItem.html',
            controller: 'MovementItemCtrl as mi'
        };
        return directive;
    }
})();

/// <reference path="../../typings/tsd.d.ts" />
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
                    // backspace, enter, escape, arrows
                    return true;
                }
                else if (event.which >= 48 && event.which <= 57) {
                    // numbers
                    return true;
                }
                else if (event.which >= 96 && event.which <= 105) {
                    // numpad number
                    return true;
                }
                else if ([110, 190].indexOf(event.which) > -1) {
                    // dot and numpad dot
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

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular
        .module('app.wods')
        .controller('WodsCtrl', WodsController);
    WodsController.$inject = ['$state', '$timeout', 'dataservice', 'wodservice', '$ionicTabsDelegate'];
    function WodsController($state, $timeout, dataservice, wodservice, $ionicTabsDelegate) {
        var vm = this;
        var isIPad = ionic.Platform.isIPad();
        var isIOS = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();
        vm.iOS = false;
        if (isIPad || isIOS) {
            vm.iOS = true;
        }
        vm.wods = [];
        vm.makeWOD = makeWOD;
        initWODs();
        function initWODs() {
            $timeout(function () {
                $ionicTabsDelegate.select(1);
            }, 10);
            console.log($ionicTabsDelegate.selectedIndex());
            vm.wods = wodservice.getSavedWODs();
        }
        function makeWOD() {
            $state.go('app.conditioning');
        }
    }
})();

/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('app.wods', []);
})();
