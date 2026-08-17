import React, {Fragment, memo} from 'react';

import {Path} from 'react-native-svg';

import {HIGHLIGHT_STROKE_WIDTH} from './odontogram.constants';
import {IToothPath} from './odontogram.types';

interface IToothProps {
  paths: IToothPath;
  stroke: string;
  strokeWidth: number;
  fill?: string;
}

export const Tooth = memo<IToothProps>(({paths, stroke, strokeWidth, fill}) => {
  const highlights = Array.isArray(paths.lineHighlightPath)
    ? paths.lineHighlightPath
    : [paths.lineHighlightPath];

  return (
    <Fragment>
      <Path
        d={paths.outlinePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {fill ? <Path d={paths.shadowPath} fill={fill} /> : null}
      {highlights.map(highlight => (
        <Path
          key={highlight}
          d={highlight}
          fill="none"
          stroke={stroke}
          strokeWidth={HIGHLIGHT_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Fragment>
  );
});
