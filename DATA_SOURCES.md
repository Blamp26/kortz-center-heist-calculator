# Data, sources and assumptions

Updated: **July 21, 2026**.

## Primary target

The calculator stores the primary target as its **repeat-sale base value**. For `La Dernière Débauche`, the current GTA Base table gives:

| Difficulty | Repeat sale | First weekly sale |
|---|---:|---:|
| Normal | GTA$481,250 | GTA$1,925,000 |
| Hard | GTA$529,375 | GTA$2,117,500 |

Formula:

```text
primary = repeat value × (first weekly sale ? 4 : 1) × (hard mode ? 1.1 : 1)
```

Later weekly paintings may use a different base value, so both the target name and amount are editable.

## Bag fill

Initial percentages come from the maintained Steam Community guide:

| Category | Bag fill per target |
|---|---:|
| Painting | 50% |
| Small exhibit without glass cutter | 10% |
| Coquard egg | 25% |
| Reinforced-display target | 30% |

Total capacity is calculated as `players × 100%`. The calculator then solves a 0/1 knapsack problem to maximize value.

## Bonuses

- Complete **Buyer's Request List**: GTA$50,000.
- **Elite Challenge**: GTA$50,000 on normal difficulty or GTA$100,000 on hard.
- Completing both conditions on hard gives GTA$150,000 in combined bonuses.

## Why secondary-target values are editable

Early guides disagree. Some tables appear to add an extra zero to storage-painting values, while ranges are reported for targets such as the Meteorite Fragment and Coquard Carcanet. Raf's in-game scope-out value should take priority over the starting table.

Therefore:

1. `data/loot.json` contains practical starting values compiled from multiple guides.
2. Every target value is editable in the interface.
3. Ranged or uncertain values are marked through `valueRange` and `sourceConfidence`.
4. Every target has `sourceIds` linking it to entries in the same JSON file.

## Links

The complete source list is stored in `data/loot.json` and shown in the calculator's **Data sources** dialog.
