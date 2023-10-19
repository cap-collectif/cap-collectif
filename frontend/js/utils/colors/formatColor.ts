export type ColorRGB = {
  r: number
  g: number
  b: number
}
export type ColorRGBA = {
  r: number | string
  g: number | string
  b: number | string
  a: number | string
}
export type ColorHSL = {
  h: number
  s: number
  l: number
}
export const formatRgb = ({ r, g, b }: ColorRGB): string => `rgb(${r}, ${g}, ${b})`
export const formatHsl = ({ h, s, l }: ColorHSL): string => `hsl(${h}, ${s}%, ${l}%)`
