import datetime
from datetime import date

import pandas as pd
from dateutil.relativedelta import relativedelta


def date_to_week(date) -> datetime.datetime:
    return pd.Period(date, 'W-SUN').to_timestamp(how='End').floor('D').to_pydatetime()


def date_to_month(date) -> datetime.datetime:
    return pd.Period(date, 'M').to_timestamp(how='Start').floor('D').to_pydatetime()


def get_period_boundary(ref: date, period_end={}):
    this_period_end = ref + relativedelta(**period_end)
    next_period_start = this_period_end + relativedelta(days=1)
    return this_period_end, next_period_start


def month_chunker(start: date, end: date):
    ref = start
    while True:
        month_end, month_start = get_period_boundary(ref, period_end={'day': 1, 'months': 1, 'days': -1})
        yield (ref, min(month_end, end))
        if month_start > end:
            break
        ref = month_start
