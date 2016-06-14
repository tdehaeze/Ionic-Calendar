(function() {
  'use strict';

  angular.module('directives')
    .directive('calendar', calendar);

  calendar.$inject = [];
  function calendar() {
    var directive = {};

    directive.restrict = 'E';
    directive.replace = true;

    directive.templateUrl = 'calendar.html';

    directive.scope = {
      rangeChanged:  '&', // Called when vm.queryMode === 'remote' and when changing the month
      timeSelected:  '&', // Called when clicking on a date
      titleChanged:  '&', // Called when changing the month (TODO => same time called with rangeChanged ? => fusion ?)
      eventSource:   '=', // All the events => two way data binding
      monthTitle:    '=',
    };

    directive.require = ['calendar', '?^ngModel'];

    directive.controllerAs = 'cc';
    directive.controller = CalendarController;
    CalendarController.$inject = ['$scope', '$attrs', '$parse', '$interpolate', 'calendarConfig', '$timeout', '$ionicSlideBoxDelegate', 'dateFilter'];
    function CalendarController($scope, $attrs, $parse, $interpolate, calendarConfig, $timeout, $ionicSlideBoxDelegate, dateFilter) {
      var vm = this;

      $scope.$watch(function(){
        return $scope.eventSource;
      }, function (newVal, oldVal) {
        // if (onDataLoaded) {
          onDataLoaded();
        // }
      }, true);

      init();
      function init() {
        // Configuration attributes
        angular.forEach(['formatDay', 'formatDayHeader', 'formatMonthTitle', 'queryMode', 'startingDayMonth'], function (key, index) {
          vm[key] = angular.isDefined($attrs[key]) ? $interpolate($attrs[key])($scope.$parent) : calendarConfig[key];
        });

        // TODO => no more currentCalendarDate
        // if (angular.isDefined($attrs.initDate)) {
        //   vm.currentCalendarDate = $scope.$parent.$eval($attrs.initDate);
        // }

        if (!vm.currentCalendarDate) {
          vm.currentCalendarDate = new Date();
          // if ($attrs.ngModel && !$scope.$parent.$eval($attrs.ngModel)) {
          //   $parse($attrs.ngModel).assign($scope.$parent, vm.currentCalendarDate);
          // }
        }
      }



      // Used to get the "AdjacentCalendarDate"
      // => this is the same day as the currentCalendarDate but shifted from one month depending of the direction
      // => from the direction, add/substract one month to currentCalendarDate
      // => TODO : should delete this function => no more currentCalendarDate/selectedDate
      function getAdjacentCalendarDate(currentCalendarDate, direction) {
        var calculateCalendarDate = new Date(currentCalendarDate),
            year = calculateCalendarDate.getFullYear(),
            month = calculateCalendarDate.getMonth() + direction,
            date = calculateCalendarDate.getDate(),
            firstDayInNextMonth;

        calculateCalendarDate.setFullYear(year, month, date);

        firstDayInNextMonth = new Date(year, month + 1, 1);
        if (firstDayInNextMonth.getTime() <= calculateCalendarDate.getTime()) {
          calculateCalendarDate = new Date(firstDayInNextMonth - 24 * 60 * 60 * 1000);
        }

        return calculateCalendarDate;
      }

      // DONE
      function onDataLoaded() {
        var eventSource     = $scope.eventSource, // All the events
            timeZoneOffset  = -new Date().getTimezoneOffset(),
            utcStartTime    = new Date(vm.range.startTime.getTime() + timeZoneOffset * 60 * 1000), // StartTime of the month
            utcEndTime      = new Date(vm.range.endTime.getTime() + timeZoneOffset * 60 * 1000), // EndTime of the month
            dates           = $scope.views[$scope.currentViewIndex].dates; // All the dates of the current scope (42 dates)

        // Reset
        for (var r = 0; r < 42; r += 1) {
          dates[r].events = [];
        }

        // loop over all events
        // => If eventDate is in the scope of the current view
        //  => add the event to $scope.views[$scope.currentViewIndex].dates
        for (var i = 0; i < eventSource.length; i += 1) {
          var event = eventSource[i],
              eventDate = new Date(event.startTime);

          if (utcStartTime <= eventDate && eventDate <= utcEndTime){
            dates[Math.floor((eventDate - utcStartTime) / 86400000)].events = [event];
          }
        }
      }

      // DONE
      // Used to toogle one date
      function toogle(selectedTime){
        function getEventIndex (events, time) {
          var j = -1;

          for (var i = 0; i < events.length; i++) {
            var eventTime = events[i].startTime;
            if (eventTime.getDate() === time.getDate() && eventTime.getMonth() === time.getMonth() && eventTime.getFullYear() === time.getFullYear()){
                j = i;
                break;
            }
          }

          return j;
        }

        var eventSource = $scope.eventSource;
        var event = {
          startTime: selectedTime
        };

        var index = getEventIndex(eventSource, selectedTime);

        if (index > -1) {
          eventSource.splice(index, 1);
        } else {
          eventSource.push(event);
        }
      }

      // DONE
      // Triggered on ng-click when clicking on a date
      // => Call the function timeSelected passed to the directive
      $scope.select = function (selectedTime) {
        toogle(selectedTime);

        if ($scope.views && $scope.timeSelected) {
          $scope.timeSelected({selectedTime: selectedTime});
        }
      };



      // DONE
      // Register $scope.slideChanged
      registerSlideChanged();
      function registerSlideChanged() {
        $scope.currentViewIndex = 0;

        // First called when changing the month
        // => calculate the direction of the slide
        // => get the currentCalendarDate from getAdjacentCalendarDate and the direction
        // => call refreshView
        $scope.slideChanged = function ($index) {
          $timeout(function () {
            var currentViewIndex = $scope.currentViewIndex,
                direction = 0;

            if (currentViewIndex === $index - 1 || ($index === 0 && currentViewIndex === 2)) {
              direction = 1;
            } else if (currentViewIndex === $index + 1 || ($index === 2 && currentViewIndex === 0)) {
              direction = -1;
            }

            $scope.currentViewIndex = $index;

            vm.currentCalendarDate = getAdjacentCalendarDate(vm.currentCalendarDate, direction);
            refreshView(direction);
          }, 100);
        };
      }


      // TODO => understand
      // Called when changing the month
      // direction -1 (gauche), +1(droite)
      refreshView();
      function refreshView(direction) {
        // direction = typeof direction === 'undefined' ? 0 : direction;

        function getRange(currentDate) {
          var year = currentDate.getFullYear(),
              month = currentDate.getMonth(),
              firstDayOfMonth = new Date(year, month, 1),
              difference = vm.startingDayMonth - firstDayOfMonth.getDay(),
              numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference,
              startDate = new Date(firstDayOfMonth),
              endDate;

          if (numDisplayedFromPreviousMonth > 0) {
            startDate.setDate(-numDisplayedFromPreviousMonth + 1);
          }

          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 42);

          return {
            startTime: startDate,
            endTime: endDate
          };
        }

        vm.range = getRange(vm.currentCalendarDate);

        refreshMonth();
        function refreshMonth(){
          var currentViewStartDate = vm.range.startTime,
              date = currentViewStartDate.getDate(),
              month = (currentViewStartDate.getMonth() + (date !== 1 ? 1 : 0)) % 12,
              year = currentViewStartDate.getFullYear() + (date !== 1 && month === 0 ? 1 : 0),
              headerDate = new Date(year, month, 1);

          $scope.monthTitle.lapin = dateFilter(headerDate, vm.formatMonthTitle);
        }

        populateAdjacentViews();
        function populateAdjacentViews() {

          // Used to get an array of 42 days (7days * 6weeks)
          // => used to display the current month
          function getDates(startDate) {
            var dates = new Array(42),
                current = new Date(startDate);

            current.setHours(12); // Prevent repeated dates because of timezone bug

            for (var i = 0; i < dates.length; i++) {
              dates[i] = {
                date: new Date(current),
                event: false
              };
              current.setDate(current.getDate() + 1);
            }

            return {
              dates: dates
            };
          }

          function getAdjacentViewStartTime(direction) {
            var adjacentCalendarDate = getAdjacentCalendarDate(vm.currentCalendarDate, direction);
            return getRange(adjacentCalendarDate).startTime;
          }

          var currentViewStartDate,
              currentViewData,
              toUpdateViewIndex,
              currentViewIndex = $scope.currentViewIndex;

          if (direction === 1) {
            currentViewStartDate = getAdjacentViewStartTime(direction);
            toUpdateViewIndex = (currentViewIndex + 1) % 3;
            angular.copy(getDates(currentViewStartDate), $scope.views[toUpdateViewIndex]);
          } else if (direction === -1) {
            currentViewStartDate = getAdjacentViewStartTime(direction);
            toUpdateViewIndex = (currentViewIndex + 2) % 3;
            angular.copy(getDates(currentViewStartDate), $scope.views[toUpdateViewIndex]);
          } else {
            if (!$scope.views) {
              currentViewData = [];
              currentViewStartDate = vm.range.startTime;
              currentViewData.push(getDates(currentViewStartDate));
              currentViewStartDate = getAdjacentViewStartTime(1);
              currentViewData.push(getDates(currentViewStartDate));
              currentViewStartDate = getAdjacentViewStartTime(-1);
              currentViewData.push(getDates(currentViewStartDate));
              $scope.views = currentViewData;
            } else {
              currentViewStartDate = vm.range.startTime;
              angular.copy(getDates(currentViewStartDate), $scope.views[currentViewIndex]);
              currentViewStartDate = getAdjacentViewStartTime(-1);
              toUpdateViewIndex = (currentViewIndex + 2) % 3;
              angular.copy(getDates(currentViewStartDate), $scope.views[toUpdateViewIndex]);
              currentViewStartDate = getAdjacentViewStartTime(1);
              toUpdateViewIndex = (currentViewIndex + 1) % 3;
              angular.copy(getDates(currentViewStartDate), $scope.views[toUpdateViewIndex]);
            }
          }
        }

        if (vm.queryMode === 'local') {
          if ($scope.eventSource && onDataLoaded) {
            onDataLoaded();
          }
        } else if (vm.queryMode === 'remote') {
          if ($scope.rangeChanged) {
            $scope.rangeChanged({
              startTime: vm.range.startTime,
              endTime: vm.range.endTime
            });
          }
        }
      }
    }

    return directive;

  }
})();
