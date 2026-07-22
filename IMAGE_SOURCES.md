# Target image sources

This file tracks the first manually verified local-image extraction batch.

Source video: [GTA Series Videos — Kortz Center scope-out footage](https://www.youtube.com/watch?v=sAd7OHSPPPA)

The final WebP files are extracted locally from the original downloaded video. The project does not hotlink the source video or third-party image files.

| Target ID | Target | Timestamp | Preview frame | Quality | Verification |
|---|---|---:|---:|:---:|---|
| `la-derniere-debauche` | La Dernière Débauche | `00:11:24.000` | `000685.jpg` | B | Primary-target overlay and matching artwork. |
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

The script reads `data/image-extraction-map.json`, scales the crops to the original video resolution, writes local WebP files, and marks only successfully generated files as `approved` in `data/image-manifest.json`.

These screenshots come from third-party gameplay footage. Review attribution and usage requirements before wider redistribution.
