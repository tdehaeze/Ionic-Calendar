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
    }


    directive.controller = CalendarController;
    CalendarController.$inject = ['$scope', '$attrs', '$parse', '$interpolate', 'calendarConfig', '$timeout', '$ionicSlideBoxDelegate', 'dateFilter'];
    function CalendarController($scope, $attrs, $parse, $interpolate, calendarConfig, $timeout, $ionicSlideBoxDelegate, dateFilter) {
      var vm = this;

      console.log('$attrs', $attrs);

      var ngModelCtrl = {$setViewValue: angular.noop}; // nullModelCtrl;

      // Configuration attributes
      angular.forEach(['formatDay', 'formatDayHeader', 'formatMonthTitle', 'eventSource', 'queryMode', 'step', 'startingDayMonth'], function (key, index) {
        // vm[key] = angular.isDefined($attrs[key]) ? (index < 4 ? $interpolate($attrs[key])($scope.$parent) : $scope.$parent.$eval($attrs[key])) : calendarConfig[key];
        vm[key] = angular.isDefined($attrs[key]) ? $interpolate($attrs[key])($scope.$parent) : calendarConfig[key];
      });

      vm.hourParts = Math.floor(60 / vm.step);

      // Watch the scope of the parent scope
      $scope.$parent.$watch($attrs.eventSource, function (value) {
        vm.onEventSourceChanged(value);
      });

      if (angular.isDefined($attrs.initDate)) {
        vm.currentCalendarDate = $scope.$parent.$eval($attrs.initDate);
      }

      if (!vm.currentCalendarDate) {
        vm.currentCalendarDate = new Date();
        if ($attrs.ngModel && !$scope.$parent.$eval($attrs.ngModel)) {
          $parse($attrs.ngModel).assign($scope.$parent, vm.currentCalendarDate);
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

        firstDayInNextMonth = new Date(year, month + 1, 1);
        if (firstDayInNextMonth.getTime() <= calculateCalendarDate.getTime()) {
          calculateCalendarDate = new Date(firstDayInNextMonth - 24 * 60 * 60 * 1000);
        }

        return calculateCalendarDate;
      }

      function getViewData(startTime) {
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

        var startDate = startTime,
            date = startDate.getDate(),
            month = (startDate.getMonth() + (date !== 1 ? 1 : 0)) % 12;

        var days = getDates(startDate, 42);
        for (var i = 0; i < 42; i++) {
          days[i] = angular.extend(createDateObject(days[i], vm.formatDay), {
            secondary: days[i].getMonth() !== month
          });
        }

        return {
          dates: days
        };
      }

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

      function onDataLoaded() {
        var eventSource = vm.eventSource,
            len = eventSource ? eventSource.length : 0,
            startTime = vm.range.startTime,
            endTime = vm.range.endTime,
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
          var event = eventSource[i],
              eventStartTime = new Date(event.startTime),
              eventEndTime = new Date(event.endTime),
              st,
              et;

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
          this.range = getRange(this.currentCalendarDate);
          if ($scope.titleChanged) {
            $scope.titleChanged({title: vm.getTitle()});
          }
          this._refreshView();
          this.rangeChanged();
        }
      };

      vm.onEventSourceChanged = function (value) {
        vm.eventSource = value;
        if (onDataLoaded) {
          onDataLoaded();
        }
      };

      vm.getAdjacentViewStartTime = function (direction) {
        var adjacentCalendarDate = getAdjacentCalendarDate(vm.currentCalendarDate, direction);
        return getRange(adjacentCalendarDate).startTime;
      };

      vm.move = function (direction) {
        vm.direction = direction;

        vm.currentCalendarDate = getAdjacentCalendarDate(vm.currentCalendarDate, direction);

        ngModelCtrl.$setViewValue(vm.currentCalendarDate);
        vm.refreshView();
        vm.direction = 0;
      };

      vm.rangeChanged = function () {
        if (vm.queryMode === 'local') {
          if (vm.eventSource && onDataLoaded) {
            onDataLoaded();
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

      // TODO
      // => understand what is $index and what is currentViewIndex
      vm.registerSlideChanged = function (scope) {
        scope.currentViewIndex = 0;
        scope.slideChanged = function ($index) {
          $timeout(function () {
            var currentViewIndex = scope.currentViewIndex,
                direction = 0;

            console.log('currentViewIndex', currentViewIndex);
            console.log('$index', $index);

            if (currentViewIndex === $index - 1 || ($index === 0 && currentViewIndex === 2)) {
              direction = 1;
            } else if (currentViewIndex === $index + 1 || ($index === 2 && currentViewIndex === 0)) {
              direction = -1;
            }

            scope.currentViewIndex = $index;
            vm.move(direction);
            scope.$digest();
          }, 100);
        };
      };

      vm.populateAdjacentViews = function (scope) {
        var currentViewStartDate,
            currentViewData,
            toUpdateViewIndex,
            currentViewIndex = scope.currentViewIndex;

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

      vm.getTitle = function () {
        var currentViewStartDate = vm.range.startTime,
            date = currentViewStartDate.getDate(),
            month = (currentViewStartDate.getMonth() + (date !== 1 ? 1 : 0)) % 12,
            year = currentViewStartDate.getFullYear() + (date !== 1 && month === 0 ? 1 : 0),
            headerDate = new Date(year, month, 1);

        return dateFilter(headerDate, vm.formatMonthTitle);
      };
    }

    return directive;

  }
})();
