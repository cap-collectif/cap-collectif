/* eslint-disable prefer-destructuring */
// @flow
import typography from '~/styles/theme/typography';
import colors from '~/styles/modules/colors';
import { pxToRem } from '~/utils/styles/mixins';
import { mediaQueryMobile, mediaQueryTablet } from '~/utils/sizes';

export const SPACES_SCALES = [
  0,
  pxToRem(4), // 2xs
  pxToRem(8), // xs
  pxToRem(16), // base
  pxToRem(32), // medium
  pxToRem(64), // large
  pxToRem(128), // xl
  pxToRem(256), // 2xl
  pxToRem(512), // 3xl
];

const breakpoints: any = [mediaQueryMobile.maxWidth, mediaQueryTablet.maxWidth];

breakpoints.md = breakpoints[0];
breakpoints.lg = breakpoints[1];

export { breakpoints };

const baseTheme = {
  ...typography,
  colors,
  breakpoints,
  space: SPACES_SCALES,
};

export default baseTheme;
