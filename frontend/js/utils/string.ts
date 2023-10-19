import deburr from 'lodash/deburr'

export const cleanDomId = (id: string) => deburr(id).replace(/^[^a-z]+|[^\w:.-]+/gi, '')
export const capitalizeFirstLetter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)
export const isFloat = (value: any): boolean =>
  typeof value === 'number' && !Number.isNaN(value) && !Number.isInteger(value)
