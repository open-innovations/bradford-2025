The count includes events records in the **Bradford 2025 Project Hub** _Schedule_ table.

The initial extract selects only the following entries:

* Only events that are associated with Greenlit projects are extracted.
* Only events which are part of projects not in the following project phases: _On Hold_, _Archive_ or _External Activity_. Projects with no defined phase are also excluded.
* Only records which are of type `Event (any public-facing activity)` are included.

This extract also sets an _Evaluation category_, based on data entered into the _Programme Category_ field. The logic is outlined below, with the _Evaluation Category_ being set to the first value that is matched:

* If the _Programme Category_ contains `Exhibition`, then the _Evaluation Category_ is set to **Exhibition**.
* Else if the _Programme Category_ contains `Festival`, then the _Evaluation Category_ is set to **Festival**.
* Otherwise the _Evaluation Category_ is set to **In-person**.

Preparation for the data dashboard site includes additional processing:

* Missing event end dates are substituted with the start date (effectively converting to a single event)
* An Event Count is calculated from difference between the start and end dates.
    This assumes that there is a single event per day, and does not take account of days during a block where events might not take place (e.g. a museum not being open on Mondays).
* Record validation is performed to reject the following:
    * Missing project names are excluded &mdash; removes {{ events.summary.excluded.unknown_project }} records.
    * Records with no start date &mdash; removes {{ events.summary.excluded.no_start_date }} records.
    * Records that have not started at the time of processing &mdash; removes {{ (events.summary.excluded.future_dated || 0).toLocaleString() }} records.
    * Records with a start date after the end date &mdash; removes {{ events.summary.excluded.end_before_start }} records.
    * Records marked with a _Producing model_ of **Artist Led Awards** - removes {{ events.summary.excluded.artist_led_awards }} records.

Further processing is performed to allocation multi-day events to specific periods (e.g. months).
As an example, a multi-day event record starting on 29 Jan and finishing on 2 Feb should be allocated 3 days in January and 2 days in February.

In this page, future events are rejected by clipping the date ranges to the current date.