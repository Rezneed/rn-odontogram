import {TOOTH_BOUNDS} from './data/teeth.geometry';
import {QUADRANT_TEETH} from './data/teeth.paths';
import {
  PRIMARY_QUADRANT_OFFSET,
  QUADRANT_SLOTS,
  quadrantOf,
  SLOT_ARCH,
  TEETH_PER_QUADRANT,
  VIEW_BOX_HEIGHT,
  VIEW_BOX_WIDTH,
} from './odontogram.constants';
import {
  Arch,
  ArchSide,
  Dentition,
  IArchLayout,
  IToothPlacement,
  LowerQuadrantNumbering,
  QuadrantSlot,
  TBounds,
  ToothCode,
} from './odontogram.types';

const BOUNDS_BY_NAME = new Map(
  TOOTH_BOUNDS.map(item => [item.name, item.bounds]),
);

export const mirrorBounds = (bounds: TBounds, slot: QuadrantSlot): TBounds => {
  const [minX, minY, maxX, maxY] = bounds;
  const flipX = slot === 'topRight' || slot === 'bottomRight';
  const flipY = slot === 'bottomLeft' || slot === 'bottomRight';

  const x = flipX
    ? [VIEW_BOX_WIDTH - maxX, VIEW_BOX_WIDTH - minX]
    : [minX, maxX];
  const y = flipY
    ? [VIEW_BOX_HEIGHT - maxY, VIEW_BOX_HEIGHT - minY]
    : [minY, maxY];

  return [x[0]!, y[0]!, x[1]!, y[1]!];
};

export const unionBounds = (list: readonly TBounds[]): TBounds =>
  list.reduce(
    (acc, bounds) => [
      Math.min(acc[0], bounds[0]),
      Math.min(acc[1], bounds[1]),
      Math.max(acc[2], bounds[2]),
      Math.max(acc[3], bounds[3]),
    ],
    [Infinity, Infinity, -Infinity, -Infinity] as TBounds,
  );

export const padBounds = (bounds: TBounds, padding: number): TBounds => [
  bounds[0] - padding,
  bounds[1] - padding,
  bounds[2] + padding,
  bounds[3] + padding,
];

export const boundsToViewBox = (bounds: TBounds): string =>
  `${bounds[0]} ${bounds[1]} ${bounds[2] - bounds[0]} ${bounds[3] - bounds[1]}`;

export const boundsWidth = (bounds: TBounds) => bounds[2] - bounds[0];

export const boundsHeight = (bounds: TBounds) => bounds[3] - bounds[1];

export const isPrimaryToothCode = (code: ToothCode): boolean =>
  Number(code[0]) > PRIMARY_QUADRANT_OFFSET;

export const dentitionOfCode = (code: ToothCode): Dentition =>
  isPrimaryToothCode(code) ? 'primary' : 'permanent';

const archesFor = (arch: Arch): ArchSide[] =>
  arch === 'both' ? ['upper', 'lower'] : [arch];

const placementsForArch = (
  side: ArchSide,
  dentition: Dentition,
  lowerQuadrants: LowerQuadrantNumbering,
): IToothPlacement[] => {
  const teeth = QUADRANT_TEETH.slice(0, TEETH_PER_QUADRANT[dentition]);

  return QUADRANT_SLOTS.filter(slot => SLOT_ARCH[slot] === side).flatMap(
    slot => {
      const quadrant = quadrantOf(slot, dentition, lowerQuadrants);

      return teeth.map(paths => {
        const bounds = mirrorBounds(BOUNDS_BY_NAME.get(paths.name)!, slot);

        return {
          slot,
          paths,
          bounds,
          center: {
            x: (bounds[0] + bounds[2]) / 2,
            y: (bounds[1] + bounds[3]) / 2,
          },
          info: {
            code: `${quadrant}${paths.name}`,
            quadrant,
            index: Number(paths.name),
            type: paths.type,
            dentition,
            arch: side,
          },
        };
      });
    },
  );
};

export const buildArchLayouts = (options: {
  dentition: Dentition;
  arch: Arch;
  lowerQuadrants: LowerQuadrantNumbering;
  padding: number;
}): IArchLayout[] =>
  archesFor(options.arch).map(side => {
    const placements = placementsForArch(
      side,
      options.dentition,
      options.lowerQuadrants,
    );

    return {
      arch: side,
      viewBox: padBounds(
        unionBounds(placements.map(placement => placement.bounds)),
        options.padding,
      ),
      placements,
    };
  });
