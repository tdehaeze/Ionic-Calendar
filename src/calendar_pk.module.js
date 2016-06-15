(function() {
  'use strict';

  angular.module('calendar_pk.directives', []);
  angular.module('calendar_pk.constants', []);
  angular.module('calendar_pk.filters', []);

  var app = angular.module('calendar_pk', ['calendar_pk.directives', 'calendar_pk.constants', 'calendar_pk.templates', 'calendar_pk.filters']);

})();
