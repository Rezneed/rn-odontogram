import {VIEW_BOX_HEIGHT, VIEW_BOX_WIDTH} from '../odontogram.constants';
import {
  ArchSide,
  IArchLayout,
  LowerQuadrantNumbering,
} from '../odontogram.types';
import {
  boundsHeight,
  boundsToViewBox,
  boundsWidth,
  buildArchLayouts,
  dentitionOfCode,
  isPrimaryToothCode,
  mirrorBounds,
  padBounds,
  unionBounds,
} from '../odontogram.utils';

const layoutsOf = (
  dentition: 'permanent' | 'primary',
  lowerQuadrants: LowerQuadrantNumbering = 'fdi',
) => buildArchLayouts({dentition, arch: 'both', lowerQuadrants, padding: 0});

const codesOf = (layouts: IArchLayout[], arch: ArchSide) =>
  layouts
    .find(layout => layout.arch === arch)!
    .placements.map(placement => placement.info.code);

describe('tooth codes', () => {
  it('numbers the permanent upper arch as FDI quadrants 1 and 2', () => {
    expect(codesOf(layoutsOf('permanent'), 'upper')).toEqual([
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '21',
      '22',
      '23',
      '24',
      '25',
      '26',
      '27',
      '28',
    ]);
  });

  it('puts quadrant 4 on the left and quadrant 3 on the right of the lower arch', () => {
    const lower = layoutsOf('permanent')
      .find(layout => layout.arch === 'lower')!
      .placements.filter(placement => placement.info.index === 1);

    const left = lower.find(placement => placement.slot === 'bottomLeft')!;
    const right = lower.find(placement => placement.slot === 'bottomRight')!;

    expect(left.info.code).toBe('41');
    expect(right.info.code).toBe('31');
    expect(left.center.x).toBeLessThan(right.center.x);
  });

  it('mirrors the lower quadrants when asked to stay web-compatible', () => {
    const lower = layoutsOf('permanent', 'swapped')
      .find(layout => layout.arch === 'lower')!
      .placements.filter(placement => placement.info.index === 1);

    expect(lower.find(p => p.slot === 'bottomLeft')!.info.code).toBe('31');
    expect(lower.find(p => p.slot === 'bottomRight')!.info.code).toBe('41');
  });

  it('numbers primary teeth 51-85 and stops at the second molar', () => {
    const layouts = layoutsOf('primary');

    expect(codesOf(layouts, 'upper')).toEqual([
      '51',
      '52',
      '53',
      '54',
      '55',
      '61',
      '62',
      '63',
      '64',
      '65',
    ]);
    expect(codesOf(layouts, 'lower').sort()).toEqual([
      '71',
      '72',
      '73',
      '74',
      '75',
      '81',
      '82',
      '83',
      '84',
      '85',
    ]);
  });

  it('tells primary codes from permanent ones', () => {
    expect(isPrimaryToothCode('18')).toBe(false);
    expect(isPrimaryToothCode('48')).toBe(false);
    expect(isPrimaryToothCode('51')).toBe(true);
    expect(isPrimaryToothCode('85')).toBe(true);
    expect(dentitionOfCode('11')).toBe('permanent');
    expect(dentitionOfCode('75')).toBe('primary');
  });
});

describe('geometry', () => {
  it('mirrors bounds across the viewBox axes', () => {
    const bounds = [10, 20, 30, 50] as const;

    expect(mirrorBounds(bounds, 'topLeft')).toEqual([10, 20, 30, 50]);
    expect(mirrorBounds(bounds, 'topRight')).toEqual([
      VIEW_BOX_WIDTH - 30,
      20,
      VIEW_BOX_WIDTH - 10,
      50,
    ]);
    expect(mirrorBounds(bounds, 'bottomLeft')).toEqual([
      10,
      VIEW_BOX_HEIGHT - 50,
      30,
      VIEW_BOX_HEIGHT - 20,
    ]);
    expect(mirrorBounds(bounds, 'bottomRight')).toEqual([
      VIEW_BOX_WIDTH - 30,
      VIEW_BOX_HEIGHT - 50,
      VIEW_BOX_WIDTH - 10,
      VIEW_BOX_HEIGHT - 20,
    ]);
  });

  it('unions and pads bounds', () => {
    expect(
      unionBounds([
        [0, 0, 10, 10],
        [5, -5, 8, 20],
      ]),
    ).toEqual([0, -5, 10, 20]);
    expect(padBounds([0, 0, 10, 10], 2)).toEqual([-2, -2, 12, 12]);
  });

  it('formats a viewBox as origin plus size', () => {
    expect(boundsToViewBox([5, 10, 25, 40])).toBe('5 10 20 30');
  });

  it('crops each arch to the teeth it actually draws', () => {
    const [upper, lower] = layoutsOf('permanent');

    // Half the chart height at most — the arches no longer share one canvas.
    expect(boundsHeight(upper!.viewBox)).toBeLessThan(VIEW_BOX_HEIGHT / 2);
    expect(boundsHeight(lower!.viewBox)).toBeLessThan(VIEW_BOX_HEIGHT / 2);
    expect(upper!.viewBox[1]).toBeLessThan(lower!.viewBox[1]);
  });

  it('crops the primary chart tighter than the permanent one', () => {
    const [permanentUpper] = layoutsOf('permanent');
    const [primaryUpper] = layoutsOf('primary');

    expect(boundsWidth(primaryUpper!.viewBox)).toBeLessThan(
      boundsWidth(permanentUpper!.viewBox),
    );
    expect(boundsHeight(primaryUpper!.viewBox)).toBeLessThan(
      boundsHeight(permanentUpper!.viewBox),
    );
  });

  it('keeps both arches horizontally aligned so a stack looks like one mouth', () => {
    const [upper, lower] = layoutsOf('permanent');

    expect(boundsWidth(upper!.viewBox)).toBeCloseTo(
      boundsWidth(lower!.viewBox),
    );
    expect(upper!.viewBox[0]).toBeCloseTo(lower!.viewBox[0]);
  });
});
