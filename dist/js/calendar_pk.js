(function() {
  'use strict';

  angular.module('directives', []);
  angular.module('constants', []);

  var app = angular.module('calendar_pk', ['directives', 'constants', 'templates']);

})();

(function() {
  'use strict';

  angular.module('constants')
  .constant('calendarConfig', {
    formatDay: 'dd',
    formatDayHeader: 'EEE',
    formatDayTitle: 'MMMM dd, yyyy',
    formatWeekTitle: 'MMMM yyyy, Week w',
    formatMonthTitle: 'MMMM yyyy',
    formatWeekViewDayHeader: 'EEE d',
    formatHourColumn: 'ha',
    calendarMode: 'month',
    showEventDetail: true,
    startingDayMonth: 0,
    startingDayWeek: 0,
    allDayLabel: 'all day',
    noEventsLabel: 'No Events',
    eventSource: null,
    queryMode: 'local',
    step: 60
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
      calendarMode: '=',
      rangeChanged: '&',
      eventSelected: '&',
      timeSelected: '&',
      titleChanged: '&'
    };

    directive.require = ['calendar', '?^ngModel'];

    directive.link = calendarLink;
    calendarLink.$inject = [];
    function calendarLink(scope, element, attrs, ctrls) {
      var calendarCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];

      if (ngModelCtrl) {
        calendarCtrl.init(ngModelCtrl);
      }

      scope.$on('changeDate', function (event, direction) {
        calendarCtrl.slideView(direction);
      });

      scope.$on('eventSourceChanged', function (event, value) {
        calendarCtrl.onEventSourceChanged(value);
      });
    }


    directive.controller = CalendarController;
    CalendarController.$inject = ['$scope', '$attrs', '$parse', '$interpolate', 'calendarConfig', '$timeout', '$ionicSlideBoxDelegate'];
    function CalendarController($scope, $attrs, $parse, $interpolate, calendarConfig, $timeout, $ionicSlideBoxDelegate) {
      var vm = this;

      var ngModelCtrl = {$setViewValue: angular.noop}; // nullModelCtrl;

      // Configuration attributes
      angular.forEach(['formatDay', 'formatDayHeader', 'formatDayTitle', 'formatWeekTitle', 'formatMonthTitle', 'formatWeekViewDayHeader', 'formatHourColumn',
        'allDayLabel', 'noEventsLabel', 'showEventDetail', 'eventSource', 'queryMode', 'step', 'startingDayMonth', 'startingDayWeek'], function (key, index) {
        vm[key] = angular.isDefined($attrs[key]) ? (index < 9 ? $interpolate($attrs[key])($scope.$parent) : $scope.$parent.$eval($attrs[key])) : calendarConfig[key];
      });

      vm.hourParts = 1;
      if (vm.step === 60 || vm.step === 30 || vm.step === 15) {
        vm.hourParts = Math.floor(60 / vm.step);
      } else {
        throw new Error('Invalid step parameter: ' + vm.step);
      }

      $scope.$parent.$watch($attrs.eventSource, function (value) {
        vm.onEventSourceChanged(value);
      });

      $scope.calendarMode = $scope.calendarMode || calendarConfig.calendarMode;
      if (angular.isDefined($attrs.initDate)) {
        vm.currentCalendarDate = $scope.$parent.$eval($attrs.initDate);
      }
      if (!vm.currentCalendarDate) {
        vm.currentCalendarDate = new Date();
        if ($attrs.ngModel && !$scope.$parent.$eval($attrs.ngModel)) {
          $parse($attrs.ngModel).assign($scope.$parent, vm.currentCalendarDate);
        }
      }

      function overlap(event1, event2) {
        var earlyEvent = event1,
          lateEvent = event2;
        if (event1.startIndex > event2.startIndex || (event1.startIndex === event2.startIndex && event1.startOffset > event2.startOffset)) {
          earlyEvent = event2;
          lateEvent = event1;
        }

        if (earlyEvent.endIndex <= lateEvent.startIndex) {
          return false;
        } else {
          return !(earlyEvent.endIndex - lateEvent.startIndex === 1 && earlyEvent.endOffset + lateEvent.startOffset > vm.hourParts);
        }
      }

      function calculatePosition(events) {
        var i,
          j,
          len = events.length,
          maxColumn = 0,
          col,
          isForbidden = new Array(len);

        for (i = 0; i < len; i += 1) {
          for (col = 0; col < maxColumn; col += 1) {
            isForbidden[col] = false;
          }
          for (j = 0; j < i; j += 1) {
            if (overlap(events[i], events[j])) {
              isForbidden[events[j].position] = true;
            }
          }
          for (col = 0; col < maxColumn; col += 1) {
            if (!isForbidden[col]) {
              break;
            }
          }
          if (col < maxColumn) {
            events[i].position = col;
          } else {
            events[i].position = maxColumn++;
          }
        }
      }

      function calculateWidth(orderedEvents) {
        var cells = new Array(24),
          event,
          index,
          i,
          j,
          len,
          eventCountInCell,
          currentEventInCell;

        //sort by position in descending order, the right most columns should be calculated first
        orderedEvents.sort(function (eventA, eventB) {
          return eventB.position - eventA.position;
        });
        for (i = 0; i < 24; i += 1) {
          cells[i] = {
            calculated: false,
            events: []
          };
        }
        len = orderedEvents.length;
        for (i = 0; i < len; i += 1) {
          event = orderedEvents[i];
          index = event.startIndex;
          while (index < event.endIndex) {
            cells[index].events.push(event);
            index += 1;
          }
        }

        i = 0;
        while (i < len) {
          event = orderedEvents[i];
          if (!event.overlapNumber) {
            var overlapNumber = event.position + 1;
            event.overlapNumber = overlapNumber;
            var eventQueue = [event];
            while ((event = eventQueue.shift())) {
              index = event.startIndex;
              while (index < event.endIndex) {
                if (!cells[index].calculated) {
                  cells[index].calculated = true;
                  if (cells[index].events) {
                    eventCountInCell = cells[index].events.length;
                    for (j = 0; j < eventCountInCell; j += 1) {
                      currentEventInCell = cells[index].events[j];
                      if (!currentEventInCell.overlapNumber) {
                        currentEventInCell.overlapNumber = overlapNumber;
                        eventQueue.push(currentEventInCell);
                      }
                    }
                  }
                }
                index += 1;
              }
            }
          }
          i += 1;
        }
      }

      function getAdjacentCalendarDate(currentCalendarDate, direction) {
        var step = vm.mode.step,
          calculateCalendarDate = new Date(currentCalendarDate),
          year = calculateCalendarDate.getFullYear() + direction * (step.years || 0),
          month = calculateCalendarDate.getMonth() + direction * (step.months || 0),
          date = calculateCalendarDate.getDate() + direction * (step.days || 0),
          firstDayInNextMonth;

        calculateCalendarDate.setFullYear(year, month, date);
        if ($scope.calendarMode === 'month') {
          firstDayInNextMonth = new Date(year, month + 1, 1);
          if (firstDayInNextMonth.getTime() <= calculateCalendarDate.getTime()) {
            calculateCalendarDate = new Date(firstDayInNextMonth - 24 * 60 * 60 * 1000);
          }
        }
        return calculateCalendarDate;
      }

      vm.init = function (ngModelCtrl_) {
        ngModelCtrl = ngModelCtrl_;

        ngModelCtrl.$render = function () {
          vm.render();
        };
      };

      vm.render = function () {
        if (ngModelCtrl.$modelValue) {
          var date = new Date(ngModelCtrl.$modelValue),
            isValid = !isNaN(date);

          if (isValid) {
            this.currentCalendarDate = date;
          } else {
            console.log('"ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
          }
          ngModelCtrl.$setValidity('date', isValid);
        }
        this.refreshView();
      };

      vm.refreshView = function () {
        if (this.mode) {
          this.range = this._getRange(this.currentCalendarDate);
          if ($scope.titleChanged) {
            $scope.titleChanged({title: vm._getTitle()});
          }
          this._refreshView();
          this.rangeChanged();
        }
      };

      // Split array into smaller arrays
      vm.split = function (arr, size) {
        var arrays = [];
        while (arr.length > 0) {
          arrays.push(arr.splice(0, size));
        }
        return arrays;
      };

      vm.onEventSourceChanged = function (value) {
        vm.eventSource = value;
        if (vm._onDataLoaded) {
          vm._onDataLoaded();
        }
      };

      vm.getAdjacentViewStartTime = function (direction) {
        var adjacentCalendarDate = getAdjacentCalendarDate(vm.currentCalendarDate, direction);
        return vm._getRange(adjacentCalendarDate).startTime;
      };

      vm.move = function (direction) {
        vm.direction = direction;
        if (vm.moveOnSelected) {
          vm.moveOnSelected = false;
        } else {
          vm.currentCalendarDate = getAdjacentCalendarDate(vm.currentCalendarDate, direction);
        }
        ngModelCtrl.$setViewValue(vm.currentCalendarDate);
        vm.refreshView();
        vm.direction = 0;
      };

      vm.rangeChanged = function () {
        if (vm.queryMode === 'local') {
          if (vm.eventSource && vm._onDataLoaded) {
            vm._onDataLoaded();
          }
        } else if (vm.queryMode === 'remote') {
          if ($scope.rangeChanged) {
            $scope.rangeChanged({
              startTime: this.range.startTime,
              endTime: this.range.endTime
            });
          }
        }
      };

      vm.registerSlideChanged = function (scope) {
        scope.currentViewIndex = 0;
        scope.slideChanged = function ($index) {
          $timeout(function () {
            var currentViewIndex = scope.currentViewIndex,
              direction = 0;
            if ($index - currentViewIndex === 1 || ($index === 0 && currentViewIndex === 2)) {
              direction = 1;
            } else if (currentViewIndex - $index === 1 || ($index === 2 && currentViewIndex === 0)) {
              direction = -1;
            }
            currentViewIndex = $index;
            scope.currentViewIndex = currentViewIndex;
            vm.move(direction);
            scope.$digest();
          }, 200);
        };
      };

      vm.populateAdjacentViews = function (scope) {
        var currentViewStartDate,
          currentViewData,
          toUpdateViewIndex,
          currentViewIndex = scope.currentViewIndex,
          getViewData = this._getViewData;

        if (vm.direction === 1) {
          currentViewStartDate = vm.getAdjacentViewStartTime(1);
          toUpdateViewIndex = (currentViewIndex + 1) % 3;
          angular.copy(getViewData(currentViewStartDate), scope.views[toUpdateViewIndex]);
        } else if (vm.direction === -1) {
          currentViewStartDate = vm.getAdjacentViewStartTime(-1);
          toUpdateViewIndex = (currentViewIndex + 2) % 3;
          angular.copy(getViewData(currentViewStartDate), scope.views[toUpdateViewIndex]);
        } else {
          if (!scope.views) {
            currentViewData = [];
            currentViewStartDate = vm.range.startTime;
            currentViewData.push(getViewData(currentViewStartDate));
            currentViewStartDate = vm.getAdjacentViewStartTime(1);
            currentViewData.push(getViewData(currentViewStartDate));
            currentViewStartDate = vm.getAdjacentViewStartTime(-1);
            currentViewData.push(getViewData(currentViewStartDate));
            scope.views = currentViewData;
          } else {
            currentViewStartDate = vm.range.startTime;
            angular.copy(getViewData(currentViewStartDate), scope.views[currentViewIndex]);
            currentViewStartDate = vm.getAdjacentViewStartTime(-1);
            toUpdateViewIndex = (currentViewIndex + 2) % 3;
            angular.copy(getViewData(currentViewStartDate), scope.views[toUpdateViewIndex]);
            currentViewStartDate = vm.getAdjacentViewStartTime(1);
            toUpdateViewIndex = (currentViewIndex + 1) % 3;
            angular.copy(getViewData(currentViewStartDate), scope.views[toUpdateViewIndex]);
          }
        }
      };

      vm.placeEvents = function (orderedEvents) {
        calculatePosition(orderedEvents);
        calculateWidth(orderedEvents);
      };

      vm.placeAllDayEvents = function (orderedEvents) {
        calculatePosition(orderedEvents);
      };

      vm.slideView = function (direction) {
        var slideHandle = $ionicSlideBoxDelegate.$getByHandle($scope.calendarMode + 'view-slide');

        if (slideHandle) {
          if (direction === 1) {
            slideHandle.next();
          } else if (direction === -1) {
            slideHandle.previous();
          }
        }
      };
    }

    return directive;

  }
})();

(function() {
  'use strict';

  angular.module('directives')
    .directive('monthView', monthView);

  monthView.$inject = ['dateFilter'];
  function monthView(dateFilter) {
    var directive = {};

    directive.restrict = 'E';
    directive.replace = true;
    directive.templateUrl = 'month-view.html';
    directive.require = ['^calendar', '?^ngModel'];

    directive.link = monthViewLink;

    monthViewLink.$inject = [];
    function monthViewLink(scope, element, attrs, ctrls) {

      var ctrl = ctrls[0],
        ngModelCtrl = ctrls[1];
      scope.showEventDetail = ctrl.showEventDetail;
      scope.formatDayHeader = ctrl.formatDayHeader;

      ctrl.mode = {
        step: {months: 1}
      };

      scope.noEventsLabel = ctrl.noEventsLabel;

      function getDates(startDate, n) {
        var dates = new Array(n), current = new Date(startDate), i = 0;
        current.setHours(12); // Prevent repeated dates because of timezone bug
        while (i < n) {
          dates[i++] = new Date(current);
          current.setDate(current.getDate() + 1);
        }
        return dates;
      }

      function createDateObject(date, format) {
        return {
          date: date,
          label: dateFilter(date, format)
        };
      }

      function updateCurrentView(currentViewStartDate, view) {
        var currentCalendarDate = ctrl.currentCalendarDate,
          today = new Date(),
          oneDay = 86400000,
          r,
          selectedDayDifference = Math.floor((currentCalendarDate.getTime() - currentViewStartDate.getTime()) / oneDay),
          currentDayDifference = Math.floor((today.getTime() - currentViewStartDate.getTime()) / oneDay);

        for (r = 0; r < 42; r += 1) {
          view.dates[r].selected = false;
        }

        if (selectedDayDifference >= 0 && selectedDayDifference < 42) {
          view.dates[selectedDayDifference].selected = true;
          scope.selectedDate = view.dates[selectedDayDifference];
        } else {
          scope.selectedDate = {
            events: []
          };
        }

        if (currentDayDifference >= 0 && currentDayDifference < 42) {
          view.dates[currentDayDifference].current = true;
        }
      }

      function compareEvent(event1, event2) {
        if (event1.allDay) {
          return 1;
        } else if (event2.allDay) {
          return -1;
        } else {
          return (event1.startTime.getTime() - event2.startTime.getTime());
        }
      }

      scope.select = function (selectedDate) {
        var views = scope.views,
          dates,
          r;
        if (views) {
          dates = views[scope.currentViewIndex].dates;
          var currentCalendarDate = ctrl.currentCalendarDate;
          var currentMonth = currentCalendarDate.getMonth();
          var currentYear = currentCalendarDate.getFullYear();
          var selectedMonth = selectedDate.getMonth();
          var selectedYear = selectedDate.getFullYear();
          var direction = 0;
          if (currentYear === selectedYear) {
            if (currentMonth !== selectedMonth) {
              direction = currentMonth < selectedMonth ? 1 : -1;
            }
          } else {
            direction = currentYear < selectedYear ? 1 : -1;
          }

          ctrl.currentCalendarDate = selectedDate;
          if (direction === 0) {
            ctrl.currentCalendarDate = selectedDate;
            if (ngModelCtrl) {
              ngModelCtrl.$setViewValue(selectedDate);
            }
            var currentViewStartDate = ctrl.range.startTime,
              oneDay = 86400000,
              selectedDayDifference = Math.floor((selectedDate.getTime() - currentViewStartDate.getTime()) / oneDay);
            for (r = 0; r < 42; r += 1) {
              dates[r].selected = false;
            }

            if (selectedDayDifference >= 0 && selectedDayDifference < 42) {
              dates[selectedDayDifference].selected = true;
              scope.selectedDate = dates[selectedDayDifference];
            }
          } else {
            ctrl.moveOnSelected = true;
            ctrl.slideView(direction);
          }

          if (scope.timeSelected) {
            scope.timeSelected({selectedTime: selectedDate});
          }
        }
      };

      scope.getHighlightClass = function (date) {
        var className = '';

        if (date.hasEvent) {
          if (date.secondary) {
            className = 'monthview-secondary-with-event';
          } else {
            className = 'monthview-primary-with-event';
          }
        }

        if (date.selected) {
          if (className) {
            className += ' ';
          }
          className += 'monthview-selected';
        }

        if (date.current) {
          if (className) {
            className += ' ';
          }
          className += 'monthview-current';
        }

        if (date.secondary) {
          if (className) {
            className += ' ';
          }
          className += 'text-muted';
        }
        return className;
      };

      ctrl._getTitle = function () {
        var currentViewStartDate = ctrl.range.startTime,
          date = currentViewStartDate.getDate(),
          month = (currentViewStartDate.getMonth() + (date !== 1 ? 1 : 0)) % 12,
          year = currentViewStartDate.getFullYear() + (date !== 1 && month === 0 ? 1 : 0),
          headerDate = new Date(year, month, 1);
        return dateFilter(headerDate, ctrl.formatMonthTitle);
      };

      ctrl._getViewData = function (startTime) {
        var startDate = startTime,
          date = startDate.getDate(),
          month = (startDate.getMonth() + (date !== 1 ? 1 : 0)) % 12;

        var days = getDates(startDate, 42);
        for (var i = 0; i < 42; i++) {
          days[i] = angular.extend(createDateObject(days[i], ctrl.formatDay), {
            secondary: days[i].getMonth() !== month
          });
        }

        return {
          dates: days
        };
      };

      ctrl._refreshView = function () {
        ctrl.populateAdjacentViews(scope);
        updateCurrentView(ctrl.range.startTime, scope.views[scope.currentViewIndex]);
      };

      ctrl._onDataLoaded = function () {
        var eventSource = ctrl.eventSource,
          len = eventSource ? eventSource.length : 0,
          startTime = ctrl.range.startTime,
          endTime = ctrl.range.endTime,
          timeZoneOffset = -new Date().getTimezoneOffset(),
          utcStartTime = new Date(startTime.getTime() + timeZoneOffset * 60 * 1000),
          utcEndTime = new Date(endTime.getTime() + timeZoneOffset * 60 * 1000),
          currentViewIndex = scope.currentViewIndex,
          dates = scope.views[currentViewIndex].dates,
          oneDay = 86400000,
          eps = 0.001;

        for (var r = 0; r < 42; r += 1) {
          if (dates[r].hasEvent) {
            dates[r].hasEvent = false;
            dates[r].events = [];
          }
        }

        for (var i = 0; i < len; i += 1) {
          var event = eventSource[i];
          var eventStartTime = new Date(event.startTime);
          var eventEndTime = new Date(event.endTime);
          var st;
          var et;

          if (event.allDay) {
            if (eventEndTime <= utcStartTime || eventStartTime >= utcEndTime) {
              continue;
            } else {
              st = utcStartTime;
              et = utcEndTime;
            }
          } else {
            if (eventEndTime <= startTime || eventStartTime >= endTime) {
              continue;
            } else {
              st = startTime;
              et = endTime;
            }
          }

          var timeDifferenceStart;
          if (eventStartTime <= st) {
            timeDifferenceStart = 0;
          } else {
            timeDifferenceStart = (eventStartTime - st) / oneDay;
          }

          var timeDifferenceEnd;
          if (eventEndTime >= et) {
            timeDifferenceEnd = (et - st) / oneDay;
          } else {
            timeDifferenceEnd = (eventEndTime - st) / oneDay;
          }

          var index = Math.floor(timeDifferenceStart);
          var eventSet;
          while (index < timeDifferenceEnd - eps) {
            dates[index].hasEvent = true;
            eventSet = dates[index].events;
            if (eventSet) {
              eventSet.push(event);
            } else {
              eventSet = [];
              eventSet.push(event);
              dates[index].events = eventSet;
            }
            index += 1;
          }
        }

        for (r = 0; r < 42; r += 1) {
          if (dates[r].hasEvent) {
            dates[r].events.sort(compareEvent);
          }
        }

        var findSelected = false;
        for (r = 0; r < 42; r += 1) {
          if (dates[r].selected) {
            scope.selectedDate = dates[r];
            findSelected = true;
            break;
          }
          if (findSelected) {
            break;
          }
        }
      };

      ctrl._getRange = function getRange(currentDate) {
        var year = currentDate.getFullYear(),
          month = currentDate.getMonth(),
          firstDayOfMonth = new Date(year, month, 1),
          difference = ctrl.startingDayMonth - firstDayOfMonth.getDay(),
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
      };

      ctrl.registerSlideChanged(scope);

      ctrl.refreshView();
    }

    return directive;

  }
})();

(function() {
'use strict';

angular.module('templates', []).run(['$templateCache', function($templateCache) {
  $templateCache.put("calendar.html",
    "<div class=\"calendar-container\">\n" +
    "  <month-view></month-view>\n" +
    "</div>\n" +
    "");
  $templateCache.put("month-view.html",
    "<div>\n" +
    "    <ion-slide-box class=\"monthview-slide\" on-slide-changed=\"slideChanged($index)\" does-continue=\"true\"\n" +
    "                   show-pager=\"false\" delegate-handle=\"monthview-slide\">\n" +
    "        <ion-slide ng-repeat=\"view in views track by $index\">\n" +
    "            <table ng-if=\"$index===currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\n" +
    "                <thead>\n" +
    "                <tr>\n" +
    "                    <th ng-repeat=\"day in view.dates.slice(0,7) track by day.date\">\n" +
    "                        <small>{{::day.date | date: formatDayHeader}}</small>\n" +
    "                    </th>\n" +
    "                </tr>\n" +
    "                </thead>\n" +
    "                <tbody>\n" +
    "                <tr>\n" +
    "                    <td ng-click=\"select(view.dates[0].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[0])\">{{view.dates[0].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[1].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[1])\">{{view.dates[1].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[2].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[2])\">{{view.dates[2].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[3].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[3])\">{{view.dates[3].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[4].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[4])\">{{view.dates[4].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[5].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[5])\">{{view.dates[5].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[6].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[6])\">{{view.dates[6].label}}\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td ng-click=\"select(view.dates[7].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[7])\">{{view.dates[7].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[8].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[8])\">{{view.dates[8].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[9].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[9])\">{{view.dates[9].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[10].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[10])\">{{view.dates[10].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[11].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[11])\">{{view.dates[11].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[12].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[12])\">{{view.dates[12].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[13].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[13])\">{{view.dates[13].label}}\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td ng-click=\"select(view.dates[14].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[14])\">{{view.dates[14].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[15].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[15])\">{{view.dates[15].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[16].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[16])\">{{view.dates[16].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[17].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[17])\">{{view.dates[17].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[18].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[18])\">{{view.dates[18].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[19].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[19])\">{{view.dates[19].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[20].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[20])\">{{view.dates[20].label}}\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td ng-click=\"select(view.dates[21].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[21])\">{{view.dates[21].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[22].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[22])\">{{view.dates[22].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[23].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[23])\">{{view.dates[23].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[24].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[24])\">{{view.dates[24].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[25].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[25])\">{{view.dates[25].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[26].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[26])\">{{view.dates[26].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[27].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[27])\">{{view.dates[27].label}}\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td ng-click=\"select(view.dates[28].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[28])\">{{view.dates[28].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[29].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[29])\">{{view.dates[29].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[30].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[30])\">{{view.dates[30].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[31].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[31])\">{{view.dates[31].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[32].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[32])\">{{view.dates[32].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[33].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[33])\">{{view.dates[33].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[34].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[34])\">{{view.dates[34].label}}\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td ng-click=\"select(view.dates[35].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[35])\">{{view.dates[35].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[36].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[36])\">{{view.dates[36].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[37].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[37])\">{{view.dates[37].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[38].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[38])\">{{view.dates[38].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[39].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[39])\">{{view.dates[39].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[40].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[40])\">{{view.dates[40].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[41].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[41])\">{{view.dates[41].label}}\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "            <table ng-if=\"$index!==currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\n" +
    "                <thead>\n" +
    "                <tr class=\"text-center\">\n" +
    "                    <th ng-repeat=\"day in view.dates.slice(0,7) track by day.date\">\n" +
    "                        <small>{{::day.date | date: formatDayHeader}}</small>\n" +
    "                    </th>\n" +
    "                </tr>\n" +
    "                </thead>\n" +
    "                <tbody>\n" +
    "                <tr>\n" +
    "                    <td>{{view.dates[0].label}}</td>\n" +
    "                    <td>{{view.dates[1].label}}</td>\n" +
    "                    <td>{{view.dates[2].label}}</td>\n" +
    "                    <td>{{view.dates[3].label}}</td>\n" +
    "                    <td>{{view.dates[4].label}}</td>\n" +
    "                    <td>{{view.dates[5].label}}</td>\n" +
    "                    <td>{{view.dates[6].label}}</td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td>{{view.dates[7].label}}</td>\n" +
    "                    <td>{{view.dates[8].label}}</td>\n" +
    "                    <td>{{view.dates[9].label}}</td>\n" +
    "                    <td>{{view.dates[10].label}}</td>\n" +
    "                    <td>{{view.dates[11].label}}</td>\n" +
    "                    <td>{{view.dates[12].label}}</td>\n" +
    "                    <td>{{view.dates[13].label}}</td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td>{{view.dates[14].label}}</td>\n" +
    "                    <td>{{view.dates[15].label}}</td>\n" +
    "                    <td>{{view.dates[16].label}}</td>\n" +
    "                    <td>{{view.dates[17].label}}</td>\n" +
    "                    <td>{{view.dates[18].label}}</td>\n" +
    "                    <td>{{view.dates[19].label}}</td>\n" +
    "                    <td>{{view.dates[20].label}}</td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td>{{view.dates[21].label}}</td>\n" +
    "                    <td>{{view.dates[22].label}}</td>\n" +
    "                    <td>{{view.dates[23].label}}</td>\n" +
    "                    <td>{{view.dates[24].label}}</td>\n" +
    "                    <td>{{view.dates[25].label}}</td>\n" +
    "                    <td>{{view.dates[26].label}}</td>\n" +
    "                    <td>{{view.dates[27].label}}</td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td>{{view.dates[28].label}}</td>\n" +
    "                    <td>{{view.dates[29].label}}</td>\n" +
    "                    <td>{{view.dates[30].label}}</td>\n" +
    "                    <td>{{view.dates[31].label}}</td>\n" +
    "                    <td>{{view.dates[32].label}}</td>\n" +
    "                    <td>{{view.dates[33].label}}</td>\n" +
    "                    <td>{{view.dates[34].label}}</td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td>{{view.dates[35].label}}</td>\n" +
    "                    <td>{{view.dates[36].label}}</td>\n" +
    "                    <td>{{view.dates[37].label}}</td>\n" +
    "                    <td>{{view.dates[38].label}}</td>\n" +
    "                    <td>{{view.dates[39].label}}</td>\n" +
    "                    <td>{{view.dates[40].label}}</td>\n" +
    "                    <td>{{view.dates[41].label}}</td>\n" +
    "                </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </ion-slide>\n" +
    "    </ion-slide-box>\n" +
    "    <ion-content class=\"event-detail-container\" has-bouncing=\"false\" ng-show=\"showEventDetail\" overflow-scroll=\"false\">\n" +
    "        <table class=\"table table-bordered table-striped table-fixed event-detail-table\">\n" +
    "            <tr ng-repeat=\"event in selectedDate.events\" ng-click=\"eventSelected({event:event})\">\n" +
    "                <td ng-if=\"!event.allDay\" class=\"monthview-eventdetail-timecolumn\">{{::event.startTime|date: 'HH:mm'}}\n" +
    "                    -\n" +
    "                    {{::event.endTime|date: 'HH:mm'}}\n" +
    "                </td>\n" +
    "                <td ng-if=\"event.allDay\" class=\"monthview-eventdetail-timecolumn\">All day</td>\n" +
    "                <td class=\"event-detail\">{{::event.title}}</td>\n" +
    "            </tr>\n" +
    "            <tr ng-if=\"!selectedDate.events\">\n" +
    "                <td class=\"no-event-label\" ng-bind=\"::noEventsLabel\"></td>\n" +
    "            </tr>\n" +
    "        </table>\n" +
    "    </ion-content>\n" +
    "</div>\n" +
    "");
}]);
}());
