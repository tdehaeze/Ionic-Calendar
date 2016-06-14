(function() {
  'use strict';

  angular.module('constants')
  .constant('calendarConfig', {
    formatDay:        'dd',         //
    formatDayHeader:  'EEE',        //
    formatMonthTitle: 'MMMM yyyy',  //
    eventSource:      null,         //
    queryMode:        'local',      //
    startingDayMonth: 1,            //
  });

})();
