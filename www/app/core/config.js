(function () {
    'use strict';
    var core = angular.module('app.core');
    core.run(wodrightRun);
    wodrightRun.$inject = ['$ionicPlatform', '$ionicHistory'];
    function wodrightRun($ionicPlatform, $ionicHistory) {
        $ionicPlatform.registerBackButtonAction(function () {
            if ($ionicHistory.currentStateName === 'someStateName') {
                event.preventDefault();
            }
            else {
                $ionicHistory.goBack();
            }
        }, 100);
        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
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
    wodrightConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider'];
    function wodrightConfig($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.tabs.position('bottom');
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
            .state('app.maxes', {
            cache: false,
            url: "/maxes",
            views: {
                'menuContent': {
                    templateUrl: "app/maxes/maxes.html",
                    controller: 'MaxesCtrl as max'
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
            .state('app.woddetails', {
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "app/woddetails/woddetails.html",
                    controller: 'WodDetailsCtrl as wd'
                }
            },
            params: {
                wodId: null,
                log: false
            }
        })
            .state('app.newwod', {
            cache: false,
            url: "/newwod",
            views: {
                'menuContent': {
                    templateUrl: "app/newwod/newwod.html",
                    controller: 'NewWodCtrl as nw'
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
        $urlRouterProvider.otherwise('/app/launcher');
    }
})();
