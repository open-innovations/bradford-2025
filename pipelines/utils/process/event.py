import petl as etl

from ..paths import PUBLISHED, SITE


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
            by_type = by_type.addfield('percentage', lambda r: round(100 * r['count'] / total, 1))

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