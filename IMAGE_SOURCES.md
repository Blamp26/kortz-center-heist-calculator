# Target image sources

This file tracks the first manually verified secondary-image extraction batch.

Source video: [GTA Series Videos — Kortz Center scope-out footage](https://www.youtube.com/watch?v=sAd7OHSPPPA)

The final WebP files are extracted locally from the original downloaded video. The project does not hotlink the source video or third-party image files.

| Target ID | Target | Timestamp | Preview frame | Quality | Verification |
|---|---|---:|---:|:---:|---|
| `canis-hominem-edit` | Canis Hominem Edit | `00:14:07.000` | `000848.jpg` | A | Museum plaque is readable in the source frame. |
| `orange-crush` | Orange Crush | `00:14:27.000` | `000868.jpg` | A | Museum plaque is readable in the source frame. |
| `the-chief` | The Chief | `00:14:40.000` | `000881.jpg` | A | Museum plaque is readable in the source frame. |
| `la-duchesse` | La Duchesse | `00:16:29.000` | `000990.jpg` | B | Artwork matched to the named reference; local frame selected for clarity. |
| `dont-forgo-blueprints` | Don't Forgo These Blueprints | `00:19:36.000` | `001177.jpg` | A | Museum plaque is readable in the source frame. |
| `art-deco-circlets` | Art Deco Circlets | `00:18:37.000` | `001118.jpg` | B | Target sequence confirmed by the following in-game scope notification. |
| `venus-ivory` | Venus d'Algernon (Ivory) | `00:18:41.000` | `001122.jpg` | B | Target sequence and the subsequent in-game scope notification identify the ivory Venus. |
| `meteorite-fragment` | Meteorite Fragment | `00:18:52.000` | `001133.jpg` | A | Target sequence confirmed by the subsequent in-game scope notification. |
| `fertility-bronze` | Fertility Statue (Bronze) | `00:19:18.000` | `001159.jpg` | B | Target sequence confirmed by the subsequent in-game scope notification. |
| `coquard-bracelets` | Coquard Bracelets | `00:19:47.000` | `001188.jpg` | B | Target sequence confirmed by the subsequent in-game scope notification. |
| `coquard-carcanet-tanzanite` | Coquard Carcanet (Tanzanite) | `00:20:04.000` | `001205.jpg` | A | Target sequence and notification list identify the Tanzanite carcanet. |
| `oeuf-des-abimes` | Œuf de Coquard des abîmes | `00:20:14.000` | `001215.jpg` | A | Target sequence confirmed by the subsequent in-game scope notification. |
| `byzantine-hoops` | Byzantine Hoops | `00:21:27.000` | `001288.jpg` | B | Display plaque and subsequent in-game scope notification identify the hoops. |
| `oeuf-enchante` | Œuf de Coquard enchanté | `00:21:34.000` | `001295.jpg` | A | Target sequence confirmed by the subsequent in-game scope notification. |

## Extraction

Run from the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\extract-approved-target-images.ps1
```

The script reads `data/image-extraction-map.json`, scales the crops to the original video resolution, writes local WebP files, and removes unused primary-target images and marks only successfully generated secondary files as `approved` in `data/image-manifest.json`.

These screenshots come from third-party gameplay footage. Review attribution and usage requirements before wider redistribution.

## User photo batch — 2026-07-22
The files below were captured by the project owner and processed locally (crop + light enhancement).

- `art-deco-circlets` — Art Deco Circlets → `assets/images/targets/secondary/small-exhibits/art-deco-circlets.webp`
- `cooked` — Cooked → `assets/images/targets/secondary/paintings/cooked.webp`
- `sod-off` — Sod Off → `assets/images/targets/secondary/paintings/sod-off.webp`
- `orange-crush` — Orange Crush → `assets/images/targets/secondary/paintings/orange-crush.webp`
- `canis-hominem-edit` — Canis Hominem Edit → `assets/images/targets/secondary/paintings/canis-hominem-edit.webp`
- `art-deco-rings` — Art Deco Rings → `assets/images/targets/secondary/small-exhibits/art-deco-rings.webp`
- `antique-bands` — Antique Bands → `assets/images/targets/secondary/small-exhibits/antique-bands.webp`
- `do-you-see-me` — Do You See Me → `assets/images/targets/secondary/paintings/do-you-see-me.webp`
- `la-duchesse` — La Duchesse → `assets/images/targets/secondary/paintings/la-duchesse.webp`
- `byzantine-hoops` — Byzantine Hoops → `assets/images/targets/secondary/small-exhibits/byzantine-hoops.webp`
- `swingset-study-lxix` — Swingset Study No. LXIX → `assets/images/targets/secondary/paintings/swingset-study-lxix.webp`
- `hunter-becomes-hunted` — The Hunter Becomes the Hunted → `assets/images/targets/secondary/paintings/hunter-becomes-hunted.webp`
- `het-gouden-hondje` — Het Gouden Hondje → `assets/images/targets/secondary/paintings/het-gouden-hondje.webp`
- `forest-egg` — Œuf de Coquard verdoyant → `assets/images/targets/secondary/coquard-eggs/forest-egg.webp`
- `coquard-bracelets` — Coquard Bracelets → `assets/images/targets/secondary/small-exhibits/coquard-bracelets.webp`
- `fertility-gold` — Fertility Statue (Gold) → `assets/images/targets/secondary/small-exhibits/fertility-gold.webp`
- `dont-forgo-blueprints` — Don't Forgo These Blueprints → `assets/images/targets/secondary/paintings/dont-forgo-blueprints.webp`
- `meteorite-fragment` — Meteorite Fragment → `assets/images/targets/secondary/small-exhibits/meteorite-fragment.webp`
- `algernons-venus` — Venus d'Algernon (Marble) → `assets/images/targets/secondary/reinforced-displays/algernons-venus.webp`

### Newly mapped user-photo targets
- `marble-sabino-criollo` — Marble Sabino Criollo → `assets/images/targets/secondary/reinforced-displays/marble-sabino-criollo.webp`
- `coquard-carcanet-imperial-topaz` — Coquard Carcanet (Imperial Topaz) → `assets/images/targets/secondary/reinforced-displays/coquard-carcanet-imperial-topaz.webp`
- `gray-spinel-gemstone` — Gray Spinel Gemstone → `assets/images/targets/secondary/reinforced-displays/gray-spinel-gemstone.webp`

### Still missing a verified local image
- `memento-ruby` — Memento Non Mori (Ruby)
