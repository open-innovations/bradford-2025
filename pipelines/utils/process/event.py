import petl as etl

from ..paths import PUBLISHED, SITE
from ..themes.programme import Programme as _Programme
from ..themes.programme_slice import ProgrammeSlice


class Programme:
    def __init__(self, project_ids, venue_ids):
        self.project_ids = project_ids

        venues = (
            _Programme.venues
            .rename({ 'id': 'venue', 'Organisation &/or Venue Name': 'venue_name' })
            .cut('venue', 'venue_name')
        )

        all_events = (
            ProgrammeSlice().events_data
            .recast(samplesize=1_000_000)
            .convert('venue', lambda f: f[0])
            .replace(['schedule_audience', 'schedule_participants_community'], None, 0)
            .leftjoin(venues)
        )

        # self.projects = _Programme.projects.selectin('id', project_ids)

        event_by_programme = (
            all_events
            .selectin('project_id', project_ids)
        )

        event_by_venue = (
            all_events
            .selectin('venue', venue_ids)
        )

        self.events = (
            etl.cat(
                event_by_programme,
                event_by_venue
            )
        )

    def summarise(self):
        counts = dict(
            zip(
                ('projects', 'events', ),
                (
                    self.events.distinct('project_name').nrows(),
                    self.events.nrows(),
                ),
            )
        )
        categories = dict(
            self.events
            .aggregate(None, {
                'evaluation': ('evaluation_category', set),
                'programme': ('programme_category', list),
            })
            .convert('evaluation', list)
            .convert('programme', lambda l: list({e for s in l for e in s}))
            .transpose()
        ) if self.events.nrows() > 0 else None

        events_summary = dict(
            self.events
            # TODO PUT HERE?
            # .replace(['audience', 'participants', 'volunteers'], None, 0)
            .aggregate(None, {
                'audience': ('schedule_audience', sum),
                'participants': ('schedule_participants_community', sum),
                # 'volunteers': ('volunteers', sum),
                # 'volunteerShifts': ('volunteer_shifts', sum),
                'earliestDate': ('date', lambda dates: min(d for d in dates if d)),
                'latestDate': ('date', lambda dates: max(d for d in dates if d)),
            })
            .convert(['earliestDate', 'latestDate'], lambda f: f.isoformat())
            .transpose()
        ) if self.events.nrows() > 0 else None

        return {
            'count': counts,
            'categories': categories,
            'events': events_summary,
        }


class Tickets:
    def __init__(self, event_ids):
        self.event_ids = event_ids

        self.instances = (
            etl
            .fromcsv(PUBLISHED / 'ticketing/event-instances.csv')
            .selectin('event_id', self.event_ids)
            .cutout('firstInstanceDateTime', 'lastInstanceDateTime')
            .convert('start', etl.datetimeparser('%Y-%m-%d %H:%M:%S'))
        ).cache()

        self.all = (
            etl
            .fromcsv(PUBLISHED / 'ticketing/tickets.csv')
            .selectin('instance_id', self.instance_ids())
            .convertnumbers()
        ).cache()

    def instance_ids(self):
        return list(self.instances.values('instance_id'))

    def breakdown(self):
        aggregation_config = {
            'key': ['instance_id', 'geography_type', 'geography_code'],
            'aggregation': sum,
            'value': 'count_of_tickets',
            'field': 'count_of_tickets',
        }
        return (
            self.all
            .aggregate(
                **aggregation_config,
            )
            # .update('geography_code', '', where=lambda x: (x.geography_type == 'oslaua') and (x.count_of_tickets < 10))
            # .aggregate(
            #     **aggregation_config
            #     # key=['start', 'geography_type', 'geography_code'],
            #     # aggregation=sum,
            #     # value='value'
            # )
            .join(
                self.instances.cut('instance_id', 'start'),
                key='instance_id',
            )
            .sort(['start', 'geography_type', 'geography_code'])
            .cut('start', 'geography_type', 'geography_code', 'count_of_tickets')
        ).cache()

    def types(self):
        by_type = (
            self.all
            .selecteq('geography_type', 'oslaua')
            .convert(
                'type',
                # TODO check these mappings with Hannah
                {
                    'Audio Description': 'Accessible Ticket',
                    'BSL Interpreted': 'Accessible Ticket',
                    'Essential Companion': 'Accessible Ticket',
                    'Wheelchair User': 'Accessible Ticket',
                    'Guest Ticket': 'Full Price',
                    'Z Community Ticket': 'Community Ticket',
                    'Under 16': 'Child Ticket',
                },
            )
            .aggregate('type', sum, 'count_of_tickets', field='count')
            .selectnotin('type', ['Z Company Ticket', 'Z Press Ticket'])
            .sort('count', reverse=True)
        )
        total = sum(by_type.values('count'))
        by_type = by_type.addfield(
            'percentage', lambda r: round(100 * r['count'] / total, 1))

        return by_type

    def total(self):
        return (
            self.breakdown()
            .aggregate(
                key=['geography_type', 'geography_code'],
                aggregation=sum,
                value="count_of_tickets",
                field="count_of_tickets",
            )
            .addfield('start', 'ALL', 0)
        ).cache()

    def detailed(self):
        return etl.cat(self.total(), self.breakdown()).cache()

    def summarise(self):
        return (
            self.detailed()
            .selecteq('geography_type', 'oslaua')
            .aggregate(
                key='start',
                aggregation=sum,
                value="count_of_tickets",
                field="count_of_tickets"
            )
            .cache()
        )


class Volunteers(object):
    def __init__(self, ids: list[str]):
        self.data = (
            etl
            .fromcsv(PUBLISHED / 'volunteers/shifts.csv').selectin('rosterfy_event_id', ids)
            .convertnumbers()
        )

    def summarise(self):
        config = {
            'attended': ('attended', sum),
            'hours': ('hours', sum),
        }

        agg = self.data.aggregate(key='date', aggregation=config)
        return etl.cat(
            agg,
            agg.aggregate(key=None, aggregation=config).addfield('date', 'ALL')
        )


class Sustainability(object):
    def __init__(self, project_ids: list[str]):
        self.data = (
            etl
            .fromcsv(PUBLISHED / 'sustainability/calculations.csv')
            .selectin('project_id', project_ids)
            .convertnumbers()
        )

    def summarise(self):
        summary = self.data.aggregate(
            ['impact_type', 'scope'], sum, 'calculation_tco2e', field='tCO2e')

        return (
            etl.cat(
                summary,
                summary.aggregate(['scope'], sum, 'tCO2e', field='tCO2e'),
                summary.aggregate(None, sum, 'tCO2e', field='tCO2e')
            )
            .replace(['impact_type', 'scope'], None, 'ALL')
        )
