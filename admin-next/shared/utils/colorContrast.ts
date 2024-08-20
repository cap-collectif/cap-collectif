import fontColorContrast from 'font-color-contrast'

export const colorContrast = (color: string): string => (fontColorContrast(color) === '#ffffff' ? '#fff' : '#30363D')
