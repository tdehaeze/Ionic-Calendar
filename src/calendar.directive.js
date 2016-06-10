(function() {
  'use strict';

  angular.module('directives')
    .directive('calendar', calendar);

  calendar.$inject = [];
  function calendar() {
    var directive = {};
    directive.restrict = 'E';
    directive.replace = true;
    directive.templateUrl = 'src/calendar.html';
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

    return directive;

  }
})();
