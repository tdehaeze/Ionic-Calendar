(function() {
  angular.module('calendar_pk.filters')
    .filter('todayFilter', todayFilter);

  todayFilter.$inject = [];

  function todayFilter() {
    return function (date) {
      date = new Date(+date);
      var today = new Date();

      return (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear());
    };

  }
})();
