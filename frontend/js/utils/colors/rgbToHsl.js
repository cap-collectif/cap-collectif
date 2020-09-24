// @flow
import type { ColorHSL } from './formatColor';

// Source: https://css-tricks.com/converting-color-spaces-in-javascript/#rgb-to-hsl
// Example: rgbToHsl('rgb(66,17,208)');
const rgbToHsl = (rgb: string): ColorHSL => {
  const sep = rgb.indexOf(',') > -1 ? ',' : ' ';
  const rgbSplit = rgb
    .substr(4)
    .split(')')[0]
    .split(sep);

  // Make r, g, and b fractions of 1
  const r = parseInt(rgbSplit[0], 10) / 255;
  const g = parseInt(rgbSplit[1], 10) / 255;
  const b = parseInt(rgbSplit[2], 10) / 255;

  // Find greatest and smallest channel values
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  // Calculate hue
  // No difference
  if (delta === 0) h = 0;
  // Red is max
  else if (cmax === r) h = ((g - b) / delta) % 6;
  // Green is max
  else if (cmax === g) h = (b - r) / delta + 2;
  // Blue is max
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  // Make negative hues positive behind 360°
  if (h < 0) h += 360;

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // Multiply l and s by 100
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
};

export default rgbToHsl;
