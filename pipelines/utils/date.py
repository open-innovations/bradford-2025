import datetime

import pandas as pd


def date_to_week(date) -> datetime.datetime:
    return pd.Period(date, 'W-SUN').to_timestamp(how='End').floor('D').to_pydatetime()


def date_to_month(date) -> datetime.datetime:
    return pd.Period(date, 'M').to_timestamp(how='Start').floor('D').to_pydatetime()
