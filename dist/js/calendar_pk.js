(function() {
  'use strict';

  angular.module('directives', []);
  angular.module('constants', []);
  angular.module('filters', []);

  var app = angular.module('calendar_pk', ['directives', 'constants', 'templates', 'filters']);

})();

(function() {
  'use strict';

  angular.module('constants')
  .constant('calendarConfig', {
    formatDay:        'dd',         //
    formatDayHeader:  'EEE',        //
    formatMonthTitle: 'MMMM yyyy',  //
    eventSource:      null,         //
    queryMode:        'local',      //
    startingDayMonth: 1,            //
  });

})();

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
      monthTitle:    '=', //
    };

    directive.require = ['calendar', '?^ngModel'];

    directive.controllerAs = 'cc';
    directive.controller = CalendarController;
    CalendarController.$inject = ['$scope', '$attrs', '$interpolate', 'calendarConfig', '$timeout', 'dateFilter'];
    function CalendarController($scope, $attrs, $interpolate, calendarConfig, $timeout, dateFilter) {
      var vm = this;

      // TODO
      $scope.$watch(function(){
        return $scope.eventSource;
      }, function (newVal, oldVal) {
        onDataLoaded();
      }, true);

      init();
      function init() {
        // Configuration attributes
        angular.forEach(['formatDay', 'formatDayHeader', 'formatMonthTitle', 'queryMode', 'startingDayMonth'], function (key, index) {
          vm[key] = angular.isDefined($attrs[key]) ? $interpolate($attrs[key])($scope.$parent) : calendarConfig[key];
        });

        vm.currentViewIndex = 0;
        vm.currentDate = new Date();
        refreshView();
      }

      // DONE
      // Triggered on ng-click when clicking on a date
      // => Call the function timeSelected passed to the directive
      vm.dayClick = function (selectedTime){
        toogle(selectedTime);

        if ($scope.views && $scope.timeSelected) {
          $scope.timeSelected({selectedTime: selectedTime});
        }
      };

      // DONE
      // Called when clicking on a week
      // => toogle all the week depending if they were all selected
      vm.weekClick = function(date_index) {
        var all_selected = isAllWeekSelected(date_index),
            dates = $scope.views[vm.currentViewIndex].dates;

        for (var i = 0; i < 7; i++) {
          if (all_selected) {
            toogle(dates[date_index + i].date);
          } else if (!all_selected && dates[date_index + i].events.length === 0) {
            toogle(dates[date_index + i].date);
          }
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
            dates           = $scope.views[vm.currentViewIndex].dates; // All the dates of the current scope (42 dates)

        // Reset
        for (var r = 0; r < 42; r += 1) {
          dates[r].events = [];
        }

        // loop over all events
        // => If eventDate is in the scope of the current view
        //  => add the event to $scope.views[vm.currentViewIndex].dates
        for (var i = 0; i < eventSource.length; i += 1) {
          var event = eventSource[i],
              eventDate = new Date(event.startTime);

          if (utcStartTime <= eventDate && eventDate <= utcEndTime){
            dates[Math.floor((eventDate - utcStartTime) / 86400000)].events = [event];
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
          var eventTime = eventSource[i].startTime;
          if (eventTime.getDate() === time.getDate() && eventTime.getMonth() === time.getMonth() && eventTime.getFullYear() === time.getFullYear()){
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
        var eventSource = $scope.eventSource;
        var event = {
          startTime: selectedTime
        };
        var index = getEventIndex(selectedTime);

        if (index > -1) {
          eventSource.splice(index, 1);
        } else {
          eventSource.push(event);
        }
      }

      // DONE
      // Used to get if all the week is selected
      function isAllWeekSelected (date_index){
        var dates = $scope.views[vm.currentViewIndex].dates,
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

        if (vm.queryMode === 'local') {
          if ($scope.eventSource) {
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

        // Used to refresh the monthTitle
        function refreshMonth(){
          var currentViewStartDate = new Date(vm.range.startTime);

          currentViewStartDate.setDate(currentViewStartDate.getDate() + 10);

          $scope.monthTitle.lapin = dateFilter(currentViewStartDate, vm.formatMonthTitle); // TODO => change lapin
        }

        function populateAdjacentViews() {
          var currentViewStartDate,
              currentViewData,
              toUpdateViewIndex,
              currentViewIndex = vm.currentViewIndex;

          if (direction === 1) { // next month
            currentViewStartDate = getAdjacentViewStartTime(direction);
            toUpdateViewIndex = (currentViewIndex + 1) % 3;
            angular.copy(getDates(currentViewStartDate), $scope.views[toUpdateViewIndex]);
          } else if (direction === -1) { // previous month
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

(function() {
  angular.module('filters')
    .filter('sameMonth', sameMonth);

  sameMonth.$inject = [];

  function sameMonth() {
    return function (date, currentDate) {
      date = new Date(+date);
      current = new Date(+currentDate);
      return date.getMonth() === current.getMonth();
    };

  }
})();

(function() {
  angular.module('filters')
    .filter('todayFilter', todayFilter);

  todayFilter.$inject = [];

  function todayFilter() {
    return function (date) {
      date = new Date(+date);
      var today = new Date();

      return (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear());
    };

  }
})();

(function() {
  angular.module('filters')
    .filter('weekNumber', weekNumber);

  weekNumber.$inject = [];

  function weekNumber() {
    return function (date) {
      date = new Date(+date);
      date.setHours(0, 0, 0, 0);
      // Thursday in current week decides the year.
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      // January 4 is always in week 1.
      var week1 = new Date(date.getFullYear(), 0, 4);
      // Adjust to Thursday in week 1 and count number of weeks from date to week1.
      return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };

  }
})();

(function() {
'use strict';

angular.module('templates', []).run(['$templateCache', function($templateCache) {
  $templateCache.put("calendar.html",
    "<div style=\"height: 100%;\">\n" +
    "    <ion-slide-box  on-slide-changed=\"cc.slideChanged($index)\"\n" +
    "                    does-continue=\"true\"\n" +
    "                    show-pager=\"false\"\n" +
    "                    delegate-handle=\"monthview-slide\"\n" +
    "                    style=\"height: auto;\">\n" +
    "        <ion-slide ng-repeat=\"view in views track by $index\">\n" +
    "            <table ng-if=\"$index === cc.currentViewIndex\" class=\"table-bordered monthview-datetable\">\n" +
    "                <thead>\n" +
    "                    <tr>\n" +
    "                        <th></th>\n" +
    "                        <th ng-repeat=\"day in view.dates.slice(0,7) track by day.date\">\n" +
    "                            <small>{{::day.date | date: cc.formatDayHeader | uppercase}}</small>\n" +
    "                        </th>\n" +
    "                    </tr>\n" +
    "                </thead>\n" +
    "                <tbody>\n" +
    "                    <tr ng-repeat=\"i in [0,1,2,3,4,5]\">\n" +
    "                        <td ng-click=\"cc.weekClick(7*i)\">SEM<br>{{view.dates[7*i].date | weekNumber}}</td>\n" +
    "                        <td ng-repeat=\"j in [0,1,2,3,4,5,6]\"\n" +
    "                            ng-init=\"date = view.dates[7*i+j]\"\n" +
    "                            ng-click=\"cc.dayClick(date.date)\"\n" +
    "                            ng-class=\"{'monthview-secondary': date.events.length > 0 && !(date.date | sameMonth : cc.currentDate), 'monthview-primary': date.events.length > 0 && (date.date | sameMonth : cc.currentDate), 'monthview-current': (date.date | todayFilter), 'text-muted': !(date.date | sameMonth : cc.currentDate)}\">{{date.date | date : cc.formatDay}}</td>\n" +
    "                    </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "            <table ng-if=\"$index !== cc.currentViewIndex\" class=\"table-bordered monthview-datetable\">\n" +
    "                <thead>\n" +
    "                    <tr class=\"text-center\">\n" +
    "                        <th></th>\n" +
    "                        <th ng-repeat=\"day in view.dates.slice(0,7) track by day.date\">\n" +
    "                            <small>{{::day.date | date: cc.formatDayHeader | uppercase}}</small>\n" +
    "                        </th>\n" +
    "                    </tr>\n" +
    "                </thead>\n" +
    "                <tbody>\n" +
    "                    <tr ng-repeat=\"i in [0,1,2,3,4,5]\">\n" +
    "                        <td ng-click=\"\">SEM<br>{{view.dates[7*i].date | weekNumber}}</td>\n" +
    "                        <td ng-repeat=\"j in [0,1,2,3,4,5,6]\"\n" +
    "                            ng-init=\"date = view.dates[7*i+j]\"\n" +
    "                            ng-class=\"{'monthview-secondary': date.events.length > 0 && !(date.date | sameMonth : cc.currentDate), 'monthview-primary': date.events.length > 0 && (date.date | sameMonth : cc.currentDate), 'monthview-current': (date.date | todayFilter), 'text-muted': !(date.date | sameMonth : cc.currentDate)}\">{{date.date | date : cc.formatDay}}</td>\n" +
    "                    </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </ion-slide>\n" +
    "    </ion-slide-box>\n" +
    "</div>\n" +
    "");
}]);
}());
