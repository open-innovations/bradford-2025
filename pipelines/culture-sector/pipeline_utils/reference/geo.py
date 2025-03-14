import petl as etl

local_authorities = [
    {
        'LAD24CD': 'E08000032', 'LAD24NM': 'Bradford'
    }
]

la_names = [l['LAD24NM'] for l in local_authorities]

la_code_lookup = etl.dictlookupone(etl.fromdicts(local_authorities), 'LAD24NM')