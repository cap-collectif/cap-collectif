// @ts-nocheck
import type { ColorRGB, ColorRGBA } from '@shared/utils/colors'

// Source: https://css-tricks.com/converting-color-spaces-in-javascript/#hex-to-rgb
// Example: hexToRgb('#4211D0');
const hexToRgb = (h: string): ColorRGB => {
  let r = 0
  let g = 0
  let b = 0

  // 3 digits
  if (h.length === 4) {
    r = `0x${h[1]}${h[1]}`
    g = `0x${h[2]}${h[2]}`
    b = `0x${h[3]}${h[3]}` // 6 digits
  } else if (h.length === 7) {
    r = `0x${h[1]}${h[2]}`
    g = `0x${h[3]}${h[4]}`
    b = `0x${h[5]}${h[6]}`
  }

  return {
    r: +r,
    g: +g,
    b: +b,
  }
}

export const hexToRgba = (h: string, opacity: number, asString?: boolean): string | ColorRGBA => {
  const rgba = { ...hexToRgb(h), a: opacity }
  return asString ? `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})` : rgba
}
export default hexToRgb
