from datetime import date, timedelta, datetime
from ast import literal_eval

import petl as etl
from utils.paths import PUBLISHED


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
    canonical_project_name = {
        'Rise (AKA - Opening Event)': 'RISE',
        'Our Patch (formerly Magic Waiting)': 'Our Patch',
    }

    projects = (
        etl
        .fromjson(PUBLISHED / 'programme/projects.json')
        .convert(['Start Date', 'End Date'], lambda f: datetime.fromisoformat(f).date())
        .cut('id', 'Project Name', 'Start Date', 'End Date', 'Programme Category', 'Greenlight Status', 'Project Phase')
        .replace('Project Name', None, 'UNKNOWN')
        .update('Programme Category', [], where=lambda r: r['Programme Category'] is None)
    )

    events, excluded_events = (
        etl
        .fromcsv(PUBLISHED / 'programme/events.csv')

        .convert(['Start Date', 'End Date'], etl.dateparser('%Y-%m-%d'))
        .convert('Project Name', lambda x: x.strip())
        .convert('Project Name', canonical_project_name)
        .convert([
            'Programme Category',
            'Producing model',
        ], literal_eval)
        .replaceall('', None)
        .replace([
            'Programme Category',
            'Producing model',
        ], None, [])

        # .select(lambda r: r['Start Date'] is not None)
        .convert('End Date', lambda _, r: r['Start Date'], pass_row=True, where=lambda r: r['Start Date'] is not None and r['End Date'] is None)
        .cut('id', 'project_id', 'Project Name', 'Item Type', 'Start Date', 'End Date', 'Programme Category', 'Evaluation Category', 'Producing model')

        .addfield('Duration', lambda r: r['End Date'] - r['Start Date'] if r['Start Date'] else None)
        .addfield('Event Count', lambda r: max(r.Duration.days + 1, 1) if r.Duration is not None else None)
        .addfield('Date', lambda r: r['End Date'])
        .addfield('Month', lambda r: r.Date.replace(day=1) if r.Date else None)
        .addfield('Validation', validation)

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
        .convert('Project Name', canonical_project_name)
        .cache()
    )
