import json
from ast import literal_eval
from datetime import date, datetime

import petl as etl
from utils.paths import PROCESSED


def validation(row):
    if row['project_name'] is None:
        return 'unknown_project'
    if row['item_type'] != 'Event (any public-facing activity)':
        return 'not_event'
    if row['start_date'] is None:
        return 'no_start_date'
    if row['start_date'] > date.today():
        return 'future_dated'
    if row.Date < date.fromisoformat('2024-01-01'):
        return 'date_before_2024'
    if row['start_date'] > row['End Date']:
        return 'end_before_start'
    if 'Artist Led Awards' in row['producing_model']:
        return 'artist_led_awards'
    return None


class Programme:
    projects = (
        etl
        .fromjson(PROCESSED / 'programme/projects.json')
        .convert(['start_date', 'end_date'], lambda f: datetime.fromisoformat(f).date())
        .cut('id', 'project_name', 'start_date', 'end_date', 'evaluation_category', 'programme_category', 'greenlight_status', 'project_phase')
        .replace('project_name', None, 'UNKNOWN')
        .update('programme_category', [], where=lambda r: r['programme_category'] is None)
    )

    events, excluded_events = (
        etl
        .fromcsv(PROCESSED / 'programme/events.csv')

        .convert(['start_date', 'end_date'], etl.dateparser('%Y-%m-%d'))
        # .convert('Project Name', lambda x: x.strip())
        .convert([
            'programme_category',
            'producing_model',
        ], literal_eval)
        .replaceall('', None)
        .replace([
            'programme_category',
            'producing_model',
        ], None, [])
        .convertnumbers()

        # .select(lambda r: r['Start Date'] is not None)
        # Replace missing End Dates with Start Dates if Start Date is defined
        .convert('end_date', lambda _, r: r['start_date'], pass_row=True, where=lambda r: r['start_date'] is not None and r['end_date'] is None)

        # Calculate duration and event counts. NB - this won't work as part of an arbitrary aggregate
        .addfield('duration', lambda r: r['End Date'] - r['Start Date'] if r['Start Date'] else None)
        .rename('_occurrences', 'event_count')
        .addfield('Date', lambda r: r['End Date'])
        .addfield('Month', lambda r: r.Date.replace(day=1) if r.Date else None)
        .addfield('Validation', validation)

        .cut('id', 'project_id', 'project_name', 'item_type', 'start_date', 'end_date', 'programme_category', 'evaluation_category', 'producing_model', 'duration', 'event_occurrences', 'event_count', 'date', 'month', 'validation')

        .sort(['Date'])

        .biselect(lambda r: r.Validation == None)
    )

    manual_events = (
        etl.fromcsv(PROCESSED / 'manual/manual-events.csv')
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
        .convertnumbers()
        .cache()
    )

    venues = (
        etl
        .fromcsv(PROCESSED / 'programme/venues.csv')
        .convert(['organisation_or_venue_type', 'event_reports'], literal_eval)
        .replace(['event_reports'], None, [])
        .cache()
    )


