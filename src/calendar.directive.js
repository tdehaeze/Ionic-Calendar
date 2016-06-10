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
