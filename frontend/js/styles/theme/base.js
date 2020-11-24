/* eslint-disable prefer-destructuring */
// @flow
import typography from '~/styles/theme/typography';
import colors from '~/styles/modules/colors';
import { pxToRem } from '~/utils/styles/mixins';
import { mediaQueryMobile, mediaQueryTablet } from '~/utils/sizes';

export const SPACES_SCALES = [
  0, // #0
  pxToRem(4), // #1
  pxToRem(8), // #2
  pxToRem(12), // #3
  pxToRem(16), // #4
  pxToRem(20), // #5
  pxToRem(24), // #6
  pxToRem(28), // #7
  pxToRem(32), // #8
  pxToRem(40), // #9
  pxToRem(48), // #10
  pxToRem(56), // #11
  pxToRem(64), // #12
  pxToRem(128), // #13
  pxToRem(256), // #14
  pxToRem(512), // #15
];

const breakpoints: any = [mediaQueryMobile.maxWidth, mediaQueryTablet.maxWidth];

const borderRadius: { [string]: number } = {
  normal: 4,
  button: 4,
  buttonQuickAction: 50,
  card: 4,
  modal: 4,
  tooltip: 4,
};

const boxShadow: { [string]: string } = {
  small: '0 2px 8px rgba(0, 0, 0, 0.1)',
  medium: '0 10px 50px rgba(0, 0, 0, 0.15)',
  big: '0 10px 99px rgba(0, 0, 0, 0.302)',
};

const border: { [string]: string } = {
  normal: '1px solid',
  button: '1px solid',
};

breakpoints.md = breakpoints[0];
breakpoints.lg = breakpoints[1];

export { breakpoints };

const baseTheme = {
  ...typography,
  colors,
  breakpoints,
  space: SPACES_SCALES,
  radii: borderRadius,
  shadows: boxShadow,
  borders: border,
};

export default baseTheme;
