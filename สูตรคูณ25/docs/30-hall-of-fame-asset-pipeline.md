# Hall of Fame Asset Pipeline

Date: 2026-08-01  
Status: Done

## Goal

Prepare the supplied Hall of Fame artwork as deterministic runtime assets without modifying the source files.

## Kanban loop

| Card | Work item | Status |
|---|---|---|
| HFA-01 | Inspect source dimensions, alpha channels, and frame separation | Done |
| HFA-02 | Normalize the background to 2560 x 1440 | Done |
| HFA-03 | Normalize podiums and avatar frames into 512 px runtime cells | Done |
| HFA-04 | Recover transparent alpha from black-backed celebration VFX | Done |
| HFA-05 | Generate a UTF-8 runtime manifest and visually inspect outputs | Done |

## Runtime contract

| Asset | Runtime size | Layout |
|---|---:|---|
| `background.png` | 2560 x 1440 | 16:9 scene |
| `podiums.png` | 1536 x 512 | 3 columns x 1 row |
| `avatar-frames.png` | 2048 x 512 | 4 columns x 1 row |
| `celebration-vfx.png` | 3072 x 1024 | 6 columns x 2 rows |

Every sprite cell is 512 x 512 pixels. Frame coordinates, source bounds, output bounds, and pivots are recorded in `assets/processed/hall-of-fame/manifest.json`.

## Pipeline

Run from the project root:

```powershell
python tools/build-hall-of-fame-assets.py
```

The build is deterministic and writes only to `assets/processed/hall-of-fame`. The original artwork under `assets` remains unchanged.

## VFX repair

The supplied celebration sheet had an opaque black background. The pipeline derives alpha from additive luminance, removes near-black pixels, and un-premultiplies the recovered colors so the glow remains bright under normal alpha blending.

## Acceptance results

- All output dimensions match the runtime contract.
- Podium and avatar sheets contain real transparency.
- Celebration VFX contains real transparency instead of baked black.
- No source image is overwritten.
- Manifest text is encoded as UTF-8.

