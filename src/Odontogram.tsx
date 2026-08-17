import React, {Fragment, memo, useCallback, useMemo} from 'react';
import {View} from 'react-native';

import Svg, {G, Rect, Text as SvgText} from 'react-native-svg';

import {
  DEFAULT_ARCH_GAP,
  DEFAULT_COLORS,
  DEFAULT_LABEL_FONT_SIZE,
  DEFAULT_MIN_TOUCH_SIZE,
  HIT_TARGET_COLOR,
  HIT_TARGET_OPACITY,
  OUTLINE_STROKE_WIDTH,
  SELECTED_STROKE_WIDTH,
  SLOT_TRANSFORMS,
  VIEW_BOX_PADDING,
} from './odontogram.constants';
import {
  IArchLayout,
  IOdontogramColors,
  IOdontogramProps,
  IToothConditionGroup,
  IToothPlacement,
  QuadrantSlot,
  ToothCode,
} from './odontogram.types';
import {
  boundsHeight,
  boundsToViewBox,
  boundsWidth,
  buildArchLayouts,
} from './odontogram.utils';
import {Tooth} from './Tooth';

interface IArchChartProps {
  layout: IArchLayout;
  width: number;
  gap: number;
  palette: IOdontogramColors;
  selected: ReadonlySet<ToothCode>;
  conditionByCode: ReadonlyMap<ToothCode, IToothConditionGroup>;
  showLabels: boolean;
  labelFontSize: number;
  minTouchSize: number;
  onToothPress?: IOdontogramProps['onToothPress'];
}

const ArchChart = memo<IArchChartProps>(
  ({
    layout,
    width,
    gap,
    palette,
    selected,
    conditionByCode,
    showLabels,
    labelFontSize,
    minTouchSize,
    onToothPress,
  }) => {
    const scale = width / boundsWidth(layout.viewBox);
    const height = boundsHeight(layout.viewBox) * scale;
    const fontSize = labelFontSize / scale;
    const touchSize = minTouchSize / scale;

    const slots = useMemo(() => {
      const grouped = new Map<QuadrantSlot, IToothPlacement[]>();
      layout.placements.forEach(placement => {
        const bucket = grouped.get(placement.slot);
        bucket
          ? bucket.push(placement)
          : grouped.set(placement.slot, [placement]);
      });
      return Array.from(grouped);
    }, [layout.placements]);

    const renderTooth = useCallback(
      (placement: IToothPlacement) => {
        const isSelected = selected.has(placement.info.code);
        const condition = conditionByCode.get(placement.info.code);

        return (
          <Tooth
            key={placement.info.code}
            paths={placement.paths}
            stroke={
              isSelected
                ? palette.selectedOutline
                : (condition?.outlineColor ??
                  condition?.fillColor ??
                  palette.outline)
            }
            strokeWidth={
              isSelected ? SELECTED_STROKE_WIDTH : OUTLINE_STROKE_WIDTH
            }
            fill={isSelected ? palette.selectedFill : condition?.fillColor}
          />
        );
      },
      [conditionByCode, palette, selected],
    );

    return (
      <Svg
        width={width}
        height={height}
        viewBox={boundsToViewBox(layout.viewBox)}
        style={{marginTop: gap}}>
        {slots.map(([slot, placements]) => (
          <G key={slot} transform={SLOT_TRANSFORMS[slot] || undefined}>
            {placements.map(renderTooth)}
          </G>
        ))}
        {layout.placements.map(placement => (
          <Fragment key={placement.info.code}>
            {showLabels ? (
              <SvgText
                x={placement.center.x}
                y={placement.center.y}
                dy={fontSize * 0.35}
                fill={palette.label}
                fontSize={fontSize}
                fontWeight="bold"
                textAnchor="middle">
                {placement.info.code}
              </SvgText>
            ) : null}
            {onToothPress ? (
              <Rect
                x={
                  placement.center.x -
                  Math.max(boundsWidth(placement.bounds), touchSize) / 2
                }
                y={
                  placement.center.y -
                  Math.max(boundsHeight(placement.bounds), touchSize) / 2
                }
                width={Math.max(boundsWidth(placement.bounds), touchSize)}
                height={Math.max(boundsHeight(placement.bounds), touchSize)}
                fill={HIT_TARGET_COLOR}
                opacity={HIT_TARGET_OPACITY}
                onPress={() =>
                  onToothPress(placement.info.code, placement.info)
                }
              />
            ) : null}
          </Fragment>
        ))}
      </Svg>
    );
  },
);

export const Odontogram = memo<IOdontogramProps>(
  ({
    width,
    dentition = 'permanent',
    arch = 'both',
    selected,
    conditions,
    colors,
    showLabels = true,
    readOnly = false,
    archGap = DEFAULT_ARCH_GAP,
    minTouchSize = DEFAULT_MIN_TOUCH_SIZE,
    labelFontSize = DEFAULT_LABEL_FONT_SIZE,
    lowerQuadrants = 'fdi',
    onToothPress,
    style,
    testID,
  }) => {
    const palette = useMemo(() => ({...DEFAULT_COLORS, ...colors}), [colors]);

    const layouts = useMemo(
      () =>
        buildArchLayouts({
          dentition,
          arch,
          lowerQuadrants,
          padding: VIEW_BOX_PADDING,
        }),
      [arch, dentition, lowerQuadrants],
    );

    const selectedSet = useMemo(() => new Set(selected ?? []), [selected]);

    const conditionByCode = useMemo(() => {
      const map = new Map<ToothCode, IToothConditionGroup>();
      conditions?.forEach(condition => {
        condition.teeth.forEach(code => map.set(code, condition));
      });
      return map;
    }, [conditions]);

    const handleToothPress = useCallback<
      NonNullable<IOdontogramProps['onToothPress']>
    >(
      (code, tooth) => {
        onToothPress?.(code, tooth);
      },
      [onToothPress],
    );

    return (
      <View style={style} testID={testID}>
        {layouts.map((layout, index) => (
          <ArchChart
            key={layout.arch}
            layout={layout}
            width={width}
            gap={index === 0 ? 0 : archGap}
            palette={palette}
            selected={selectedSet}
            conditionByCode={conditionByCode}
            showLabels={showLabels}
            labelFontSize={labelFontSize}
            minTouchSize={minTouchSize}
            onToothPress={
              readOnly || !onToothPress ? undefined : handleToothPress
            }
          />
        ))}
      </View>
    );
  },
);
