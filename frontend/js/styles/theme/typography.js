// @flow
import { pxToRem } from '~/utils/styles/mixins';

const typography = {
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  lineHeights: {
    XL: pxToRem(64),
    L: pxToRem(48),
    M: pxToRem(32),
    base: pxToRem(24),
    S: pxToRem(16),
  },
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  fonts: {
    heading: `OpenSans, Helvetica, Arial, sans-serif`,
    body: `OpenSans, Helvetica, Arial, sans-serif`,
    input: `Roboto, Helvetica, Arial, sans-serif`,
  },
  fontSizes: [
    0, // #0
    pxToRem(11), // #1
    pxToRem(13), // #2
    pxToRem(14), // #3
    pxToRem(18), // #4
    pxToRem(24), // #5
    pxToRem(33), // #6
    pxToRem(44), // #7
  ],
};

export type FontSizes = $Values<$PropertyType<typeof typography, 'fontSizes'>>;
export type Fonts = $Keys<$PropertyType<typeof typography, 'fonts'>>;
export type FontWeights = $Keys<$PropertyType<typeof typography, 'fontWeights'>>;
export type LineHeights = $Keys<$PropertyType<typeof typography, 'lineHeights'>>;
export type LetterSpacings = $Keys<$PropertyType<typeof typography, 'letterSpacings'>>;

export default typography;
