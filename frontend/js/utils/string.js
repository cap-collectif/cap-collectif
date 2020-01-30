// @flow
import deburr from 'lodash/deburr';

export const cleanDomId = (id: string) => deburr(id).replace(/^[^a-z]+|[^\w:.-]+/gi, '');
