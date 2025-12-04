import shutil
from utils.paths import PUBLISHED, SITE


def main():
    target = SITE / '_data/published'
    target.mkdir(exist_ok=True, parents=True)
    files = PUBLISHED.glob('*')
    for f in files:
        shutil.copytree(
            f,
            target / f.relative_to(PUBLISHED)
        )


if __name__ == "__main__":
    main()
