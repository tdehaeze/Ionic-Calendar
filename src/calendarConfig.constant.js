(function() {
  'use strict';

  angular.module('constants')
  .constant('calendarConfig', {
    formatDay: 'dd',
    formatDayHeader: 'EEE',
    formatMonthTitle: 'MMMM yyyy',
    eventSource: null,
    queryMode: 'local',
    step: 30,
    startingDayMonth: 1,
  });

})();
