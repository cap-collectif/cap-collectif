// @flow

// There is no spaces in connection path
export const formatConnectionPath = (
  path: string[],
  connectionKey: string,
  append: string = '',
): string => `${path.join(':')}:__${connectionKey}_connection${append}`.replace(/\s/g, '');
