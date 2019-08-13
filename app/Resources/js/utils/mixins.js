// @flow
import { css } from 'styled-components';

type ScreenSize = 'small' | 'medium' | 'large' | 'extra' // Those values are from the bootstrap values
// https://getbootstrap.com/docs/4.3/layout/overview/

type SizeMap = {
  [size: ScreenSize]: number
}

const sizeMap: SizeMap = {
  small: 576,
  medium: 768,
  large: 992,
  extra: 1200
};

export const breakpoint = (size: ScreenSize, innerCss: string) =>
  css`
    @media screen and (min-width: ${sizeMap[size]}px) {
      ${innerCss}
    }
  `;
