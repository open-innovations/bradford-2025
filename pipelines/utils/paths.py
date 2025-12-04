from pathlib import Path

ROOT = (Path(__file__).parent / '../..').resolve()

DATA = ROOT / 'data'
# TODO Fix this
PROCESSED = DATA / 'processed'
PUBLISHED = DATA / 'published'
OPEN_DATA = DATA / 'open-data'

HUQ = ROOT / 'data/huq'

SITE = ROOT / 'src'