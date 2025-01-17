export const EMAIL_SEPARATOR = ','

export const CONNECTION_NODES_PER_PAGE: number = 50

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
}

/**
 * Extracts the line numbers from an array of objects.
 * @param {EmailInput[]} lines - An array of objects, each containing a "line" property.
 * @returns {string[]} An array of line numbers, indicating which lines met a specific condition in the imported .csv file.
 */
export const getLineNumbers = (lines: EmailInput[]): string[] => {
  return lines.map(item => item.line)
}

/**
 * Splits a string into elements (emails), separated by a predefined separator
 *
 * @param {string} string - A string containing email addresses separated by the separator.
 * @returns {string[]} An array of email addresses.
 */
export const splitEmailsFromString = (string: string, separator: string = EMAIL_SEPARATOR): string[] => {
  if (string === '') {
    return []
  }
  return string?.split(separator)
}
