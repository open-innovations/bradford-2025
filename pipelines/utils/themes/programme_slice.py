from datetime import date

from rap_utils.petl.io.parquet_view import ParquetView

from ..paths import PUBLISHED


deprecated_variables = [
    'event_report_tickets_on_the_door',
    'event_report_tickets_pre_sold',
    'event_report_participants_community',
    'event_report_participants_schools',
    'event_report_volunteer_shifts',
    'event_report_volunteers',
    'event_report_audience',
    'event_report_participants',
    'event_reports',
]

class ProgrammeSlice:

    dimensions = ['project_name', 'evaluation_category', 'month']

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
            .selectnotin('variable', deprecated_variables)

            .addfield('validation', self.validation)

            .convert('start_date', lambda f, r: f or r.date, pass_row=True)
            .convert('end_date', lambda f, r: f or r.date, pass_row=True)
            .cache()

            .biselect(lambda r: r.validation == None)
        )

    @classmethod
    def calculate_events(cls, row):
        return sum(
            filter(None.__ne__, (
                row.manual_events,
                row.schedule_events
            )), 0
        )

    @classmethod
    def calculate_partitipants(cls, row):
        return sum(
            filter(None.__ne__, (
                row.schedule_participants_community,
                row.manual_participants_community,
            )), 0
        )

    @property
    def events(self):
        return (
            self.events_data
            .aggregate([*self.dimensions, 'variable'], sum, 'value')
            .recast([*self.dimensions], samplesize=1_000_000)
            .addfield('events', self.calculate_events, index=3)
            .addfield('participants', self.calculate_partitipants, index=5)
            .replace(['events', 'audience', 'participants'], None, 0)
            .cache()
        )

    @property
    def project_data(self):
        return (
            self.events_data
            .aggregate(
                [
                    'project_name',
                    # 'programme_category',
                    'evaluation_category',
                ],
                {
                    'project_id': ('project_id', list),
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
            .melt(variables=[
                'events', 'schedule_events', 'projected_events', 'manual_events',
                'audience',
                'participants', 'schedule_participants_community', 'manual_participants_community',
            ])
            .selectnotnone('value')
            .aggregate(['project_name', 'evaluation_category', 'variable'], sum, 'value')
            .recast()
        )

    @property
    def project_details(self):
        return (
            self.project_breakdown
            .leftjoin(
                self.project_data.aggregate('project_name', {
                    'start_date': ('start_date', min),
                    'end_date': ('end_date', max),
                })
            )
            .addfield('Details', lambda r: {
                # 'records': r.Records,
                'events': r.events,
                'audience': r.audience,
                'participants': r.participants,

                'scheduledEvents': r.schedule_events,
                'projectedEvents': r.projected_events,
                'manual_events': r.manual_events,

                'schedule_participants_community': r.schedule_participants_community,
                'manual_participants_community': r.manual_participants_community,
                # 'manual_participants_schools': r.manual_participants_schools,

                'evaluationCategory': r.evaluation_category,
                # 'programmeCategory': r['Programme Category'],
                'earliestDate': r.start_date.isoformat() if r.start_date else r.date.isoformat() if r.date else None,
                'latestDate': r.end_date.isoformat() if r.end_date else None,
            })
            .cut('project_name', 'Details')
            .sort('project_name')
        )