import {StyleProp, ViewStyle} from 'react-native';

export type ToothCode = string;

export type Dentition = 'permanent' | 'primary';

export type Arch = 'both' | 'upper' | 'lower';

export type ArchSide = 'upper' | 'lower';

/**
 * Which FDI digit the two lower quadrants get.
 *
 * `fdi` — anatomically correct: quadrant 3 is the patient's lower left, drawn
 * on the right of the chart (the chart faces the patient).
 * `swapped` — what `react-odontogram` (and therefore rezneed-business-web)
 * does: quadrant 3 is drawn on the left of the chart. Only for staying
 * bug-compatible with codes already stored by such a chart.
 */
export type LowerQuadrantNumbering = 'fdi' | 'swapped';

export type QuadrantSlot =
  'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

/** `[minX, minY, maxX, maxY]` in viewBox units. */
export type TBounds = readonly [number, number, number, number];

export interface IToothPath {
  name: string;
  type: string;
  outlinePath: string;
  shadowPath: string;
  lineHighlightPath: string | string[];
}

export interface IToothBounds {
  name: string;
  bounds: TBounds;
}

export interface IToothInfo {
  code: ToothCode;
  quadrant: number;
  index: number;
  type: string;
  dentition: Dentition;
  arch: ArchSide;
}

export interface IToothConditionGroup {
  label?: string;
  teeth: ToothCode[];
  fillColor: string;
  outlineColor?: string;
}

export interface IOdontogramColors {
  outline: string;
  selectedFill: string;
  selectedOutline: string;
  label: string;
}

export interface IToothPlacement {
  info: IToothInfo;
  slot: QuadrantSlot;
  paths: IToothPath;
  bounds: TBounds;
  center: {x: number; y: number};
}

export interface IArchLayout {
  arch: ArchSide;
  viewBox: TBounds;
  placements: IToothPlacement[];
}

export interface IOdontogramProps {
  /** Rendered width in px — each arch is scaled to fill it. */
  width: number;
  dentition?: Dentition;
  arch?: Arch;
  selected?: readonly ToothCode[];
  conditions?: readonly IToothConditionGroup[];
  colors?: Partial<IOdontogramColors>;
  showLabels?: boolean;
  readOnly?: boolean;
  /** Vertical space between the two arches, in px. */
  archGap?: number;
  /** Smallest tap target per tooth, in px. */
  minTouchSize?: number;
  labelFontSize?: number;
  lowerQuadrants?: LowerQuadrantNumbering;
  onToothPress?: (code: ToothCode, tooth: IToothInfo) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
