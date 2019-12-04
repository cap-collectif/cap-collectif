// @flow

export const formatBigNumber = (number: number) => {
  return number
    .toString()
    .split('')
    .reverse()
    .join('')
    .replace(/([0-9]{3})/g, '$1 ')
    .split('')
    .reverse()
    .join('')
    .trim();
};
