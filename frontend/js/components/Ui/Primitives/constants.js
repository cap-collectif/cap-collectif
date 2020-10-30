// @flow
import { SPACES_SCALES } from '~/styles/theme/base';

export const FontSize: {
  Xs: 'xs',
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
  Xl: 'xl',
  Xl2: '2xl',
  Xl3: '3xl',
  Xl4: '4xl',
  Xl5: '5xl',
  Xl6: '6xl',
} = {
  Xs: 'xs',
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
  Xl: 'xl',
  Xl2: '2xl',
  Xl3: '3xl',
  Xl4: '4xl',
  Xl5: '5xl',
  Xl6: '6xl',
};

export const FontWeight: {
  Hairline: 'hairline',
  Thin: 'thin',
  Light: 'light',
  Normal: 'normal',
  Medium: 'medium',
  Semibold: 'semibold',
  Bold: 'bold',
  Extrabold: 'extrabold',
  Black: 'black',
} = {
  Hairline: 'hairline',
  Thin: 'thin',
  Light: 'light',
  Normal: 'normal',
  Medium: 'medium',
  Semibold: 'semibold',
  Bold: 'bold',
  Extrabold: 'extrabold',
  Black: 'black',
};

export const LineHeight: {
  Normal: 'normal',
  None: 'none',
  Shorter: 'shorter',
  Short: 'short',
  Base: 'base',
  Tall: 'tall',
  Taller: 'taller',
} = {
  Normal: 'normal',
  None: 'none',
  Shorter: 'shorter',
  Short: 'short',
  Base: 'base',
  Tall: 'tall',
  Taller: 'taller',
};

export const LetterSpacing: {
  Tighter: 'tighter',
  Tight: 'tight',
  Normal: 'normal',
  Wide: 'wide',
  Wider: 'wider',
  Widest: 'widest',
} = {
  Tighter: 'tighter',
  Tight: 'tight',
  Normal: 'normal',
  Wide: 'wide',
  Wider: 'wider',
  Widest: 'widest',
};

export const Spacing = {
  None: Number(SPACES_SCALES[0]),
  Xs2: Number(SPACES_SCALES[1].replace('rem', '')) * 16,
  Xs: Number(SPACES_SCALES[2].replace('rem', '')) * 16,
  Base: Number(SPACES_SCALES[3].replace('rem', '')) * 16,
  Medium: Number(SPACES_SCALES[4].replace('rem', '')) * 16,
  Large: Number(SPACES_SCALES[5].replace('rem', '')) * 16,
  Xl: Number(SPACES_SCALES[6].replace('rem', '')) * 16,
  Xl2: Number(SPACES_SCALES[7].replace('rem', '')) * 16,
  Xl3: Number(SPACES_SCALES[8].replace('rem', '')) * 16,
};

export const HeadingSize: {
  Xl: 'xl',
  Lg: 'lg',
  Md: 'md',
  Sm: 'sm',
  Xs: 'xs',
} = {
  Xl: 'xl',
  Lg: 'lg',
  Md: 'md',
  Sm: 'sm',
  Xs: 'xs',
};
