# Kortz Center Heist Calculator

A free, unofficial loot optimizer for **The Kortz Center Heist** in GTA Online.

## Open the calculator

### https://blamp26.github.io/kortz-center-heist-calculator/

No installation, account, or download is required. The calculator runs entirely in the browser.

## Features

- Calculates primary-target payouts, including the first weekly sale multiplier and hard mode.
- Optimizes shared bag capacity for crews of 1–4 players.
- Finds the highest-value secondary-loot combination with an exact 0/1 knapsack algorithm.
- Accounts for Buyer Request List bonuses.
- Excludes Crisp Gallery targets from solo runs.
- Supports editable target values so the calculation can match Raf's exact scope-out message.
- Saves settings in the browser and creates shareable calculation links.

## Loot pool status

The secondary-target database is still being verified from community guides, user captures, and future GTA V text extraction. Some targets may still be missing, renamed, or using provisional default values. Always prefer the exact value shown by Raf in-game when adding a scoped target.

## How to use

1. Select the current primary target and enter the value shown on the planning board.
2. Choose the number of players.
3. Add every secondary target found during scope-out.
4. Enter the exact value shown by Raf and mark Buyer Request or Crisp Gallery items when applicable.
5. Use **Best loot combination** to see the maximum-value set that fits the crew's bags.

## How optimization works

Each scoped item is treated as a separate item with a value and bag-space cost. The calculator uses dynamic programming to evaluate every reachable bag fill and returns the globally highest-value valid combination. It does not rely on a simple greedy price-per-percent sort.

## Data accuracy

Secondary-target values can vary between runs, and published guides do not always agree. The included values are starting estimates only. For the most accurate result, replace them with the exact amounts shown in-game.

See [DATA_SOURCES.md](DATA_SOURCES.md) for sources and methodology.

## Credits

The project was inspired by [MichalD96/Perico-heist-goods-counter](https://github.com/MichalD96/Perico-heist-goods-counter). This implementation was written separately for Kortz Center mechanics.

## Disclaimer

This is an unofficial fan-made project and is not affiliated with Rockstar Games or Take-Two Interactive.

## License

MIT. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Local target image workflow

Target images are stored as local project files, not external links.

- Place approved files under `assets/images/targets/`
- Register each file in `data/image-manifest.json`
- Only set `status` to `approved` after the image has been manually verified

The UI will automatically show local previews and thumbnails when an approved image path exists in the manifest.

## First verified secondary-image extraction batch

The repository includes `tools/extract-approved-target-images.ps1` and `data/image-extraction-map.json`. With the source video stored at `research-videos/sAd7OHSPPPA.mp4`, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\extract-approved-target-images.ps1
```

This generates 14 local WebP secondary-target images, removes unused primary-target previews, and updates `data/image-manifest.json`.
