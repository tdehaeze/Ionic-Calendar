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

      scope.formatDayHeader = ctrl.formatDayHeader;

      ctrl.mode = {
        step: {months: 1}
      };

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
