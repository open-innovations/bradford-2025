import pandas as pd


def make_cumulative(df: pd.DataFrame, variable_level=0):
    '''
    Take a DataFrame and append a cumulative version of the table
    with columns suffixed with 'cumulative'.
    Assumes that the variable level is 0. Override with `variable_level`
    '''
    return pd.concat([
        df,
        df.cumsum().rename(columns=lambda x: f'{x} cumulative', level=variable_level)
    ], axis=1)
