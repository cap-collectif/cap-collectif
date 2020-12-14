// @flow

export const formatConnectionPath = (path: string[], connectionKey: string): string =>
  `${path.join(':')}:__${connectionKey}_connection`;
