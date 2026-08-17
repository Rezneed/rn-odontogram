import {
  ArchSide,
  Dentition,
  IOdontogramColors,
  LowerQuadrantNumbering,
  QuadrantSlot,
} from './odontogram.types';

export const VIEW_BOX_WIDTH = 409;
export const VIEW_BOX_HEIGHT = 694;

export const QUADRANT_SLOTS: readonly QuadrantSlot[] = [
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
];

export const SLOT_TRANSFORMS: Record<QuadrantSlot, string> = {
  topLeft: '',
  topRight: `scale(-1, 1) translate(${-VIEW_BOX_WIDTH}, 0)`,
  bottomLeft: `scale(1, -1) translate(0, ${-VIEW_BOX_HEIGHT})`,
  bottomRight: `scale(-1, -1) translate(${-VIEW_BOX_WIDTH}, ${-VIEW_BOX_HEIGHT})`,
};

export const SLOT_ARCH: Record<QuadrantSlot, ArchSide> = {
  topLeft: 'upper',
  topRight: 'upper',
  bottomLeft: 'lower',
  bottomRight: 'lower',
};

/** Baby teeth stop at the 2nd molar — no 3rd molar, unlike the permanent set. */
export const TEETH_PER_QUADRANT: Record<Dentition, number> = {
  permanent: 8,
  primary: 5,
};

/** Primary quadrants are the permanent ones shifted by 4 (1-4 → 5-8). */
export const PRIMARY_QUADRANT_OFFSET = 4;

const UPPER_QUADRANTS: Record<'topLeft' | 'topRight', number> = {
  topLeft: 1,
  topRight: 2,
};

export const LOWER_QUADRANTS: Record<
  LowerQuadrantNumbering,
  Record<'bottomLeft' | 'bottomRight', number>
> = {
  fdi: {bottomRight: 3, bottomLeft: 4},
  swapped: {bottomLeft: 3, bottomRight: 4},
};

export const quadrantOf = (
  slot: QuadrantSlot,
  dentition: Dentition,
  lowerQuadrants: LowerQuadrantNumbering,
): number => {
  const base =
    slot === 'topLeft' || slot === 'topRight'
      ? UPPER_QUADRANTS[slot]
      : LOWER_QUADRANTS[lowerQuadrants][slot];

  return dentition === 'primary' ? base + PRIMARY_QUADRANT_OFFSET : base;
};

export const DEFAULT_COLORS: IOdontogramColors = {
  outline: '#8a98be',
  selectedFill: '#c6ccf8',
  selectedOutline: '#3e5edc',
  label: '#1f2937',
};

/** Half of the 2px outline stroke plus a hair, so nothing gets clipped. */
export const VIEW_BOX_PADDING = 3;

export const OUTLINE_STROKE_WIDTH = 2;
export const SELECTED_STROKE_WIDTH = 2.4;
export const HIGHLIGHT_STROKE_WIDTH = 1;

export const DEFAULT_MIN_TOUCH_SIZE = 32;
export const DEFAULT_LABEL_FONT_SIZE = 10;
export const DEFAULT_ARCH_GAP = 0;

/**
 * A fully transparent shape is not reliably hit-tested by react-native-svg, so
 * the tap targets carry a fill that is one gray level away from invisible.
 */
export const HIT_TARGET_OPACITY = 0.004;
export const HIT_TARGET_COLOR = '#000000';
