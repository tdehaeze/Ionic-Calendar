(function() {
  'use strict';

  angular.module('calendar_pk.constants')
  .constant('calendarConfig', {
    formatDay:        'dd',         //
    formatDayHeader:  'EEE',        //
    formatMonthTitle: 'MMMM yyyy',  //
    eventSource:      [],           //
    startingDayMonth: 1,            //
  });

})();
