export const EMAIL_SEPARATOR: string = ','

export const CONNECTION_NODES_PER_PAGE: number = 50

export const helpLinkTranslationKey: string = 'csv-import-help-link'

export type EmailInput = {
  email: string
  line: string
}

/**
 * Converts an array of strings into a single comma-separated string.
 * @param {string[]} array - The array of strings to be joined.
 * @returns {string} The joined string with each element separated by a comma and space, followed by a period. Returns an empty string if the array is empty.
 */
export const getListAsString = (array: string[]): string => {
  if (array.length === 0) return ''
  return array.join(', ') + '.'
  /**
   * Splits CSV content passed as a string into an array of lines.
   *
   * @param {string} content - The CSV content as a string.
   * @returns {string[]} An array of lines from the CSV content.
   */
}

/**
 * Extracts the line numbers from an array of objects.
 * @param {EmailInput[]} lines - An array of objects, each containing a "line" property.
 * @returns {string[]} An array of line numbers, indicating which lines met a specific condition in the imported .csv file.
 */
export const getLineNumbers = (lines: EmailInput[]): string[] => {
  return lines.map(item => item.line) || []
}
