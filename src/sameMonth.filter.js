(function() {
  angular.module('filters')
    .filter('sameMonth', sameMonth);

  sameMonth.$inject = [];

  function sameMonth() {
    return function (date, currentDate) {
      date = new Date(+date);
      current = new Date(+currentDate);
      return date.getMonth() === current.getMonth();
    };

  }
})();
