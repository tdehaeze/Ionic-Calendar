(function() {
  'use strict';

  angular.module('directives')
    .directive('calendarPk', calendarPk);

  calendarPk.$inject = [];
  function calendarPk() {
    var directive = {};

    directive.restrict = 'E';
    directive.replace = true;

    directive.templateUrl = 'calendar-pk.html';

    directive.scope = {
      monthChanged: '&', // Called when changing the month
      timeSelected: '&', // Called when clicking on a date
      weekSelected: '&', // Called when clicking on a week
      eventSource:  '=', // All the events => two way data binding
    };

    directive.controllerAs = 'cc';
    directive.controller = CalendarController;
    CalendarController.$inject = ['$scope', '$attrs', '$interpolate', 'calendarConfig', '$timeout', '$filter'];
    function CalendarController($scope, $attrs, $interpolate, calendarConfig, $timeout, $filter) {
      var vm = this;

      $scope.$watch(function(){
        return $scope.eventSource;
      }, function (newVal, oldVal) {
        onDataLoaded();
      }, true);

      init();
      function init() {
        // Configuration attributes
        angular.forEach(['formatDay', 'formatDayHeader', 'formatMonthTitle', 'startingDayMonth'], function (key, index) {
          vm[key] = angular.isDefined($attrs[key]) ? $interpolate($attrs[key])($scope.$parent) : calendarConfig[key];
        });

        vm.currentViewIndex = 0;
        vm.currentDate = new Date();
        refreshView();
      }

      // Triggered on ng-click when clicking on a date
      // => Call the function timeSelected passed to the directive
      vm.dayClick = function (selectedTime){
        toogle(selectedTime);

        if ($scope.timeSelected) {
          $scope.timeSelected({selectedTime: selectedTime});
        }
      };

      // Called when clicking on a week
      // => toogle all the week depending if they were all selected
      vm.weekClick = function(date_index) {
        var all_selected = isAllWeekSelected(date_index),
            dates = vm.views[vm.currentViewIndex].dates;

        for (var i = 0; i < 7; i++) {
          if (all_selected) {
            toogle(dates[date_index + i].date);
          } else if (!all_selected && !dates[date_index + i].event) {
            toogle(dates[date_index + i].date);
          }
        }

        if ($scope.weekSelected) {
          var monday = dates[date_index].date;
          $scope.weekSelected({monday: monday});
        }
      };

      // First called when changing the month
      // => calculate the direction of the slide
      // => call refreshView
      vm.slideChanged = function ($index) {
        $timeout(function () {
          var currentViewIndex = vm.currentViewIndex,
              direction = 0;

          if (currentViewIndex === $index - 1 || ($index === 0 && currentViewIndex === 2)) {
            direction = 1;
          } else if (currentViewIndex === $index + 1 || ($index === 2 && currentViewIndex === 0)) {
            direction = -1;
          }

          vm.currentViewIndex = $index;

          vm.currentDate = getAdjacentCalendarDate(vm.currentDate, direction);

          refreshView(direction);
        }, 100);
      };






      // DONE
      function onDataLoaded() {
        var eventSource     = $scope.eventSource, // All the events
            timeZoneOffset  = -new Date().getTimezoneOffset(),
            utcStartTime    = new Date(vm.range.startTime.getTime() + timeZoneOffset * 60 * 1000), // StartTime of the month
            utcEndTime      = new Date(vm.range.endTime.getTime() + timeZoneOffset * 60 * 1000), // EndTime of the month
            dates           = vm.views[vm.currentViewIndex].dates; // All the dates of the current scope (42 dates)

        // Reset
        for (var r = 0; r < 42; r += 1) {
          dates[r].event = false;
        }

        // loop over all events
        // => If eventDate is in the scope of the current view
        //  => add the event to vm.views[vm.currentViewIndex].dates
        for (var i = 0; i < eventSource.length; i += 1) {
          var eventDate = new Date(eventSource[i]);

          if (utcStartTime <= eventDate && eventDate < utcEndTime){
            dates[Math.floor((eventDate - utcStartTime) / 86400000)].event = true;
          }
        }
      }

      // DONE
      // From one time, get the corresponding index of the eventSource array
      // Used to know if there is a Event at the same date
      function getEventIndex (time){
        var j = -1,
            eventSource = $scope.eventSource;

        for (var i = 0; i < eventSource.length; i++) {
          if (eventSource[i].getDate() === time.getDate() && eventSource[i].getMonth() === time.getMonth() && eventSource[i].getFullYear() === time.getFullYear()){
              j = i;
              break;
          }
        }

        return j;
      }

      // DONE
      // Used to toogle one date
      // TODO => should delete ALL the event for the date => loop ?
      function toogle (selectedTime){
        var eventSource = $scope.eventSource,
            index = getEventIndex(selectedTime);

        if (index > -1) {
          eventSource.splice(index, 1);
        } else {
          eventSource.push(selectedTime);
        }
      }

      // DONE
      // Used to get if all the week is selected
      function isAllWeekSelected (date_index){
        var dates = vm.views[vm.currentViewIndex].dates,
            all_selected = true;

        for (var i = 0; i < 7; i++) {
          if (getEventIndex(dates[date_index + i].date) === -1) {
            all_selected = false;
            break;
          }
        }

        return all_selected;
      }

      // Used to get the "AdjacentCalendarDate"
      // => this is the same day as the currentCalendarDate but shifted from one month depending of the direction
      // => from the direction, add/substract one month to currentCalendarDate
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


      // TODO => understand
      // Called after changing the month
      // direction -1 (gauche), +1(droite)
      function refreshView(direction) {
        vm.range = getRange(vm.currentDate);

        refreshMonth();

        populateAdjacentViews();


        if ($scope.eventSource) {
          onDataLoaded();
        }

        // From one date
        // => get the startDate and endDate of new view corresponding to the date
        function getRange(date) {
          var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1),
              difference = vm.startingDayMonth - firstDayOfMonth.getDay(), // vm.startingDayMonth = 1 (Monday)  .getDay() = 0 (SUN) 1 (MON) 2 (TSU) ...
              numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference, // number of days to display from previous month
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

        // Used to refresh the month
        function refreshMonth(){
          var currentViewStartDate = new Date(vm.range.startTime);

          currentViewStartDate.setDate(currentViewStartDate.getDate() + 10);

          // $scope.currentMonth.date = currentViewStartDate;
          // $scope.currentMonth.display = $filter('date')(currentViewStartDate, vm.formatMonthTitle);

          if ($scope.monthChanged) {
            $scope.monthChanged({
              startTime: vm.range.startTime,
              endTime: vm.range.endTime,
              display: $filter('date')(currentViewStartDate, vm.formatMonthTitle)
            });
          }
        }

        function populateAdjacentViews() {
          var currentViewStartDate,
              currentViewData,
              toUpdateViewIndex,
              currentViewIndex = vm.currentViewIndex;

          if (direction === 1) { // next month
            currentViewStartDate = getAdjacentViewStartTime(direction);
            toUpdateViewIndex = (currentViewIndex + 1) % 3;
            angular.copy(getDates(currentViewStartDate), vm.views[toUpdateViewIndex]);
          } else if (direction === -1) { // previous month
            currentViewStartDate = getAdjacentViewStartTime(direction);
            toUpdateViewIndex = (currentViewIndex + 2) % 3;
            angular.copy(getDates(currentViewStartDate), vm.views[toUpdateViewIndex]);
          } else {
            if (!vm.views) {
              currentViewData = [];
              currentViewStartDate = vm.range.startTime;
              currentViewData.push(getDates(currentViewStartDate));
              currentViewStartDate = getAdjacentViewStartTime(1);
              currentViewData.push(getDates(currentViewStartDate));
              currentViewStartDate = getAdjacentViewStartTime(-1);
              currentViewData.push(getDates(currentViewStartDate));
              vm.views = currentViewData;
            } else {
              currentViewStartDate = vm.range.startTime;
              angular.copy(getDates(currentViewStartDate), vm.views[currentViewIndex]);
              currentViewStartDate = getAdjacentViewStartTime(-1);
              toUpdateViewIndex = (currentViewIndex + 2) % 3;
              angular.copy(getDates(currentViewStartDate), vm.views[toUpdateViewIndex]);
              currentViewStartDate = getAdjacentViewStartTime(1);
              toUpdateViewIndex = (currentViewIndex + 1) % 3;
              angular.copy(getDates(currentViewStartDate), vm.views[toUpdateViewIndex]);
            }
          }


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

          // Used to get the startTime of the view corresponding to the direction and the currentDate
          function getAdjacentViewStartTime(direction) {
            var adjacentCalendarDate = getAdjacentCalendarDate(vm.currentDate, direction);
            return getRange(adjacentCalendarDate).startTime;
          }

          // function getAdjacentViewStartTime(direction) {
          //   // Used to get the "AdjacentCalendarDate"
          //   // => this is the same day as the currentCalendarDate but shifted from one month depending of the direction
          //   // => from the direction, add/substract one month to currentCalendarDate
          //   // => TODO : should delete this function => no more currentCalendarDate/selectedDate
          //   var calculateCalendarDate = new Date(vm.currentDate),
          //       year = calculateCalendarDate.getFullYear(),
          //       month = calculateCalendarDate.getMonth() + direction,
          //       date = calculateCalendarDate.getDate(),
          //       firstDayInNextMonth;

          //   calculateCalendarDate.setFullYear(year, month, date);

          //   firstDayInNextMonth = new Date(year, month + 1, 1);
          //   if (firstDayInNextMonth.getTime() <= calculateCalendarDate.getTime()) {
          //     calculateCalendarDate = new Date(firstDayInNextMonth - 24 * 60 * 60 * 1000);
          //   }

          //   return getRange(calculateCalendarDate).startTime;
          // }
        }
      }
    }

    return directive;

  }
})();
