export const pxToRem = (px: number, designSystem?: boolean) => `${(px / (designSystem ? 14 : 10)).toFixed(3)}rem`
