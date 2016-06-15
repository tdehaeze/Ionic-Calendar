# Ionic-Calendar directive

Ionic calendar directive

# Usage

Bower Install: `bower install calendar_pk`

Load the necessary dependent files:

    <link href="lib/calendar_pk/dist/css/calendar_pk.css" rel="stylesheet">
    <script src="lib/calendar_pk/dist/js/calendar_pk.js"></script>

Add the calendar module as a dependency to your application module:

    var myAppModule = angular.module('MyApp', ['calendar_pk'])

Add the directive in the html page

    <calendar-pk    event-source="eventSource"
                    current-month="currentMonth"></calendar-pk>

# Data arguments
* **eventSource** : The data source of the calendar, when the eventSource is set, the view will be updated accordingly. eventSource should be an array of Dates.
    * *Default value: []*

# Options arguments
* **formatDay** : The format of the date displayed in the month view.
    * *Default value: 'dd'*

* **formatDayHeader** : The format of the header displayed in the month view.
    * *Default value: 'EEE'*

* **formatMonthTitle** : The format of the title displayed in the month view.
    * *Default value: 'MMMM yyyy'*

* **startingDayMonth** : Control month view starting from which day.
    * *Default value: 1 (Monday)*

# Functions arguments
* **monthChanged**
    * **startTime** (*DateTime*)
    * **endTime** (*DateTime*)
    * **display** (*String*)

* **timeSelected**
    * **selectedTime** (*DateTime*)

* **weekSelected**
    * **monday** (*DateTime*)


# Events
* **changeMonth** : When receiving this event, the calendar will move the current view to previous or next range.
    * **direction** (1: Forward -1: Backward)

```javascript
    $scope.$broadcast('changeMonth', 1);
```

<!-- * eventSourceChanged
This event is only needed when you manually modify the element in the eventSource array.
Parameter: value
The whole event source object

        $scope.$broadcast('eventSourceChanged',$scope.eventSource); -->

# i18n support
When including the angular locale script, the viewTitle and header of the calendar will be translated to local language automatically.

        <script src="http://code.angularjs.org/1.4.3/i18n/angular-locale_xx.js"></script>
