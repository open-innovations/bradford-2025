The count includes events records in the **Bradford 2025 Project Hub** schedule table. The following criteria are applied when counting the dates.

* The _Item Type_ must be **Event (any public-facing activity)**. {{ events.summary.excluded.non_event }} records are excluded by this filter.
* The event must have already completed (at the time the data was processed).
    Event date is based on _Start Date_ entered in the Project Hub, 
    falling back to _End Date_ if the Start date is not provided.
    {{ events.summary.excluded.future}} future events are excluded from this count.
* Some other event filtering is performed based on data quality.
    This excludes a further {{ events.summary.excluded.data_quality }} events.
    Criteria for this filtering is
    * _Exclude_ events which have a duration (difference between end date and start date) greater than one day. These may represent multiple events, or have been incorrectly recorded.
    * _Include_ events with no end date, as these are assumed to refer to one day.
    * _Exclude_ events with negative durations, i.e. where the start date is after the end date.
    * _Exclude_ events with no start or end date.