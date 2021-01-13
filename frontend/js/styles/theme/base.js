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
  pxToRem(72), // #13
  pxToRem(128), // #14
  pxToRem(256), // #15
  pxToRem(512), // #16
];

const breakpoints: any = [mediaQueryMobile.maxWidth, mediaQueryTablet.maxWidth];

const borderRadius: { [string]: number } = {
  normal: 4,
  button: 4,
  buttonQuickAction: 50,
  card: 4,
  modal: 4,
  tags: 4,
  tooltip: 4,
  notifications: 4,
  toasts: 4,
  accordion: 8,
  poppin: 8,
};

export const boxShadow: { [string]: string } = {
  small: '0 2px 8px rgba(0, 0, 0, 0.1)',
  medium: '0 10px 50px rgba(0, 0, 0, 0.15)',
  big: '0 10px 99px rgba(0, 0, 0, 0.302)',
};

export const border: { [string]: string } = {
  normal: '1px solid',
  card: '1px solid',
  button: '1px solid',
  avatar: '2px solid',
};

breakpoints.md = breakpoints[0];
breakpoints.lg = breakpoints[1];

export { breakpoints };

const iconSizes: any = [
  SPACES_SCALES[3], // 12px
  SPACES_SCALES[4], // 16px
  SPACES_SCALES[6], // 24px
  SPACES_SCALES[8], // 32px
  SPACES_SCALES[10], // 48px
  SPACES_SCALES[12], // 64px
];

iconSizes.xs = iconSizes[0];
iconSizes.sm = iconSizes[1];
iconSizes.md = iconSizes[2];
iconSizes.lg = iconSizes[3];
iconSizes.xl = iconSizes[4];
iconSizes.xxl = iconSizes[5];

export { iconSizes };

const baseTheme = {
  ...typography,
  colors,
  breakpoints,
  iconSizes,
  space: SPACES_SCALES,
  sizes: SPACES_SCALES,
  radii: borderRadius,
  shadows: boxShadow,
  borders: border,
};

export default baseTheme;
