# Tree Flow Overhaul Task

## 6 TREE HEIGHT TIERS (industry-standard, based on JIS/landscape design)
- tiny:   〜0.3m  地被・草花 (グランドカバー)       minReach:0.3 maxReach:1.0
- low:    0.3〜1m  低木 (低灌木・ツツジ等)            minReach:0.8 maxReach:2.0
- medium: 1〜3m   中木 (灌木・ドウダンツツジ等)       minReach:1.5 maxReach:4.0  
- tall:   3〜6m   高木 (モミジ・ヤマボウシ等)          minReach:3.0 maxReach:7.0
- large:  6〜10m  大高木 (シンボルツリー・コニファー) minReach:5.0 maxReach:12.0
- huge:   10m〜   巨木 (ケヤキ・クスノキ等)           minReach:8.0 maxReach:999

## LIGHT TYPES PER HEIGHT
- tiny/low: ground-uplight (グランドアップライト), ground-light (地中埋込)
- medium/tall: garden-uplight (ガーデンアップライト), ground-light
- large/huge: garden-uplight (大型), wall-spotlight (ウォールアップライト)

## BEAM ANGLES
- 狭角: 〜45° (スポット) 
- 中角: 46〜120° (フラッド)
- 広角: 121°〜 (ワイドフラッド)

## VOLTAGE
- 12V: タカショーローボルトシステム (低圧・安全・省エネ)
- 24V: タカショーローボルトシステム (中規模向け)
- 100V: 一般家庭用コンセント (大型・高輝度向け)

## STEPS
1. schema.ts: add voltage column
2. seed.ts: expand garden-uplight to ~18 products (6 beam×3 voltage), add voltage data to all
3. api/index.ts: add voltage query param
4. selector.tsx: rewrite TREE_HEIGHTS (4→6), add treeStep states, multi-step wizard
5. Generate 2 new tree images: tiny.png, huge.png
6. Build verify

## STATUS
- [x] schema voltage column
- [x] seed expanded products (18 garden-uplight + all others = 57 total)
- [x] api voltage filter
- [x] selector 6 tiers + 5-step wizard
- [x] images tiny.png huge.png
- [x] build pass (clean, 0 TS errors)
