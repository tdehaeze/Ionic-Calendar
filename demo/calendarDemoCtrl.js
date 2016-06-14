angular.module('calendarDemoApp', ['ionic', 'ngAnimate', 'calendar_pk'])
    .run(function ($ionicPlatform, $animate) {
        'use strict';
        $animate.enabled(false);
    })
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

    .controller('CalendarDemoCtrl', function ($scope) {
        'use strict';
        $scope.calendar = {};
        $scope.calendar.eventSource = [];

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
            $scope.calendar.eventSource = events;
        };

        $scope.onViewTitleChanged = function (title) {
            $scope.viewTitle = title;
        };

        $scope.today = function () {
            $scope.calendar.currentDate = new Date();
        };

        $scope.isToday = function () {
            var today = new Date(),
                currentCalendarDate = new Date($scope.calendar.currentDate);

            today.setHours(0, 0, 0, 0);
            currentCalendarDate.setHours(0, 0, 0, 0);
            return today.getTime() === currentCalendarDate.getTime();
        };

        function getEventIndex (events, time) {
            var j = -1;

            for (var i = 0; i < events.length; i++) {
                if (events[i].startTime === time){
                    var j = i;
                    break;
                }
            }

            return j;
        };

        // Called when clicking on a date
        $scope.onTimeSelected = function (selectedTime) {
            var eventSource = $scope.calendar.eventSource;
            var lapin = {
                startTime: selectedTime,
                endTime: selectedTime,
            };

            var j = getEventIndex(eventSource, selectedTime)

            if (j > -1) {
                eventSource.splice(j, 1);
            } else {
                eventSource.push(lapin);
            }

            console.log('Selected time: ' + selectedTime);
        };
    });
