// The labels and tap targets are drawn outside the mirrored groups, at
// coordinates `mirrorBounds` computes. If that math and the transform string
// react-native-svg actually applies ever disagree, every mirrored quadrant is
// labelled in the wrong place — so assert them against each other using
// react-native-svg's own parser.
import * as Matrix2D from 'react-native-svg/lib/commonjs/lib/Matrix2D';
import {parse} from 'react-native-svg/lib/commonjs/lib/extract/transform';

import {QUADRANT_SLOTS, SLOT_TRANSFORMS} from '../odontogram.constants';
import {QuadrantSlot} from '../odontogram.types';
import {mirrorBounds} from '../odontogram.utils';

const applyTransform = (slot: QuadrantSlot, x: number, y: number) => {
  const transform = SLOT_TRANSFORMS[slot];
  if (!transform) {
    return {x, y};
  }

  Matrix2D.reset();
  const parsed = parse(transform);
  Matrix2D.append(
    parsed[0]!,
    parsed[3]!,
    parsed[1]!,
    parsed[4]!,
    parsed[2]!,
    parsed[5]!,
  );
  const [a, b, c, d, tx, ty] = Matrix2D.toArray();

  return {x: a! * x + c! * y + tx!, y: b! * x + d! * y + ty!};
};

describe('quadrant transforms', () => {
  const bounds = [154, 30, 200, 90] as const;

  it.each(QUADRANT_SLOTS)(
    'places %s teeth where mirrorBounds says they are',
    slot => {
      const mirrored = mirrorBounds(bounds, slot);
      const corners = [
        applyTransform(slot, bounds[0], bounds[1]),
        applyTransform(slot, bounds[2], bounds[3]),
      ];

      expect(Math.min(...corners.map(corner => corner.x))).toBeCloseTo(
        mirrored[0],
      );
      expect(Math.min(...corners.map(corner => corner.y))).toBeCloseTo(
        mirrored[1],
      );
      expect(Math.max(...corners.map(corner => corner.x))).toBeCloseTo(
        mirrored[2],
      );
      expect(Math.max(...corners.map(corner => corner.y))).toBeCloseTo(
        mirrored[3],
      );
    },
  );
});
