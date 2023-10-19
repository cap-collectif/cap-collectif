import fontColorContrast from 'font-color-contrast'
import colors from '~/styles/modules/colors'

export const colorContrast = (color: string): string =>
  fontColorContrast(color) === '#ffffff' ? colors.white : colors.dark
