import { SPACES_SCALES } from '~/styles/theme/base'

export const FontWeight = {
  Hairline: 'hairline',
  Thin: 'thin',
  Light: 'light',
  Normal: 'normal',
  Medium: 'medium',
  Semibold: 'semibold',
  Bold: 'bold',
  Extrabold: 'extrabold',
  Black: 'black',
}
export const LineHeight = {
  SM: 'sm',
  S: 's',
  Base: 'base',
  Normal: 'normal',
  M: 'm',
  L: 'l',
  XL: 'xl',
}
export const LetterSpacing: {
  Tighter: 'tighter'
  Tight: 'tight'
  Normal: 'normal'
  Wide: 'wide'
  Wider: 'wider'
  Widest: 'widest'
} = {
  Tighter: 'tighter',
  Tight: 'tight',
  Normal: 'normal',
  Wide: 'wide',
  Wider: 'wider',
  Widest: 'widest',
}
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
}
