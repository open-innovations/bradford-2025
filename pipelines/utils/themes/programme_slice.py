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
    '''
    Slice of the programme data
    '''

    dimensions = ['project_name', 'evaluation_category', 'month', 'source']

    def validation(self, row):
        '''Validate a project row for inclusion'''
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

    def __init__(self, date_range=(date.min, date.today())):
        self.start_date, self.end_date = date_range

        self.events_data, self.excluded_events_data = (
            ParquetView(PUBLISHED / 'combined/programme.parquet')
            .selectnotin('variable', deprecated_variables)

            .addfield('validation', self.validation)

            .convert(['start_date', 'end_date'], lambda f, r: f or r.date, pass_row=True)
            .cache()

            .biselect(lambda r: r.validation is None)
        )

    @staticmethod
    def calculate_partitipants(row):
        '''Calculate the participants by adding the community and school participants'''
        return sum(
            filter(None.__ne__, (
                row.get('participants_community'),
                row.get('participants_school'),
            )), 0
        )

    @property
    def events(self):
        '''Get the events in the slice'''
        return (
            self.events_data
            .aggregate([*self.dimensions, 'variable'], sum, 'value')
            .recast([*self.dimensions], samplesize=1_000_000)
            # .addfield('events', self.calculate_events, index=3)
            .addfield('participants', self.calculate_partitipants, index=4)
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
        '''Create a summary by project'''
        return (
            self.events
            .melt(variables=[f for f in [
                'events', 'projected_events',
                'audience',
                'participants', 'participants_community', 'participants_school',
            ] if f in self.events.header()])
            .selectnotnone('value')
            .aggregate(['project_name', 'evaluation_category', 'variable'], sum, 'value')
            .recast()
        )
