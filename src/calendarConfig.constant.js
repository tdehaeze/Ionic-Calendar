(function() {
  'use strict';

  angular.module('constants')
  .constant('calendarConfig', {
    formatDay: 'dd',
    formatDayHeader: 'EEE',
    formatMonthTitle: 'MMMM yyyy',
    startingDayMonth: 0,
    startingDayWeek: 0,
    eventSource: null,
    queryMode: 'local',
    step: 30
  });

})();
