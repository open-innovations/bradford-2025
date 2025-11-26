from pathlib import Path

ROOT = (Path(__file__).parent / '../..').resolve()

DATA = ROOT / 'data'
# TODO Fix this
PROCESSED = DATA / 'published'
PUBLISHED = DATA / 'published'
OPEN_DATA = DATA / 'open-data'

HUQ = ROOT / 'data/huq'

SITE = ROOT / 'src'