// @flow
import deburr from 'lodash/deburr';

export const cleanDomId = (id: string) => deburr(id).replace(/^[^a-z]+|[^\w:.-]+/gi, '');

export const capitalizeFirstLetter = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);
