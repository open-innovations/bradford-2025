from datetime import date, timedelta

import petl as etl
from utils.paths import PUBLISHED


def event_filter(row):
    return (
        row.Date < date.today() and
        row.Duration >= timedelta(0) and
        row.Duration <= timedelta(1) and
        row['Item Type'] == 'Event (any public-facing activity)'
    )


class Programme:
    projects = (
        etl
        .fromjson(PUBLISHED / 'programme/projects.json')
        .convert(['Date From', 'Date To'], etl.dateparser('%Y-%m-%d'))
        .cut('id', 'Project Name', 'Date From', 'Date To', 'Programme Category')
        .replace('Project Name', None, 'UNKNOWN')
        .update('Programme Category', [], where=lambda r: r['Programme Category'] is None)
    )

    events, excluded_events = (
        etl
        .fromcsv(PUBLISHED / 'programme/events.csv')
        .convert(['Start Date', 'End Date'], etl.dateparser('%Y-%m-%d'))
        .select(lambda r: r['Start Date'] is not None or r['End Date'] is not None)
        .cut('id', 'project_id', 'Project Name', 'Item Type', 'Start Date', 'End Date')
        .replaceall('', None)
        .replace('Project Name', None, 'UNKNOWN')
        .addfield('Duration', lambda r: r['End Date'] - r['Start Date'] if r['End Date'] and r['Start Date'] else timedelta())
        .addfield('Date', lambda r: r['Start Date'] or r['End Date'])
        .addfield('Month', lambda r: r.Date.replace(day=1))
        .sort(['Date'])
        .biselect(event_filter)
    )
