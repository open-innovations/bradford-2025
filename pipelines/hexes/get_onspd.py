from pathlib import Path
import petl as etl

DATA = (Path(__file__).parent / '../../data/raw').resolve()
DATA.mkdir(parents=True, exist_ok=True)

def main():
    bd25 = etl.fromcsv(
        "https://geoportal.statistics.gov.uk/datasets/6d64151462064a78bf45d6f22646fe72_0.csv"
    ).cut(
        'PCDS', 'OSLAUA', 'OSWARD', 'LAT', 'LONG', 'OSEAST1M', 'OSNRTH1M'
    ).select(
        lambda r: r.OSLAUA == 'E08000032' or r.PCDS.startswith('BD')
    )

    bd25.tocsv(DATA / 'bd25_geo.csv')

if __name__ == "__main__":
    main()