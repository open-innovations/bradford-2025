from pathlib import Path

ROOT = (Path(__file__).parent / '../..').resolve()

DATA = ROOT / 'data'
PUBLISHED = DATA / 'published'
OPEN_DATA = DATA / 'open-data'

HUQ = ROOT / 'data/huq'

SITE = ROOT / 'src'