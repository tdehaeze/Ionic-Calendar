(function() {
  'use strict';

  angular.module('directives')
    .directive('monthView', monthView);

  monthView.$inject = [];
  function monthView() {
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

      function updateCurrentView(currentViewStartDate, view) {
        var currentCalendarDate = ctrl.currentCalendarDate,
            today = new Date(),
            oneDay = 86400000,
            selectedDayDifference = Math.floor((currentCalendarDate.getTime() - currentViewStartDate.getTime()) / oneDay),
            currentDayDifference = Math.floor((today.getTime() - currentViewStartDate.getTime()) / oneDay);

        for (var r = 0; r < 42; r += 1) {
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

          ctrl.currentCalendarDate = selectedDate;

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


          if (scope.timeSelected) {
            scope.timeSelected({selectedTime: selectedDate});
          }
        }
      };

      // Used to the the class depending of the event/month
      scope.getHighlightClass = function (date) {
        var className = '';

        // if has an event
        if (date.hasEvent) {
          className = date.secondary ? 'monthview-secondary' : 'monthview-primary';
          className += ' ';
        }

        // Selected date
        if (date.selected) {
          className += 'monthview-selected';
          className += ' ';
        }

        // Today date
        if (date.current) {
          className += 'monthview-current';
          className += ' ';
        }

        // From an other month
        if (date.secondary) {
          className += 'text-muted';
          className += ' ';
        }
        className = className.slice(0, -1);
        return className;
      };





      ctrl._refreshView = function () {
        ctrl.populateAdjacentViews(scope);
        updateCurrentView(ctrl.range.startTime, scope.views[scope.currentViewIndex]);
      };




      ctrl.registerSlideChanged(scope);

      ctrl.refreshView();
    }

    return directive;

  }
})();
