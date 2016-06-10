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
    "    <ion-slide-box class=\"monthview-slide\" on-slide-changed=\"slideChanged($index)\" does-continue=\"true\"\n" +
    "                   show-pager=\"false\" delegate-handle=\"monthview-slide\">\n" +
    "        <ion-slide ng-repeat=\"view in views track by $index\">\n" +
    "            <table ng-if=\"$index===currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\n" +
    "                <thead>\n" +
    "                <tr>\n" +
    "                    <th ng-repeat=\"day in view.dates.slice(0,7) track by day.date\">\n" +
    "                        <small>{{::day.date | date: formatDayHeader}}</small>\n" +
    "                    </th>\n" +
    "                </tr>\n" +
    "                </thead>\n" +
    "                <tbody>\n" +
    "                <tr>\n" +
    "                    <td ng-click=\"select(view.dates[0].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[0])\">{{view.dates[0].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[1].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[1])\">{{view.dates[1].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[2].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[2])\">{{view.dates[2].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[3].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[3])\">{{view.dates[3].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[4].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[4])\">{{view.dates[4].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[5].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[5])\">{{view.dates[5].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[6].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[6])\">{{view.dates[6].label}}\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td ng-click=\"select(view.dates[7].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[7])\">{{view.dates[7].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[8].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[8])\">{{view.dates[8].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[9].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[9])\">{{view.dates[9].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[10].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[10])\">{{view.dates[10].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[11].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[11])\">{{view.dates[11].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[12].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[12])\">{{view.dates[12].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[13].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[13])\">{{view.dates[13].label}}\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td ng-click=\"select(view.dates[14].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[14])\">{{view.dates[14].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[15].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[15])\">{{view.dates[15].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[16].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[16])\">{{view.dates[16].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[17].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[17])\">{{view.dates[17].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[18].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[18])\">{{view.dates[18].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[19].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[19])\">{{view.dates[19].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[20].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[20])\">{{view.dates[20].label}}\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td ng-click=\"select(view.dates[21].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[21])\">{{view.dates[21].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[22].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[22])\">{{view.dates[22].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[23].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[23])\">{{view.dates[23].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[24].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[24])\">{{view.dates[24].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[25].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[25])\">{{view.dates[25].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[26].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[26])\">{{view.dates[26].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[27].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[27])\">{{view.dates[27].label}}\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td ng-click=\"select(view.dates[28].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[28])\">{{view.dates[28].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[29].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[29])\">{{view.dates[29].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[30].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[30])\">{{view.dates[30].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[31].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[31])\">{{view.dates[31].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[32].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[32])\">{{view.dates[32].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[33].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[33])\">{{view.dates[33].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[34].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[34])\">{{view.dates[34].label}}\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td ng-click=\"select(view.dates[35].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[35])\">{{view.dates[35].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[36].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[36])\">{{view.dates[36].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[37].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[37])\">{{view.dates[37].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[38].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[38])\">{{view.dates[38].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[39].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[39])\">{{view.dates[39].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[40].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[40])\">{{view.dates[40].label}}\n" +
    "                    </td>\n" +
    "                    <td ng-click=\"select(view.dates[41].date)\"\n" +
    "                        ng-class=\"getHighlightClass(view.dates[41])\">{{view.dates[41].label}}\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "            <table ng-if=\"$index!==currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\n" +
    "                <thead>\n" +
    "                <tr class=\"text-center\">\n" +
    "                    <th ng-repeat=\"day in view.dates.slice(0,7) track by day.date\">\n" +
    "                        <small>{{::day.date | date: formatDayHeader}}</small>\n" +
    "                    </th>\n" +
    "                </tr>\n" +
    "                </thead>\n" +
    "                <tbody>\n" +
    "                <tr>\n" +
    "                    <td>{{view.dates[0].label}}</td>\n" +
    "                    <td>{{view.dates[1].label}}</td>\n" +
    "                    <td>{{view.dates[2].label}}</td>\n" +
    "                    <td>{{view.dates[3].label}}</td>\n" +
    "                    <td>{{view.dates[4].label}}</td>\n" +
    "                    <td>{{view.dates[5].label}}</td>\n" +
    "                    <td>{{view.dates[6].label}}</td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td>{{view.dates[7].label}}</td>\n" +
    "                    <td>{{view.dates[8].label}}</td>\n" +
    "                    <td>{{view.dates[9].label}}</td>\n" +
    "                    <td>{{view.dates[10].label}}</td>\n" +
    "                    <td>{{view.dates[11].label}}</td>\n" +
    "                    <td>{{view.dates[12].label}}</td>\n" +
    "                    <td>{{view.dates[13].label}}</td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td>{{view.dates[14].label}}</td>\n" +
    "                    <td>{{view.dates[15].label}}</td>\n" +
    "                    <td>{{view.dates[16].label}}</td>\n" +
    "                    <td>{{view.dates[17].label}}</td>\n" +
    "                    <td>{{view.dates[18].label}}</td>\n" +
    "                    <td>{{view.dates[19].label}}</td>\n" +
    "                    <td>{{view.dates[20].label}}</td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td>{{view.dates[21].label}}</td>\n" +
    "                    <td>{{view.dates[22].label}}</td>\n" +
    "                    <td>{{view.dates[23].label}}</td>\n" +
    "                    <td>{{view.dates[24].label}}</td>\n" +
    "                    <td>{{view.dates[25].label}}</td>\n" +
    "                    <td>{{view.dates[26].label}}</td>\n" +
    "                    <td>{{view.dates[27].label}}</td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td>{{view.dates[28].label}}</td>\n" +
    "                    <td>{{view.dates[29].label}}</td>\n" +
    "                    <td>{{view.dates[30].label}}</td>\n" +
    "                    <td>{{view.dates[31].label}}</td>\n" +
    "                    <td>{{view.dates[32].label}}</td>\n" +
    "                    <td>{{view.dates[33].label}}</td>\n" +
    "                    <td>{{view.dates[34].label}}</td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td>{{view.dates[35].label}}</td>\n" +
    "                    <td>{{view.dates[36].label}}</td>\n" +
    "                    <td>{{view.dates[37].label}}</td>\n" +
    "                    <td>{{view.dates[38].label}}</td>\n" +
    "                    <td>{{view.dates[39].label}}</td>\n" +
    "                    <td>{{view.dates[40].label}}</td>\n" +
    "                    <td>{{view.dates[41].label}}</td>\n" +
    "                </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </ion-slide>\n" +
    "    </ion-slide-box>\n" +
    "    <ion-content class=\"event-detail-container\" has-bouncing=\"false\" ng-show=\"showEventDetail\" overflow-scroll=\"false\">\n" +
    "        <table class=\"table table-bordered table-striped table-fixed event-detail-table\">\n" +
    "            <tr ng-repeat=\"event in selectedDate.events\" ng-click=\"eventSelected({event:event})\">\n" +
    "                <td ng-if=\"!event.allDay\" class=\"monthview-eventdetail-timecolumn\">{{::event.startTime|date: 'HH:mm'}}\n" +
    "                    -\n" +
    "                    {{::event.endTime|date: 'HH:mm'}}\n" +
    "                </td>\n" +
    "                <td ng-if=\"event.allDay\" class=\"monthview-eventdetail-timecolumn\">All day</td>\n" +
    "                <td class=\"event-detail\">{{::event.title}}</td>\n" +
    "            </tr>\n" +
    "            <tr ng-if=\"!selectedDate.events\">\n" +
    "                <td class=\"no-event-label\" ng-bind=\"::noEventsLabel\"></td>\n" +
    "            </tr>\n" +
    "        </table>\n" +
    "    </ion-content>\n" +
    "</div>\n" +
    "");
}]);
}());
