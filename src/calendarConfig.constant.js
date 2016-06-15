(function() {
  'use strict';

  angular.module('constants')
  .constant('calendarConfig', {
    formatDay:        'dd',         //
    formatDayHeader:  'EEE',        //
    formatMonthTitle: 'MMMM yyyy',  //
    eventSource:      [],           //
    startingDayMonth: 1,            //
  });

})();
