// @flow
export const avatarNb = {
  small: 34,
  normal: 45,
  tiny: 16,
};

export const avatarPx = {
  small: `${avatarNb.small}px`,
  normal: `${avatarNb.normal}px`,
  tiny: `${avatarNb.tiny}px`,
};

export const bootstrapGrid = {
  xsMax: 767,
  smMin: 768,
  smMax: 991,
  mdMin: 992,
  mdMax: 1199,
  lgMin: 1200,
};

export const mediaQueryMobile = {
  minWidth: '481px',
  maxWidth: '767px',
};

export const mediaQueryTablet = {
  minWidth: '768px',
  maxWidth: '1024px',
};

const sizes = {
  avatarNb,
  avatarPx,
  bootstrapGrid,
};

export default sizes;
