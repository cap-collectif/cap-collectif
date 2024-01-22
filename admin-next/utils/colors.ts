export type ColorRGB = {
    r: number;
    g: number;
    b: number;
};

export type ColorRGBA = {
    r: number | string;
    g: number | string;
    b: number | string;
    a: number | string;
};

export type ColorHSL = {
    h: number;
    s: number;
    l: number;
};

export const formatRgb = ({ r, g, b }: ColorRGB): string => `rgb(${r}, ${g}, ${b})`;

export const formatHsl = ({ h, s, l }: ColorHSL): string => `hsl(${h}, ${s}%, ${l}%)`;
// Source: https://css-tricks.com/converting-color-spaces-in-javascript/#hex-to-rgb
// Example: hexToRgb('#4211D0');
export const hexToRgb = (h: string): ColorRGB => {
    let r = 0;
    let g = 0;
    let b = 0;

    // 3 digits
    if (h.length === 4) {
        // @ts-ignore
        r = `0x${h[1]}${h[1]}`;
        // @ts-ignore
        g = `0x${h[2]}${h[2]}`;
        // @ts-ignore
        b = `0x${h[3]}${h[3]}`;

        // 6 digits
    } else if (h.length === 7) {
        // @ts-ignore
        r = `0x${h[1]}${h[2]}`;
        // @ts-ignore
        g = `0x${h[3]}${h[4]}`;
        // @ts-ignore
        b = `0x${h[5]}${h[6]}`;
    }

    return { r: +r, g: +g, b: +b };
};

export const hexToRgba = (h: string, opacity: number, asString?: boolean): string | ColorRGBA => {
    const rgba = {
        ...hexToRgb(h),
        a: opacity,
    };

    return asString ? `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})` : rgba;
};
export const rgbToHsl = (rgb: string): ColorHSL => {
    const sep = rgb.indexOf(',') > -1 ? ',' : ' ';
    const rgbSplit = rgb.substr(4).split(')')[0].split(sep);

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
