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
