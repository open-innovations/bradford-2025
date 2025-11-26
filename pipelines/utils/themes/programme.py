import json
from ast import literal_eval
from datetime import date, datetime

import petl as etl
from utils.paths import PROCESSED

with open(PROCESSED / 'manual/manual-project-name-map.json') as f:
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
        .fromjson(PROCESSED / 'programme/projects.json')
        .convert(['Start Date', 'End Date'], lambda f: datetime.fromisoformat(f).date())
        .cut('id', 'Project Name', 'Start Date', 'End Date', 'Evaluation Category', 'Programme Category', 'Greenlight Status', 'Project Phase')
        .replace('Project Name', None, 'UNKNOWN')
        .update('Programme Category', [], where=lambda r: r['Programme Category'] is None)
    )

    events, excluded_events = (
        etl
        .fromcsv(PROCESSED / 'programme/events.csv')

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
        # .convert('Project Name', canonical_project_name)
        .convertnumbers()
        .cache()
    )

    venues = (
        etl
        .fromcsv(PROCESSED / 'programme/venues.csv')
        .convert(['Org/Venue Type', 'Event Reports'], literal_eval)
        .replace(['Event Reports'], None, [])
        .cache()
    )


