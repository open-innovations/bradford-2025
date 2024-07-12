from pathlib import Path
import petl as etl
import shapely as shp

from get_onspd import DATA as DATA_PATH

def reducer(key, rows):
    cluster = shp.MultiPoint([(r.LONG, r.LAT) for r in rows])
    return [key, float(cluster.centroid.y), float(cluster.centroid.x)]

bd25 = etl.fromcsv(
    DATA_PATH / "bd25_geo.csv"
).convertnumbers(
).split(
    'PCDS', ' ', [ 'OUTWARD', 'INWARD']
).cutout(
    'INWARD'
).selectne(
    'OSLAUA', ''
).rowreduce(
    'OUTWARD',
    reducer,
    header=["AREA", "LAT", "LONG"]
)

bd25.tocsv(DATA_PATH / "bd25_areas.csv")

geo = shp.GeometryCollection([shp.Point(g) for g in bd25.values("LONG", "LAT")])

with open(DATA_PATH / "bd25.geojson", "w") as f:
    f.write(shp.to_geojson(geo))