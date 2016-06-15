(function() {
    'use strict';

    angular.module('calendarDemoApp', ['ionic', 'ngAnimate', 'calendar_pk'])
    .run(function ($ionicPlatform, $animate) {
        'use strict';
        $animate.enabled(false);
    })
})();


(function() {
    'use strict';

    angular.module('calendarDemoApp')
    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';
        $stateProvider
            .state('tabs', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })
            .state('tabs.home', {
                url: '/home',
                views: {
                    'home-tab': {
                        templateUrl: 'templates/home.html',
                        controller: 'CalendarDemoCtrl'
                    }
                }
            })
            .state('tabs.about', {
                url: '/about',
                views: {
                    'about-tab': {
                        templateUrl: 'templates/about.html'
                    }
                }
            })
            .state('tabs.contact', {
                url: '/contact',
                views: {
                    'contact-tab': {
                        templateUrl: 'templates/contact.html'
                    }
                }
            });

        $urlRouterProvider.otherwise('/tab/home');
    })
})();


(function() {
    'use strict';

    angular.module('calendarDemoApp')
    .controller('CalendarDemoCtrl', CalendarDemoCtrl);

    CalendarDemoCtrl.$inject = ['$scope'];
    function CalendarDemoCtrl($scope) {
        $scope.calendar = {};
        $scope.calendar.eventSource = [];
        $scope.viewTitle = {};

        function uniq(a) {
            return a.sort().filter(function(item, pos, ary) {
                return !pos || item.startTime != ary[pos - 1].startTime;
            })
        }

        $scope.loadEvents = function () {
            var events = [];
            for (var i = 0; i < 50; i += 1) {
                var date = new Date(),
                    startDay = Math.floor(Math.random() * 90) - 45,
                    startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + startDay));

                events.push({
                    startTime: startTime,
                });
            }
            events = uniq(events);
            $scope.calendar.eventSource = events;
        };

        $scope.onViewTitleChanged = function (title) {
            $scope.viewTitle = title;
        };

        // Called when clicking on a date
        $scope.onTimeSelected = function (selectedTime) {
            console.log('Selected time: ' + selectedTime);
        };
    }
})();
