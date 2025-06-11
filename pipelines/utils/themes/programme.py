import json
from ast import literal_eval
from datetime import date, datetime

import petl as etl
from rap_utils.petl.io.parquet_view import ParquetView
from utils.paths import PUBLISHED

with open(PUBLISHED / 'manual/manual-project-name-map.json') as f:
    canonical_project_name = json.load(f)


def validation(row):
    if row['Project Name'] is None:
        return 'unknown_project'
    if row['Item Type'] != 'Event (any public-facing activity)':
        return 'not_event'
    if row['Start Date'] is None:
        return 'no_start_date'
    if row['Start Date'] > date.today():
        return 'future_dated'
    if row.Date < date.fromisoformat('2024-01-01'):
        return 'date_before_2024'
    if row['Start Date'] > row['End Date']:
        return 'end_before_start'
    if 'Artist Led Awards' in row['Producing model']:
        return 'artist_led_awards'
    return None


class Programme:
    projects = (
        etl
        .fromjson(PUBLISHED / 'programme/projects.json')
        .convert(['Start Date', 'End Date'], lambda f: datetime.fromisoformat(f).date())
        .cut('id', 'Project Name', 'Start Date', 'End Date', 'Evaluation Category', 'Programme Category', 'Greenlight Status', 'Project Phase')
        .replace('Project Name', None, 'UNKNOWN')
        .update('Programme Category', [], where=lambda r: r['Programme Category'] is None)
    )

    events, excluded_events = (
        etl
        .fromcsv(PUBLISHED / 'programme/events.csv')

        .convert(['Start Date', 'End Date'], etl.dateparser('%Y-%m-%d'))
        # .convert('Project Name', lambda x: x.strip())
        # .convert('Project Name', canonical_project_name)
        .convert([
            'Programme Category',
            'Producing model',
        ], literal_eval)
        .replaceall('', None)
        .replace([
            'Programme Category',
            'Producing model',
        ], None, [])
        .convertnumbers()

        # .select(lambda r: r['Start Date'] is not None)
        # Replace missing End Dates with Start Dates if Start Date is defined
        .convert('End Date', lambda _, r: r['Start Date'], pass_row=True, where=lambda r: r['Start Date'] is not None and r['End Date'] is None)

        # Calculate duration and event counts. NB - this won't work as part of an arbitrary aggregate
        .addfield('Duration', lambda r: r['End Date'] - r['Start Date'] if r['Start Date'] else None)
        .rename('_occurrences', 'Event Count')
        .addfield('Date', lambda r: r['End Date'])
        .addfield('Month', lambda r: r.Date.replace(day=1) if r.Date else None)
        .addfield('Validation', validation)

        .cut('id', 'project_id', 'Project Name', 'Item Type', 'Start Date', 'End Date', 'Programme Category', 'Evaluation Category', 'Producing model', 'Duration', 'Event occurrences', 'Event Count', 'Date', 'Month', 'Validation')

        .sort(['Date'])

        .biselect(lambda r: r.Validation == None)
    )

    event_reports = (
        etl
        .fromcsv(PUBLISHED / 'programme/event-reports.csv')
        .convert(['report_date', 'event_date', 'start_time', 'end_time'], lambda f: datetime.fromisoformat(f).date())
        .convert(['audience', 'tickets_pre_sold', 'tickets_on_the_door', 'participants', 'volunteers', 'volunteer_shifts'], int)
        .replace(['audience', 'tickets_pre_sold', 'tickets_on_the_door', 'participants', 'volunteers', 'volunteer_shifts'], None, 0)
        .convert(['Programme Category', 'Project Venue(s)'], literal_eval)
        # .convert('Project Name', lambda x: x.strip())
        # .convert('Project Name', canonical_project_name)
        .convertnumbers()
        .cache()
    )

    manual_events = (
        etl.fromcsv(PUBLISHED / 'manual/manual-events.csv')
        .selectne('Exclude from events count', 'True')
        .cutout('Exclude from events count')
        .replace('Events', '', 1)
        .replace('Audience', '', 0)
        .convert('Date', lambda f: datetime.fromisoformat(f).date())
        .rename({
            'Project': 'Project Name',
            'Airtable project ID': 'project_id',
        })
        # .convert('Project Name', lambda x: x.strip())
        # .convert('Project Name', canonical_project_name)
        .convertnumbers()
        .cache()
    )

    venues = (
        etl
        .fromcsv(PUBLISHED / 'programme/venues.csv')
        .convert(['Org/Venue Type', 'Event Reports'], literal_eval)
        .replace(['Event Reports'], None, [])
        .cache()
    )


class ProgrammeSlice:

    dimensions = ['project_name', 'month']

    def validation(self, row):
        if row.project_name is None:
            return 'unknown_project'
        if row.month is None:
            return 'blank_month'
        if row.date is None:
            return 'no_date'
        if row.date < self.start_date:
            return 'before_requested_date_range'
        if row.date > self.end_date:
            return 'after_requested_date_range'
        return None

    def __init__(self, range=(date.min, date.today())):
        self.start_date, self.end_date = range

        self.events_data, self.excluded_events_data = (
            ParquetView(PUBLISHED / 'combined/programme.parquet')

            .addfield('validation', self.validation)

            .convert('start_date', lambda f, r: f or r.date, pass_row=True)
            .convert('end_date', lambda f, r: f or r.date, pass_row=True)

            .biselect(lambda r: r.validation == None)
        )

    @property
    def events(self):
        return (
            self.events_data
            .aggregate([*self.dimensions, 'variable'], sum, 'value')
            .recast([*self.dimensions])
            .addfield('events', lambda r: (r.manual_events or 0) + (max(r.event_reports or 0, r.schedule_events or 0) or r.projected_events or 0), index=3)
            .addfield('audience', lambda r: (r.event_report_audience or 0) + (r.manual_audience or 0), index=4)
            .cache()
        )

    @property
    def project_data(self):
        return (
            self.events_data
            .aggregate(
                [
                    'project_id',
                    'project_name',
                    # 'programme_category',
                    'evaluation_category',
                ],
                {
                    'start_date': ('start_date', min),
                    'end_date': ('end_date', max),
                }
            )
            .cache()
        )

    @property
    def project_breakdown(self):
        return (
            self.events
            .melt(variables=['events', 'event_reports', 'schedule_events', 'projected_events', 'manual_events', 'audience', 'event_report_audience', 'manual_audience'])
            .selectnotnone('value')
            .aggregate(['project_name', 'variable'], sum, 'value')
            .recast()
            .leftjoin(self.project_data)
        )

    @property
    def project_details(self):
        return (
            self.project_breakdown
            .addfield('Details', lambda r: {
                # 'records': r.Records,
                'events': r.events,
                'eventReports': r.event_reports,
                'scheduledEvents': r.schedule_events,
                'projectedEvents': r.projected_events,
                'manual_events': r.manual_events,
                'audience': r.audience,
                'event_reports_audience': r.event_report_audience,
                'manual_audience': r.manual_audience,
                'evaluationCategory': r.evaluation_category,
                # 'programmeCategory': r['Programme Category'],
                'earliestDate': r.start_date.isoformat() if r.start_date else r.date.isoformat() if r.date else None,
                'latestDate': r.end_date.isoformat() if r.end_date else None,
            })
            .cut('project_name', 'Details')
            .sort('project_name')
        )
