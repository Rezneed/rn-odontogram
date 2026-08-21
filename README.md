# @rezneed/rn-odontogram

Interactive dental chart (odontogram) for **React Native**, drawn with
[`react-native-svg`](https://github.com/software-mansion/react-native-svg).
Supports the permanent (FDI 11–48) and primary (FDI 51–85) dentition, per-tooth
selection, per-tooth condition colouring and read-only display.

It is the React Native counterpart of the web
[`react-odontogram`](https://github.com/biomathcode/react-odontogram), rewritten
so that everything the web version needs the DOM for — cropping the canvas,
labelling teeth, primary quadrants — is part of the component instead.

```
┌─ upper arch ─────────────┐
│  18 17 … 11 │ 21 … 27 28 │   each arch is its own <Svg>, cropped to the
├─ lower arch ─────────────┤   teeth it actually draws, so nothing is
│  48 47 … 41 │ 31 … 37 38 │   scaled down by empty canvas
└──────────────────────────┘
```

## Install

Published to npm as [`@rezneed/rn-odontogram`](https://www.npmjs.com/package/@rezneed/rn-odontogram):

```bash
yarn add @rezneed/rn-odontogram
```

`react-native-svg` is a peer dependency. Every React Native app here already has
it; if not: `yarn add react-native-svg`.

The tarball is built on publish (`prepack` → `tsc` → `lib/`), so `lib/` is never
committed. Bumping the app = change the version in `package.json`, `yarn install`.

## Versioning

Plain semver, starting at **1.0.0** (the API below is what the app depends on):

| Change                                                                          | Bump            | Example                                           |
| ------------------------------------------------------------------------------- | --------------- | ------------------------------------------------- |
| a prop is removed or renamed, a default changes, tooth codes come out different | major → `2.0.0` | making `lowerQuadrants: 'fdi'` the only behaviour |
| a new prop or export, existing calls unaffected                                 | minor → `1.1.0` | adding `onToothLongPress`                         |
| a fix with the same API                                                         | patch → `1.0.1` | tap target off by a few px                        |

Release: bump `version` in `package.json` → `yarn test && yarn check` → commit →
publish a GitHub Release whose tag is `v<version>`. The `Publish` workflow
(`.github/workflows/publish.yml`) checks the tag against `package.json`, builds and
runs `npm publish`. Auth is npm **trusted publishing** (OIDC from GitHub Actions —
no token stored anywhere); it is configured once on npmjs.com under the package's
_Settings → Trusted Publisher_ (`Rezneed` / `rn-odontogram` / `publish.yml`). A
version that is already on npm is skipped, so re-running a release is safe.

## Usage

```tsx
import {useCallback, useState} from 'react';
import {Odontogram, ToothCode} from '@rezneed/rn-odontogram';

export const TeethPicker = ({width}: {width: number}) => {
  const [selected, setSelected] = useState<ToothCode[]>([]);

  const onToothPress = useCallback((code: ToothCode) => {
    setSelected(previous =>
      previous.includes(code)
        ? previous.filter(item => item !== code)
        : [...previous, code],
    );
  }, []);

  return (
    <Odontogram
      width={width}
      dentition="permanent"
      selected={selected}
      onToothPress={onToothPress}
      conditions={[
        {label: 'treated', teeth: ['16', '26'], fillColor: '#b37feb'},
      ]}
    />
  );
};
```

Selection is **controlled** — the component never keeps its own copy, so a
`selected` change is reflected immediately (no remount tricks needed).

Read-only display, the way the customer plan tab uses it — no `onToothPress`, so
no tap targets are rendered at all:

```tsx
<Odontogram
  readOnly
  width={chartWidth}
  dentition={dentition}
  selected={plannedTeeth}
  archGap={14}
  colors={{selectedFill: '#F0EBFE', selectedOutline: '#8E59FF'}}
  lowerQuadrants="swapped"
/>
```

`width` is required — measure the container with `onLayout` and render the chart
once the width is known. Tooth codes are **strings** (`'11'`, `'75'`); an API that
returns numbers needs `.map(String)`.

## Props

| Prop             | Type                           | Default       | Description                                                                                     |
| ---------------- | ------------------------------ | ------------- | ----------------------------------------------------------------------------------------------- |
| `width`          | `number`                       | —             | **Required.** Rendered width in px; each arch fills it and its height follows the aspect ratio. |
| `dentition`      | `'permanent' \| 'primary'`     | `'permanent'` | 8 teeth per quadrant (11–48) or 5 (51–85).                                                      |
| `arch`           | `'both' \| 'upper' \| 'lower'` | `'both'`      | Which arch(es) to draw.                                                                         |
| `selected`       | `ToothCode[]`                  | `[]`          | FDI codes painted as selected.                                                                  |
| `conditions`     | `IToothConditionGroup[]`       | —             | Static per-tooth colouring, e.g. already-treated teeth. Selection wins over a condition.        |
| `colors`         | `Partial<IOdontogramColors>`   | see below     | `outline`, `selectedFill`, `selectedOutline`, `label`.                                          |
| `showLabels`     | `boolean`                      | `true`        | Tooth number drawn on each tooth.                                                               |
| `labelFontSize`  | `number`                       | `10`          | Label size in px (scaled into viewBox units internally).                                        |
| `readOnly`       | `boolean`                      | `false`       | Drops all tap targets.                                                                          |
| `onToothPress`   | `(code, tooth) => void`        | —             | Called with the FDI code and the tooth's metadata. Without it the chart is not interactive.     |
| `minTouchSize`   | `number`                       | `32`          | Minimum tap target per tooth in px — small incisors get an enlarged hit box.                    |
| `archGap`        | `number`                       | `0`           | Vertical gap between the two arches in px.                                                      |
| `lowerQuadrants` | `'fdi' \| 'swapped'`           | `'fdi'`       | See below.                                                                                      |
| `style`          | `StyleProp<ViewStyle>`         | —             | Wrapper style.                                                                                  |

Default colours:

```ts
{outline: '#8a98be', selectedFill: '#c6ccf8', selectedOutline: '#3e5edc', label: '#1f2937'}
```

`IToothConditionGroup`:

```ts
{label?: string; teeth: ToothCode[]; fillColor: string; outlineColor?: string}
```

## `lowerQuadrants` — the FDI caveat

The chart is drawn facing the patient, so the patient's right side is on the
left of the screen: quadrant 1 top-left, quadrant 2 top-right, quadrant **4**
bottom-left and quadrant **3** bottom-right. That is `lowerQuadrants: 'fdi'`,
the default and the anatomically correct mapping.

`react-odontogram` numbers the lower arch the other way round (quadrant 3
bottom-left), and `rezneed-business-web` stores codes produced by that chart.
Pass `lowerQuadrants="swapped"` to reproduce it when the codes must line up with
data already collected on the web.

## Helpers

```ts
import {
  buildArchLayouts, // pure layout: arch viewBoxes + tooth placements
  dentitionOfCode, // '75' → 'primary'
  isPrimaryToothCode, // '75' → true
  QUADRANT_TEETH, // raw path data of one quadrant
  TOOTH_BOUNDS, // generated per-tooth bounding boxes
} from '@rezneed/rn-odontogram';
```

`buildArchLayouts` is what the component renders from — useful for tests or a
custom renderer.

## Development

```bash
yarn install
yarn test        # pure layout/geometry tests
yarn check       # tsc --noEmit
yarn build       # → lib/
yarn geometry    # regenerate src/data/teeth.geometry.ts from the path data
node scripts/preview.mjs   # after build: writes preview/*.svg to eyeball geometry
```

`src/data/teeth.geometry.ts` is generated — the bounding box of every tooth is
computed from its path data at build time, which is what lets the component crop
its viewBox and place labels without measuring rendered nodes (React Native has
no `getBBox`).

## Attribution

The SVG tooth path data in `src/data/teeth.paths.ts` is ported from
[`react-odontogram`](https://github.com/biomathcode/react-odontogram) v0.5.6,
MIT licensed, © biomathcode. Everything else is an original implementation. See
`LICENSE` for both notices.
