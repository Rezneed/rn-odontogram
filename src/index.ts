export {Odontogram} from './Odontogram';
export {Tooth} from './Tooth';

export {
  DEFAULT_COLORS,
  PRIMARY_QUADRANT_OFFSET,
  TEETH_PER_QUADRANT,
  VIEW_BOX_HEIGHT,
  VIEW_BOX_WIDTH,
  quadrantOf,
} from './odontogram.constants';

export {
  boundsToViewBox,
  buildArchLayouts,
  dentitionOfCode,
  isPrimaryToothCode,
  mirrorBounds,
  padBounds,
  unionBounds,
} from './odontogram.utils';

export {QUADRANT_TEETH} from './data/teeth.paths';
export {TOOTH_BOUNDS} from './data/teeth.geometry';

export type {
  Arch,
  ArchSide,
  Dentition,
  IArchLayout,
  IOdontogramColors,
  IOdontogramProps,
  IToothBounds,
  IToothConditionGroup,
  IToothInfo,
  IToothPath,
  IToothPlacement,
  LowerQuadrantNumbering,
  QuadrantSlot,
  TBounds,
  ToothCode,
} from './odontogram.types';
