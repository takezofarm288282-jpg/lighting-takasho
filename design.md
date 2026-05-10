# Design Direction — タカショー 外構照明セレクター

## Brand
- **Brand**: タカショー (Takasho) 外構照明総合カタログ 2026
- **Tone**: Premium, professional, outdoor living

## Colors
```css
--color-bg:        #0d1a0d;   /* very dark green-black */
--color-surface:   #152015;   /* dark green surface */
--color-surface2:  #1e2e1e;   /* lighter green surface */
--color-border:    #2d4a2d;   /* green border */
--color-accent:    #c9a84c;   /* gold accent */
--color-accent2:   #e8c96a;   /* lighter gold hover */
--color-text:      #f0ede6;   /* warm white */
--color-text-muted:#9aab9a;   /* muted green-white */
--color-success:   #4ade80;
--color-danger:    #f87171;
```

## Typography
- **Display / Headings**: Noto Serif JP (elegant, Japanese-first)
- **Body / UI**: Noto Sans JP (clean, readable)
- **Numbers / Prices**: Oswald (strong, western numerics)
- Scale: 12 / 14 / 16 / 18 / 24 / 32 / 48px

## Layout
- Max width: 1200px centered
- Rounded corners: 12px (cards), 8px (buttons), 24px (pills)
- Grid: 12-column with generous gutters
- Card shadows: subtle glow with accent tint

## Imagery & Iconography
- Lucide icons (web), Phosphor (mobile)
- Location icons: house, trees, car, waves, layers, fence
- Lighting type icons matching each category

## Motion
- Page load: fade-in + slide-up stagger
- Card hover: lift + gold border glow
- Step transitions: slide horizontally

## Components
- `StepCard` — location/type selection card with icon + label
- `ProductCard` — product with image, name, model no, price, specs chips
- `EstimatePanel` — sticky bottom panel showing selected items + total
- `FilterBar` — price range / lumen / color temp filters
