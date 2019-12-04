// @flow
export const isHTML = (value: string): boolean => {
  return /<[a-z][\s\S]*>/i.test(value);
};
