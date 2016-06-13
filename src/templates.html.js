(function() {
'use strict';

angular.module('templates', []).run(['$templateCache', function($templateCache) {
  $templateCache.put("calendar.html",
    "<div class=\"calendar-container\">\n" +
    "  <month-view></month-view>\n" +
    "</div>\n" +
    "");
  $templateCache.put("month-view.html",
    "<div>\n" +
    "    <ion-slide-box  class=\"monthview-slide\"\n" +
    "                    on-slide-changed=\"slideChanged($index)\"\n" +
    "                    does-continue=\"true\"\n" +
    "                    show-pager=\"false\"\n" +
    "                    delegate-handle=\"monthview-slide\">\n" +
    "        <ion-slide ng-repeat=\"view in views track by $index\">\n" +
    "            <table ng-if=\"$index===currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\n" +
    "                <thead>\n" +
    "                    <tr>\n" +
    "                        <th ng-repeat=\"day in view.dates.slice(0,7) track by day.date\">\n" +
    "                            <small>{{::day.date | date: formatDayHeader}}</small>\n" +
    "                        </th>\n" +
    "                    </tr>\n" +
    "                </thead>\n" +
    "                <tbody>\n" +
    "                    <tr ng-repeat=\"i in [0,1,2,3,4,5]\">\n" +
    "                        <td ng-repeat=\"j in [0,1,2,3,4,5,6]\"\n" +
    "                            ng-click=\"select(view.dates[7*i+j].date)\"\n" +
    "                            ng-class=\"getHighlightClass(view.dates[7*i+j])\">{{view.dates[7*i+j].label}}</td>\n" +
    "                    </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "            <table ng-if=\"$index!==currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\n" +
    "                <thead>\n" +
    "                    <tr class=\"text-center\">\n" +
    "                        <th ng-repeat=\"day in view.dates.slice(0,7) track by day.date\">\n" +
    "                            <small>{{::day.date | date: formatDayHeader}}</small>\n" +
    "                        </th>\n" +
    "                    </tr>\n" +
    "                </thead>\n" +
    "                <tbody>\n" +
    "                    <tr ng-repeat=\"i in [0,1,2,3,4,5]\">\n" +
    "                        <td ng-repeat=\"j in [0,1,2,3,4,5,6]\">{{view.dates[7*i+j].label}}</td>\n" +
    "                    </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </ion-slide>\n" +
    "    </ion-slide-box>\n" +
    "</div>\n" +
    "");
}]);
}());
