// Renders the same layout the React Native component draws into plain SVG
// files, so geometry can be eyeballed without a simulator.
// Usage: yarn build && node scripts/preview.mjs [outDir]

import {mkdirSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));

// The barrel pulls in the component, and with it react-native — which plain
// Node cannot parse. Only the pure layout modules are needed here.
const {
  boundsToViewBox,
  buildArchLayouts,
} = require('../lib/odontogram.utils.js');
const {
  DEFAULT_COLORS,
  SLOT_TRANSFORMS,
} = require('../lib/odontogram.constants.js');

const WIDTH = 360;
const PADDING = 3;
const LABEL_FONT_SIZE = 10;

const toothMarkup = (placement, selected, background) => {
  const isSelected = selected.includes(placement.info.code);
  const stroke = isSelected
    ? DEFAULT_COLORS.selectedOutline
    : DEFAULT_COLORS.outline;
  const highlights = Array.isArray(placement.paths.lineHighlightPath)
    ? placement.paths.lineHighlightPath
    : [placement.paths.lineHighlightPath];

  return [
    `<path d="${placement.paths.outlinePath}" fill="none" stroke="${stroke}" stroke-width="${isSelected ? 2.4 : 2}" stroke-linecap="round" stroke-linejoin="round"/>`,
    isSelected || background
      ? `<path d="${placement.paths.shadowPath}" fill="${isSelected ? DEFAULT_COLORS.selectedFill : background}"/>`
      : '',
    ...highlights.map(
      d =>
        `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>`,
    ),
  ].join('');
};

const archMarkup = (layout, selected, conditions) => {
  const scale = WIDTH / (layout.viewBox[2] - layout.viewBox[0]);
  const height = (layout.viewBox[3] - layout.viewBox[1]) * scale;
  const fontSize = LABEL_FONT_SIZE / scale;

  const bySlot = new Map();
  layout.placements.forEach(placement => {
    const bucket = bySlot.get(placement.slot) ?? [];
    bucket.push(placement);
    bySlot.set(placement.slot, bucket);
  });

  const groups = Array.from(bySlot, ([slot, placements]) => {
    const transform = SLOT_TRANSFORMS[slot];
    const body = placements
      .map(placement =>
        toothMarkup(placement, selected, conditions[placement.info.code]),
      )
      .join('');
    return transform
      ? `<g transform="${transform}">${body}</g>`
      : `<g>${body}</g>`;
  }).join('');

  const labels = layout.placements
    .map(
      placement =>
        `<text x="${placement.center.x}" y="${placement.center.y}" dy="${fontSize * 0.35}" font-size="${fontSize}" font-weight="bold" fill="${DEFAULT_COLORS.label}" text-anchor="middle" font-family="Helvetica">${placement.info.code}</text>`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="${boundsToViewBox(layout.viewBox)}">${groups}${labels}</svg>`;
};

const page = (title, layouts, selected, conditions) => {
  const charts = layouts.map(layout =>
    archMarkup(layout, selected, conditions),
  );
  const heights = layouts.map(
    layout =>
      ((layout.viewBox[3] - layout.viewBox[1]) * WIDTH) /
      (layout.viewBox[2] - layout.viewBox[0]),
  );
  const total = heights.reduce((sum, value) => sum + value, 0);

  let offset = 0;
  const stacked = charts
    .map((chart, index) => {
      const inner = chart.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
      const layout = layouts[index];
      const scale = WIDTH / (layout.viewBox[2] - layout.viewBox[0]);
      const group = `<g transform="translate(0, ${offset}) scale(${scale}) translate(${-layout.viewBox[0]}, ${-layout.viewBox[1]})">${inner}</g>`;
      offset += heights[index];
      return group;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${total}" viewBox="0 0 ${WIDTH} ${total}"><title>${title}</title><rect width="${WIDTH}" height="${total}" fill="#ffffff"/>${stacked}</svg>`;
};

const outDir = resolve(here, '..', process.argv[2] ?? 'preview');
mkdirSync(outDir, {recursive: true});

const cases = [
  {
    file: 'permanent-lower-only.svg',
    dentition: 'permanent',
    arch: 'lower',
    lowerQuadrants: 'fdi',
    selected: ['36', '47'],
    conditions: {44: '#b37feb'},
  },
  {
    file: 'primary-upper-only.svg',
    dentition: 'primary',
    arch: 'upper',
    lowerQuadrants: 'fdi',
    selected: ['51', '65'],
    conditions: {},
  },
  {
    file: 'permanent-fdi.svg',
    dentition: 'permanent',
    lowerQuadrants: 'fdi',
    selected: ['11', '26', '36', '47'],
    conditions: {14: '#b37feb', 24: '#b37feb'},
  },
  {
    file: 'permanent-swapped.svg',
    dentition: 'permanent',
    lowerQuadrants: 'swapped',
    selected: ['11', '26', '36', '47'],
    conditions: {},
  },
  {
    file: 'primary-fdi.svg',
    dentition: 'primary',
    lowerQuadrants: 'fdi',
    selected: ['51', '65', '71', '84'],
    conditions: {},
  },
];

cases.forEach(
  ({file, dentition, arch = 'both', lowerQuadrants, selected, conditions}) => {
    const layouts = buildArchLayouts({
      dentition,
      arch,
      lowerQuadrants,
      padding: PADDING,
    });
    writeFileSync(
      resolve(outDir, file),
      page(file, layouts, selected, conditions),
    );
    process.stdout.write(`wrote ${file}\n`);
  },
);
