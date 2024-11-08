import pandas as pd


def make_time_series(df: pd.DataFrame, date_column='date'):
    '''
    Convert a dataframe to a time-series by converting the specified
    column into a datatime and setting it as the index
    '''
    df[date_column] = df[date_column].pipe(pd.to_datetime)
    df.set_index(date_column, inplace=True)
    return df
